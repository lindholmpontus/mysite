// SpaceDust.jsx — faint world-anchored dust motes that make speed READABLE.
// The starfield is camera-locked (infinitely far → zero parallax) and the warp
// streaks are deliberately whisper-faint, so without something near the camera
// the flight has no motion cue. These motes live in WORLD space inside a box
// that wraps around the camera (a mote that falls behind reappears ahead), so
// they stream past at exactly the ship's true speed — gentle drift while
// parked, a rush at warp.
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { journeyState } from "../journey/journeyConfig";

const HALF = 42; // wrap-box half-extent around the camera

// deterministic RNG so the layout is render-pure (same trick as Asteroids)
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const wrap = (v, c) => {
  // wrap a world coordinate into [c - HALF, c + HALF)
  const d = (v - c + HALF) % (2 * HALF);
  return c + (d < 0 ? d + 2 * HALF : d) - HALF;
};

export default function SpaceDust({ count = 380 }) {
  const pointsRef = useRef();

  const base = useMemo(() => {
    const rand = mulberry32(91);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < arr.length; i++) arr[i] = (rand() - 0.5) * 2 * HALF;
    return arr;
  }, [count]);

  useFrame(({ camera }) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const attr = pts.geometry.attributes.position;
    const a = attr.array;
    const { x: cx, y: cy, z: cz } = camera.position;
    for (let i = 0; i < a.length; i += 3) {
      a[i] = wrap(base[i], cx);
      a[i + 1] = wrap(base[i + 1], cy);
      a[i + 2] = wrap(base[i + 2], cz);
    }
    attr.needsUpdate = true;
    // a touch brighter at speed, near-invisible while parked
    pts.material.opacity = 0.16 + journeyState.warp * 0.3;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(base), 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#b9c4e0"
        size={0.16}
        sizeAttenuation
        transparent
        opacity={0.16}
        depthWrite={false}
      />
    </points>
  );
}
