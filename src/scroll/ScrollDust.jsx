// ScrollDust.jsx — near-field dust in front of the (still) camera that
// streams upward as you scroll down: real parallax (near motes move faster
// than far ones), and a fast fling of the scroll wheel stretches them into
// faint speed lines. Gives the page depth — you're moving through space, not
// scrolling a flat page over a backdrop.
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "./scrollState";

const BOX = { x: 34, y: 22, zNear: 6, zFar: 70 };
const WORLD_PER_PX = 0.02; // how far the dust field moves per scrolled pixel
const STREAK_TIME = 0.06; // s of motion blur

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function ScrollDust({ count = 320 }) {
  const pointsRef = useRef();
  const linesRef = useRef();

  const { base, dots, lines } = useMemo(() => {
    const rand = mulberry32(17);
    const base = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      base[i * 3] = (rand() * 2 - 1) * BOX.x;
      base[i * 3 + 1] = (rand() * 2 - 1) * BOX.y;
      base[i * 3 + 2] = -(BOX.zNear + rand() * (BOX.zFar - BOX.zNear));
    }
    const dots = new THREE.BufferGeometry();
    dots.setAttribute("position", new THREE.BufferAttribute(new Float32Array(base), 3));
    const lines = new THREE.BufferGeometry();
    lines.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 6), 3));
    const col = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) col.set([1, 1, 1, 0, 0, 0], i * 6);
    lines.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { base, dots, lines };
  }, [count]);

  useFrame(() => {
    const p = pointsRef.current;
    const l = linesRef.current;
    if (!p || !l) return;
    // the field slides up with the scroll, wrapping vertically
    const shift = scrollState.y * WORLD_PER_PX;
    const a = p.geometry.attributes.position.array;
    const span = BOX.y * 2;
    for (let i = 0; i < a.length; i += 3) {
      let y = base[i + 1] + shift;
      y = ((((y + BOX.y) % span) + span) % span) - BOX.y;
      a[i + 1] = y;
    }
    p.geometry.attributes.position.needsUpdate = true;

    // streaks trail DOWN (the motes move up as you scroll down) by how far
    // they travel in STREAK_TIME at the current scroll speed
    const len = scrollState.velocity * WORLD_PER_PX * STREAK_TIME;
    l.visible = Math.abs(len) > 0.08;
    if (l.visible) {
      const la = l.geometry.attributes.position.array;
      for (let i = 0, j = 0; i < a.length; i += 3, j += 6) {
        la[j] = la[j + 3] = a[i];
        la[j + 1] = a[i + 1];
        la[j + 4] = a[i + 1] - len;
        la[j + 2] = la[j + 5] = a[i + 2];
      }
      l.geometry.attributes.position.needsUpdate = true;
      l.material.opacity = Math.min(0.5, Math.abs(len) * 0.12);
    }
  });

  return (
    <>
      <points ref={pointsRef} geometry={dots} frustumCulled={false}>
        <pointsMaterial color="#b9c4e0" size={0.12} sizeAttenuation transparent opacity={0.28} depthWrite={false} />
      </points>
      <lineSegments ref={linesRef} geometry={lines} frustumCulled={false} visible={false}>
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
