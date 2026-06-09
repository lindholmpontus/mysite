// JourneyCanvas.jsx — the R3F <Canvas> host for the journey: camera defaults,
// Suspense, and quality-gated post FX (bloom + warp-driven chromatic
// aberration). The canvas never takes pointer events — the page scroll IS the
// input.
import React, { Suspense, memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import JourneyWorld from "./JourneyWorld";
import { CAM_FOV, journeyState } from "./journeyConfig";

// The aberration effect keeps this exact Vector2 instance as its uniform, so
// mutating it per frame drives the effect with no ref plumbing. Driven by the
// ship's warp — at full speed the frame fringes like the light itself is being
// dragged; zero while parked.
const CA_OFFSET = new THREE.Vector2(0, 0);

function AberrationDriver() {
  useFrame(() => {
    const o = journeyState.warp * journeyState.warp * 0.0016;
    CA_OFFSET.set(o, o * 0.5);
  });
  return null;
}

function JourneyCanvasInner({
  quality = "high",
  progress,
  flightMV,
  speedMV,
  warpMV,
  activeIndex,
  reticle,
}) {
  // 1.75 cap: indistinguishable from 2 on a moving scene, but meaningfully
  // cheaper on 4K displays — smoothness means never dropping below 60
  const dpr = quality === "high" ? [1, 1.75] : [1, 1.5];

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 5, 62], fov: CAM_FOV, near: 0.5, far: 2200 }}
      gl={{ antialias: quality !== "low", powerPreference: "high-performance", stencil: false }}
      style={{ position: "absolute", inset: 0, background: "#000000", pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <JourneyWorld
          quality={quality}
          progress={progress}
          flightMV={flightMV}
          speedMV={speedMV}
          warpMV={warpMV}
          activeIndex={activeIndex}
          reticle={reticle}
        />
      </Suspense>

      {quality === "high" && (
        <>
          <EffectComposer multisampling={0}>
            {/* high threshold: only true emissives (sun, engine, streaks) bloom —
                a lower one lets the star field sum into a hazy veil */}
            <Bloom intensity={0.8} luminanceThreshold={0.95} luminanceSmoothing={0.2} />
            {/* color fringing at warp only — offset is driven per-frame by
                AberrationDriver; it stays zero while parked */}
            <ChromaticAberration offset={CA_OFFSET} />
            {/* the composer bypasses the renderer's tone mapping; without this
                pass the whole scene renders lifted and washed-out */}
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
          <AberrationDriver />
        </>
      )}
    </Canvas>
  );
}

// Memoized so HUD-driven re-renders of the parent only reach the canvas tree
// when something it actually uses (quality / activeIndex) changes.
const JourneyCanvas = memo(JourneyCanvasInner);
export default JourneyCanvas;
