// Asteroids.jsx — a decorative instanced belt of slowly drifting rocks.
// Adapted from the old space/Asteroid.jsx (deterministic layout, single draw call).
import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Asteroids({
  count = 120,
  innerRadius = 95,
  outerRadius = 135,
  ySpread = 8,
  position = [0, 0, 0],
}) {
  const groupRef = useRef();
  const meshRef = useRef();

  const instances = useMemo(() => {
    const rand = mulberry32(42);
    const items = [];
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = innerRadius + rand() * (outerRadius - innerRadius);
      items.push({
        position: [Math.cos(angle) * radius, (rand() - 0.5) * ySpread, Math.sin(angle) * radius],
        rotation: [rand() * Math.PI, rand() * Math.PI, 0],
        scale: 0.25 + rand() * 0.9,
      });
    }
    return items;
  }, [count, innerRadius, outerRadius, ySpread]);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    instances.forEach((inst, i) => {
      dummy.position.set(...inst.position);
      dummy.rotation.set(...inst.rotation);
      dummy.scale.setScalar(inst.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [instances]);

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.008;
  });

  return (
    <group ref={groupRef} position={position}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#4b5563" flatShading roughness={1} />
      </instancedMesh>
    </group>
  );
}
