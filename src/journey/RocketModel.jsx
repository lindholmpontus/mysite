// RocketModel.jsx — the stylized low-poly ship geometry (carried over from the
// free-flight version). Nose points -Z, exhaust points +Z.
import React from "react";
import * as THREE from "three";

export default function RocketModel({ exhaustRef, lightRef }) {
  return (
    <group>
      {/* fuselage */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.45, 1.6, 8, 16]} />
        <meshStandardMaterial color="#cdd6e6" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* nose cone */}
      <mesh position={[0, 0, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.42, 1.0, 16]} />
        <meshStandardMaterial color="#aeb8cc" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* cockpit */}
      <mesh position={[0, 0.28, -0.5]}>
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshStandardMaterial
          color="#0b1a33"
          metalness={0.3}
          roughness={0.1}
          emissive="#1a3a66"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* swept wings */}
      <mesh position={[0.9, 0, 0.5]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[1.4, 0.08, 0.9]} />
        <meshStandardMaterial color="#9aa5bd" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.9, 0, 0.5]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[1.4, 0.08, 0.9]} />
        <meshStandardMaterial color="#9aa5bd" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* wingtip accent lights */}
      <mesh position={[1.55, 0, 0.6]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ff5b5b" emissive="#ff2222" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <mesh position={[-1.55, 0, 0.6]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#5bff8a" emissive="#22ff55" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* engine housing + glowing disc */}
      <mesh position={[0, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#1b2a44" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 1.28]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial color="#7fb4ff" emissive="#4d9bff" emissiveIntensity={3} toneMapped={false} />
      </mesh>

      {/* engine plume — soft additive cone, stretched by warp. The geometry is
          translated so its BASE sits at the mesh origin (the engine disc):
          scale.y then stretches the tail BACKWARD only — a center-anchored
          cone grew through the hull and poked out past the nose at full warp.
          Vertex colors fade to black toward the tail tip (black = invisible
          under additive blending): the plume points almost straight AT the
          camera, and a uniform double-sided cone projected end-on read as a
          solid detached pillar running off the bottom of the screen. */}
      <mesh ref={exhaustRef} position={[0, 0, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry
          args={[0.18, 2.4, 16, 6, true]}
          onUpdate={(g) => {
            g.translate(0, 1.2, 0);
            const pos = g.attributes.position;
            const col = new Float32Array(pos.count * 3);
            for (let i = 0; i < pos.count; i++) {
              const f = Math.max(0, 1 - pos.getY(i) / 2.4); // 1 at engine, 0 at tip
              col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = f * f;
            }
            g.setAttribute("color", new THREE.BufferAttribute(col, 3));
          }}
        />
        <meshBasicMaterial
          color="#6ea8ff"
          vertexColors
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* engine glow light */}
      <pointLight ref={lightRef} position={[0, 0, 1.5]} color="#5b9dff" intensity={1.2} distance={10} decay={2} />
    </group>
  );
}
