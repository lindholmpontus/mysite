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
  uniform float uBrightness;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    float mu = max(dot(normalize(vNormalW), normalize(cameraPosition - vPosW)), 0.0);
    // visible-light limb darkening, I(mu) = 1 - u(1 - mu^a)
    float limb = 1.0 - 0.62 * (1.0 - pow(mu, 0.55));
    vec3 col = texture2D(uMap, vUv).rgb * vec3(1.35, 1.12, 0.82) * limb * uBrightness;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// a soft radial glow for the corona sprite
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.55)");
  g.addColorStop(0.55, "rgba(255,255,255,0.14)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// groupRef: move the star from outside (the scroll layout's hero anchors it
// to the page); light: include a point light at the star for lit materials;
// glow: a soft corona around the disc (for when the sun is on screen);
// brightness: >1 pushes the disc into the bloom (a star, not a ball)
export default function Sun({ groupRef, light = true, glow = false, brightness = 1 }) {
  const meshRef = useRef();
  const texture = useTexture(textureUrl(SUN.texture));
  const material = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.ShaderMaterial({
      uniforms: { uMap: { value: texture }, uBrightness: { value: brightness } },
      vertexShader: sunVertex,
      fragmentShader: sunFragment,
    });
  }, [texture, brightness]);

  const corona = useMemo(
    () =>
      glow &&
      new THREE.SpriteMaterial({
        map: glowTexture(),
        color: new THREE.Color(1.0, 0.72, 0.42),
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [glow]
  );

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.03;
  });

  return (
    <group ref={groupRef}>
      {/* the star surface — emissive but tone mapped, so it stays under the
          bloom threshold and renders as a sharp disc */}
      <mesh ref={meshRef} material={material}>
        <sphereGeometry args={[SUN.radius, 64, 64]} />
      </mesh>
      {corona && <sprite material={corona} scale={SUN.radius * 2.7} renderOrder={-1} />}

      {/* light sources — distance covers the full (scaled-up) journey route */}
      {light && (
        <pointLight
          position={[0, 0, 0]}
          intensity={SUN_LIGHT.intensity}
          decay={0}
          distance={1500}
          color={SUN_LIGHT.color}
        />
      )}
    </group>
  );
}
