// WarpStreaks.jsx — hyperspace speed-lines. A camera-locked tube of thin
// additive streaks that race past while traveling; invisible when parked.
// Opacity and stretch are driven by journeyState.warp, so the harder you
// scroll, the more it feels like a jump to lightspeed.
/* eslint-disable react-hooks/immutability -- intentional per-frame instance updates */
import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { journeyState } from "./journeyConfig";

const COUNT = 170;
const dummy = new THREE.Object3D();

// deterministic RNG so the streak layout is render-pure (same trick as Asteroids)
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1337);

function spawn(p) {
  const ang = rand() * Math.PI * 2;
  const rad = 3.5 + rand() * 12;
  p.x = Math.cos(ang) * rad;
  p.y = Math.sin(ang) * rad;
  p.len = 3 + rand() * 7;
  return p;
}

export default function WarpStreaks() {
  const { camera } = useThree();
  const groupRef = useRef();
  const instRef = useRef();

  const parts = useMemo(
    () =>
      Array.from({ length: COUNT }, () => {
        const p = spawn({});
        p.z = 8 - rand() * 110; // scattered along the tube
        return p;
      }),
    []
  );

  // priority -1: after the CameraRig (-2), so the tube tracks this frame's camera
  useFrame((_, delta) => {
    const g = groupRef.current;
    const m = instRef.current;
    if (!g || !m) return;

    const warp = journeyState.warp;
    const on = warp > 0.06;
    g.visible = on;
    if (!on) return;

    // lock the tube to the camera so streaks exist in view space
    g.position.copy(camera.position);
    g.quaternion.copy(camera.quaternion);

    const dt = Math.min(delta, 1 / 30);
    const v = journeyState.speed * 1.2 + 14 * warp; // streaks gently outrun the ship
    const stretch = 0.2 + warp * 1.1;

    for (let i = 0; i < COUNT; i++) {
      const p = parts[i];
      p.z += v * dt; // camera forward is -Z, so passing objects move toward +Z
      if (p.z > 8) {
        spawn(p);
        p.z -= 112;
      }
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(1, 1, p.len * stretch);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    // barely-visible — just the faintest suggestion of motion, not beams
    m.material.opacity = Math.min(1, (warp - 0.06) * 2) * 0.035;
  }, -1);

  return (
    <group ref={groupRef} visible={false}>
      <instancedMesh ref={instRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.045, 0.045, 1]} />
        <meshBasicMaterial
          color="#9fc1ff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
