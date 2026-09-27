// SaturnRings.jsx — Saturn's ring system from a real radial profile (C ring,
// B ring, Cassini division, A ring with the Encke gap), lying in the planet's
// equatorial plane. The shader lights the face toward the sun, lets light
// diffuse through from behind, and carries the globe's shadow; the globe's
// shader carries the rings' shadow in return (see planetShaders.js). The
// ring's centre and plane come from its own transform, so it can move.
// Lives in the planet's tilted (non-spinning) frame.
import React, { useMemo } from "react";
import { createRingMaterial } from "./planetShaders";

export default function SaturnRings({ ring, planetRadius }) {
  const material = useMemo(
    () => createRingMaterial({ ...ring, planetRadius }),
    [ring, planetRadius]
  );

  return (
    // ringGeometry is built in XY; lay it into the equatorial (XZ) plane
    <mesh material={material} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[ring.inner, ring.outer, 256, 1]} />
    </mesh>
  );
}
