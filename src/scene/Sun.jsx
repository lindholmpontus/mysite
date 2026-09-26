// Sun.jsx — the star at the center; also the scene's key light. Rendered as a
// crisp emissive disc (no corona shells, no bloom flare) for the realistic look,
// with the photosphere's limb darkening (the disc dims toward its edge).
/* eslint-disable react-hooks/immutability -- the texture's colour space is set once before GPU upload */
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SUN, SUN_LIGHT, textureUrl } from "./planets.config";

const sunVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const sunFragment = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    float mu = max(dot(normalize(vNormalW), normalize(cameraPosition - vPosW)), 0.0);
    // visible-light limb darkening, I(mu) = 1 - u(1 - mu^a)
    float limb = 1.0 - 0.62 * (1.0 - pow(mu, 0.55));
    vec3 col = texture2D(uMap, vUv).rgb * vec3(1.35, 1.12, 0.82) * limb;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function Sun() {
  const meshRef = useRef();
  const texture = useTexture(textureUrl(SUN.texture));
  const material = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.ShaderMaterial({
      uniforms: { uMap: { value: texture } },
      vertexShader: sunVertex,
      fragmentShader: sunFragment,
    });
  }, [texture]);

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.03;
  });

  return (
    <group>
      {/* the star surface — emissive but tone mapped, so it stays under the
          bloom threshold and renders as a sharp disc */}
      <mesh ref={meshRef} material={material}>
        <sphereGeometry args={[SUN.radius, 64, 64]} />
      </mesh>

      {/* light sources — distance covers the full (scaled-up) journey route */}
      <pointLight
        position={[0, 0, 0]}
        intensity={SUN_LIGHT.intensity}
        decay={0}
        distance={1500}
        color={SUN_LIGHT.color}
      />
    </group>
  );
}
