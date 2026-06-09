// Starfield.jsx — deep-space backdrop: pure black space and white stars,
// nothing else. The whole group follows the camera each frame so the stars
// read as infinitely far away no matter how long the journey gets.
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

const RADIUS = 300;

export default function Starfield({ quality = "high" }) {
  const groupRef = useRef();
  const starCount = quality === "low" ? 1500 : quality === "medium" ? 3500 : 8000;

  useFrame(({ camera }) => {
    if (groupRef.current) groupRef.current.position.copy(camera.position);
  });

  return (
    <group ref={groupRef}>
      <Stars radius={RADIUS} depth={60} count={starCount} factor={4} saturation={0} fade speed={0.4} />
    </group>
  );
}
