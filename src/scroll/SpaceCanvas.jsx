// SpaceCanvas.jsx — the fixed WebGL layer behind the scrolling page. The
// camera never moves: the sky turns slowly with overall scroll progress, the
// near-field dust streams past, and every body (the sun in the hero, one
// planet per section) is pinned to its slot element in the page via
// useAnchor — so the page's own native scroll carries them in and out.
import React, { Suspense, memo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import Starfield from "../scene/Starfield";
import Planet from "../scene/Planet";
import Sun from "../scene/Sun";
import { SUN } from "../scene/planets.config";
import { isSoftwareRenderer } from "../journey/journeyConfig";
import ScrollDust from "./ScrollDust";
import { useAnchor } from "./useAnchor";
import { sampleScroll, scrollState } from "./scrollState";
import { SCROLL_PLANETS } from "./scrollConfig";

export const CAMERA_FOV = 30; // narrow: planets near the screen edges stay round

// sample the page scroll once per frame, before anything reads it
function ScrollSampler() {
  useFrame((_, dt) => sampleScroll(dt), -2);
  return null;
}

// the sky turns a little over the whole page: a sense of travel without a
// camera that moves (which would pull the bodies off their slots). It starts
// on a fainter stretch of the Milky Way crossing the view diagonally — this
// narrow lens magnifies the bright core into a brown haze — and turns toward
// the core as you near the end.
const SKY_YAW_START = 0.95;
const SKY_YAW_TRAVEL = -0.75;
function TurningSky({ quality }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const p = scrollState.progress;
    ref.current.rotation.set(0.1 + p * 0.12, SKY_YAW_START + p * SKY_YAW_TRAVEL, 0);
  });
  return (
    <group ref={ref}>
      <Starfield quality={quality} skyBrightness={0.16} />
    </group>
  );
}

function AnchoredPlanet({ entry, slotRef, quality }) {
  const groupRef = useRef();
  useAnchor(slotRef, groupRef, entry.planet.radius, entry.fill);
  return <Planet planet={entry.planet} quality={quality} groupRef={groupRef} sunPos={entry.sunPos} />;
}

function AnchoredSun({ slotRef }) {
  const groupRef = useRef();
  useAnchor(slotRef, groupRef, SUN.radius, 1, { entrance: false, slack: 0 });
  return <Sun groupRef={groupRef} light={false} glow brightness={1.9} />;
}

function SpaceCanvasInner({ quality = "high", slots }) {
  const dpr = isSoftwareRenderer() ? 0.75 : quality === "high" ? [1, 1.75] : [1, 1.5];
  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 0], fov: CAMERA_FOV, near: 0.1, far: 2200 }}
      gl={{ antialias: quality !== "low", powerPreference: "high-performance", stencil: false }}
      style={{ position: "fixed", inset: 0, background: "#000000", pointerEvents: "none" }}
    >
      <ScrollSampler />
      <Suspense fallback={null}>
        <TurningSky quality={quality} />
        {quality !== "low" && <ScrollDust count={quality === "medium" ? 200 : 320} />}
        <AnchoredSun slotRef={slots.sun} />
        {SCROLL_PLANETS.map((entry) => (
          <AnchoredPlanet key={entry.planet.id} entry={entry} slotRef={slots[entry.planet.id]} quality={quality} />
        ))}
        {/* compile shaders + upload textures behind the boot screen */}
        <Preload all />
      </Suspense>

      {quality === "high" && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.8} luminanceThreshold={0.95} luminanceSmoothing={0.2} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </Canvas>
  );
}

const SpaceCanvas = memo(SpaceCanvasInner);
export default SpaceCanvas;
