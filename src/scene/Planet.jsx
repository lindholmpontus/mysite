// Planet.jsx — a spinning globe with a physically-motivated look (see
// planetShaders.js): Minnaert-shaded surface, a ray-marched atmosphere shell,
// and — for Saturn — its rings, each shadowing the other. It carries no label
// of its own; its section's lock-on brackets (PlanetSection) name it.
/* eslint-disable react-hooks/immutability -- textures are configured once before GPU upload; cloud drift is a per-frame uniform */
import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import SaturnRings from "./SaturnRings";
import { textureUrl } from "./planets.config";
import { createSurfaceMaterial, createAtmosphereMaterial } from "./planetShaders";

const CLOUD_DRIFT = 0.0022; // clouds' own circulation, in texture widths/sec
const ORIGIN = [0, 0, 0]; // default light: a sun at the world origin

// groupRef: the outer group, for callers that move the planet each frame (the
// scroll layout anchors planets to page elements); sunPos: world position of
// the light (pass a stable array)
export default function Planet({ planet, quality = "high", groupRef, sunPos = ORIGIN, tilt }) {
  const meshRef = useRef();
  const gl = useThree((s) => s.gl);

  const urls = useMemo(() => {
    const u = {};
    for (const [key, file] of Object.entries(planet.maps)) u[key] = textureUrl(file, quality);
    if (planet.ring) u.ring = textureUrl(planet.ring.texture, quality);
    return u;
  }, [planet, quality]);
  const tex = useTexture(urls);

  const { surface, atmosphere, ringInfo } = useMemo(() => {
    // crisp at the limb, where the sphere is seen at grazing angles
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
    for (const [key, t] of Object.entries(tex)) {
      t.anisotropy = aniso;
      if (key === "map" || key === "ring") {
        t.colorSpace = THREE.SRGBColorSpace;
      } else {
        // grayscale data (cloud cover, ocean mask): one channel on the GPU
        t.colorSpace = THREE.NoColorSpace;
        t.format = THREE.RedFormat;
      }
    }
    if (tex.clouds) tex.clouds.wrapS = THREE.RepeatWrapping; // they drift past the seam

    const ring = planet.ring && {
      texture: tex.ring,
      sunPos,
      inner: planet.radius * planet.ring.inner,
      outer: planet.radius * planet.ring.outer,
    };

    const a = planet.atmosphere;
    const top = 1 + (a?.scaleHeight ?? 0) * 8; // e^-8: nothing visible beyond
    return {
      surface: createSurfaceMaterial({ maps: tex, limb: planet.limb, ring, sunPos }),
      atmosphere: a && {
        top,
        material: createAtmosphereMaterial({
          ...a,
          radius: planet.radius,
          sunPos,
          top,
          steps: quality === "high" ? 12 : quality === "medium" ? 8 : 5,
        }),
      },
      ringInfo: ring,
    };
  }, [tex, planet, quality, gl, sunPos]);

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * planet.spin;
    const shift = surface.uniforms.uCloudShift;
    if (shift) shift.value = (shift.value + dt * CLOUD_DRIFT) % 1;
  });

  return (
    <group ref={groupRef} position={groupRef ? undefined : planet.position}>
      {/* axial tilt — realism, and it keeps Saturn's rings reading as an open
          ellipse rather than an edge-on sliver */}
      <group rotation={tilt || planet.tilt || [0, 0, 0]}>
        <mesh ref={meshRef} material={surface}>
          <sphereGeometry args={[planet.radius, 128, 64]} />
        </mesh>

        {/* drawn before other transparents: it dims + hazes what's behind it,
            while the ship, dust and rings layer on top */}
        {atmosphere && (
          <mesh material={atmosphere.material} renderOrder={-1}>
            <sphereGeometry args={[planet.radius * atmosphere.top, 96, 48]} />
          </mesh>
        )}

        {ringInfo && <SaturnRings ring={ringInfo} planetRadius={planet.radius} />}
      </group>
    </group>
  );
}
