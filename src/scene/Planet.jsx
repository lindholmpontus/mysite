// Planet.jsx — a spinning globe with a physically-motivated look (see
// planetShaders.js): Minnaert-shaded surface, a ray-marched atmosphere shell,
// and — for Saturn — its rings, each shadowing the other. It carries no label
// of its own; the screen-space lock-on reticle (PlanetReticle) names the
// active world.
/* eslint-disable react-hooks/immutability -- textures are configured once before GPU upload; cloud drift is a per-frame uniform */
import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import SaturnRings from "./SaturnRings";
import { textureUrl } from "./planets.config";
import { createSurfaceMaterial, createAtmosphereMaterial } from "./planetShaders";

const CLOUD_DRIFT = 0.0022; // clouds' own circulation, in texture widths/sec

export default function Planet({ planet, quality = "high" }) {
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

    const center = new THREE.Vector3(...planet.position);
    const ring = planet.ring && {
      texture: tex.ring,
      center,
      // the ring plane is the equator: the tilted +Y axis
      normal: new THREE.Vector3(0, 1, 0).applyEuler(new THREE.Euler(...(planet.tilt || [0, 0, 0]))),
      inner: planet.radius * planet.ring.inner,
      outer: planet.radius * planet.ring.outer,
    };

    const a = planet.atmosphere;
    const top = 1 + (a?.scaleHeight ?? 0) * 8; // e^-8: nothing visible beyond
    return {
      surface: createSurfaceMaterial({ maps: tex, limb: planet.limb, ring }),
      atmosphere: a && {
        top,
        material: createAtmosphereMaterial({
          ...a,
          center: planet.position,
          radius: planet.radius,
          top,
          steps: quality === "high" ? 12 : 8,
        }),
      },
      ringInfo: ring,
    };
  }, [tex, planet, quality, gl]);

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * planet.spin;
    const shift = surface.uniforms.uCloudShift;
    if (shift) shift.value = (shift.value + dt * CLOUD_DRIFT) % 1;
  });

  return (
    <group position={planet.position}>
      {/* axial tilt — realism, and it keeps Saturn's rings reading as an ellipse
          (not an edge-on sliver) now that the camera flies at the planet's height */}
      <group rotation={planet.tilt || [0, 0, 0]}>
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
