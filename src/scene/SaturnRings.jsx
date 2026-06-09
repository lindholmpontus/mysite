// SaturnRings.jsx — a realistic ring system: a procedurally-banded shader ring
// (fine ridges + Cassini/Encke-style dark gaps + soft inner/outer fade) plus a
// belt of orbiting debris "stones". Lives in the planet's local space and is
// tilted into a ring plane.
import React, { useMemo, useRef, useEffect } from "react";
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

const ringVertex = /* glsl */ `
  varying float vR;
  varying float vAng;
  uniform float uInner;
  uniform float uOuter;
  void main() {
    float r = length(position.xy);
    vR = (r - uInner) / (uOuter - uInner);
    vAng = atan(position.y, position.x);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ringFragment = /* glsl */ `
  varying float vR;
  varying float vAng;
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    float r = clamp(vR, 0.0, 1.0);

    // overall density: broad swells + finer ridges for a grooved look
    float dens = 0.55 + 0.45 * sin(r * 26.0);
    dens *= 0.78 + 0.22 * sin(r * 96.0 + 1.7);
    dens = clamp(dens, 0.0, 1.0);

    // dark divisions (Cassini-like) carved out at a few radii
    float gaps = 1.0;
    gaps *= 1.0 - 0.92 * exp(-pow((r - 0.46) / 0.018, 2.0)); // wide Cassini gap
    gaps *= 1.0 - 0.65 * exp(-pow((r - 0.70) / 0.010, 2.0)); // Encke-ish gap
    gaps *= 1.0 - 0.45 * exp(-pow((r - 0.20) / 0.012, 2.0)); // inner gap

    // soft inner & outer edges
    float edge = smoothstep(0.0, 0.05, r) * smoothstep(1.0, 0.93, r);

    // faint azimuthal shading so it isn't perfectly uniform
    float az = 0.88 + 0.12 * sin(vAng * 2.0);

    float alpha = dens * gaps * edge * az * uOpacity;
    vec3 col = uColor * (0.7 + 0.5 * dens);
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

function DebrisBelt({ inner, outer, color, count = 320 }) {
  const meshRef = useRef();
  const beltRef = useRef();

  const instances = useMemo(() => {
    const rand = mulberry32(7);
    const items = [];
    // skip the big gap band so debris thins out there too
    for (let i = 0; i < count; i++) {
      let rr = rand();
      const radius = inner + rr * (outer - inner);
      const ang = rand() * Math.PI * 2;
      items.push({
        position: [Math.cos(ang) * radius, Math.sin(ang) * radius, (rand() - 0.5) * (outer - inner) * 0.04],
        rotation: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
        scale: (0.04 + rand() * 0.12) * (outer - inner) * 0.18,
      });
    }
    return items;
  }, [inner, outer, count]);

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
    if (beltRef.current) beltRef.current.rotation.z += dt * 0.04;
  });

  return (
    <group ref={beltRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} roughness={1} metalness={0} flatShading />
      </instancedMesh>
    </group>
  );
}

export default function SaturnRings({ radius, color = "#e8c87a" }) {
  const inner = radius * 1.35;
  const outer = radius * 2.45;

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms: {
          uInner: { value: inner },
          uOuter: { value: outer },
          uColor: { value: new THREE.Color(color) },
          uOpacity: { value: 0.9 },
        },
        vertexShader: ringVertex,
        fragmentShader: ringFragment,
      }),
    [inner, outer, color]
  );

  return (
    // tilt the whole system into a ring plane
    <group rotation={[-Math.PI / 2.2, 0, 0]}>
      <mesh material={material}>
        <ringGeometry args={[inner, outer, 256, 1]} />
      </mesh>
      <DebrisBelt inner={inner * 1.02} outer={outer * 0.98} color={color} />
    </group>
  );
}
