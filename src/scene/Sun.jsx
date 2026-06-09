// Sun.jsx — the star at the center; also the scene's key light. Rendered as a
// crisp emissive disc (no corona shells, no bloom flare) for the realistic look.
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { SUN } from "./planets.config";

export default function Sun() {
  const meshRef = useRef();
  const texture = useTexture(SUN.texture);

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.03;
  });

  return (
    <group>
      {/* the star surface — emissive but tone mapped, so it stays under the
          bloom threshold and renders as a sharp disc */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[SUN.radius, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          emissive="#ffaa33"
          emissiveMap={texture}
          emissiveIntensity={1.15}
        />
      </mesh>

      {/* light sources — distance covers the full (scaled-up) journey route */}
      <pointLight position={[0, 0, 0]} intensity={3.2} decay={0} distance={1500} color="#fff0d8" />
    </group>
  );
}
