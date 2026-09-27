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
import * as THREE from "three";
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
// camera that moves (which would pull the bodies off their slots). The launch
// frames the galactic core just up-left of the name, the band running
// diagonally through the hero, brighter there; scrolling turns the sky so the
// core drifts out to the left and the band settles to a subtler backdrop.
const SKY_YAW_TRAVEL = 0.9;
const SKY_GAIN_HERO = 0.27;
const SKY_GAIN_REST = 0.17;
// yaw that puts the core at the same spot on screen for any aspect (a
// narrow phone view would otherwise leave it off-screen)
const coreYaw = (aspect) => THREE.MathUtils.clamp(-0.13 + (aspect - 1.78) * 0.118, -0.3, -0.05);
const smooth = (x) => {
  x = Math.min(1, Math.max(0, x));
  return x * x * (3 - 2 * x);
};
function TurningSky({ quality }) {
  const ref = useRef();
  const gain = useRef(SKY_GAIN_HERO);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const p = scrollState.progress;
    ref.current.rotation.set(0.04 + p * 0.12, coreYaw(camera.aspect) + p * SKY_YAW_TRAVEL, 0);
    gain.current = SKY_GAIN_REST + (SKY_GAIN_HERO - SKY_GAIN_REST) * (1 - smooth(p / 0.22));
  });
  return (
    <group ref={ref}>
      <Starfield quality={quality} gainRef={gain} detailCore />
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
