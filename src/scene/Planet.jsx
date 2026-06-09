// Planet.jsx — a spinning textured sphere (no glow shells — realistic look)
// and an optional ring (Saturn = Skills). It carries no label of its own; the
// screen-space lock-on reticle (PlanetReticle) names the active world.
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import SaturnRings from "./SaturnRings";

export default function Planet({ planet }) {
  const meshRef = useRef();
  const texture = useTexture(planet.texture);

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * planet.spin;
  });

  return (
    <group position={planet.position}>
      {/* axial tilt — realism, and it keeps Saturn's rings reading as an ellipse
          (not an edge-on sliver) now that the camera flies at the planet's height */}
      <group rotation={planet.tilt || [0, 0, 0]}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[planet.radius, 64, 64]} />
          <meshStandardMaterial map={texture} metalness={0.1} roughness={0.85} />
        </mesh>

        {/* Saturn-style ring system */}
        {planet.hasRing && <SaturnRings radius={planet.radius} color={planet.accent} />}
      </group>
    </group>
  );
}
