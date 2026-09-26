// SpaceDust.jsx — faint world-anchored dust motes that make speed READABLE.
// The starfield is camera-locked (infinitely far → zero parallax), so without
// something near the camera the flight has no motion cue. These motes live in
// WORLD space inside a box that wraps around the camera (a mote that falls
// behind reappears ahead), so they stream past at exactly the ship's true
// speed. In flight each mote also draws a streak trailing along the ship's
// velocity — a camera's motion blur, with real parallax: near motes smear
// long, far ones barely — so the jump to cruise reads as speed lines.
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { journeyState } from "../journey/journeyConfig";

const HALF = 42; // wrap-box half-extent around the camera
const EXPOSURE = 0.05; // s — streak length = speed * exposure

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
  const streakRef = useRef();

  const { base, dots, streaks } = useMemo(() => {
    const rand = mulberry32(91);
    const base = new Float32Array(count * 3);
    for (let i = 0; i < base.length; i++) base[i] = (rand() - 0.5) * 2 * HALF;

    const dots = new THREE.BufferGeometry();
    dots.setAttribute("position", new THREE.BufferAttribute(new Float32Array(base), 3));

    // two vertices per mote: head (bright) and tail (fades to black = nothing
    // under additive blending)
    const streaks = new THREE.BufferGeometry();
    streaks.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 6), 3));
    const col = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) col.set([1, 1, 1, 0, 0, 0], i * 6);
    streaks.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { base, dots, streaks };
  }, [count]);

  useFrame(({ camera }) => {
    const pts = pointsRef.current;
    const lines = streakRef.current;
    if (!pts || !lines) return;
    const { x: cx, y: cy, z: cz } = camera.position;
    const a = pts.geometry.attributes.position.array;
    for (let i = 0; i < a.length; i += 3) {
      a[i] = wrap(base[i], cx);
      a[i + 1] = wrap(base[i + 1], cy);
      a[i + 2] = wrap(base[i + 2], cz);
    }
    pts.geometry.attributes.position.needsUpdate = true;
    // a touch brighter at speed, near-invisible while parked
    const warp = journeyState.warp;
    pts.material.opacity = 0.16 + warp * 0.3;

    const len = journeyState.speed * EXPOSURE;
    lines.visible = len > 0.05;
    if (lines.visible) {
      const d = journeyState.dir;
      const l = lines.geometry.attributes.position.array;
      for (let i = 0, j = 0; i < a.length; i += 3, j += 6) {
        l[j] = a[i];
        l[j + 1] = a[i + 1];
        l[j + 2] = a[i + 2];
        l[j + 3] = a[i] - d.x * len;
        l[j + 4] = a[i + 1] - d.y * len;
        l[j + 5] = a[i + 2] - d.z * len;
      }
      lines.geometry.attributes.position.needsUpdate = true;
      lines.material.opacity = Math.min(1, warp * 1.4) * 0.55;
    }
  });

  return (
    <>
      <points ref={pointsRef} geometry={dots} frustumCulled={false}>
        <pointsMaterial
          color="#b9c4e0"
          size={0.16}
          sizeAttenuation
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </points>
      <lineSegments ref={streakRef} geometry={streaks} frustumCulled={false} visible={false}>
        <lineBasicMaterial
          color="#c8d6ff"
          vertexColors
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </>
  );
}
