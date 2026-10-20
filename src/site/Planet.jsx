// Planet.jsx — a planet without WebGL: the equirectangular map scrolls
// across a disc, with shading for the night side and a rim of atmosphere in
// the section's accent. Saturn gets its ring (front half drawn over the disc).
import React from "react";
import sunTexture from "../assets/space/sun.jpg";

export function Planet({ texture, clouds, accent, ring, spin = 70 }) {
  return (
    <div className="planet-wrap" style={{ "--accent": accent, "--spin": `${spin}s` }}>
      {ring && <div className="planet-ring" />}
      <div className="planet" style={{ backgroundImage: `url(${texture})` }}>
        {clouds && <div className="planet-clouds" style={{ backgroundImage: `url(${clouds})` }} />}
        <div className="planet-shade" />
      </div>
      {ring && <div className="planet-ring planet-ring-front" />}
    </div>
  );
}

export function Sun() {
  return (
    <div className="sun" style={{ backgroundImage: `url(${sunTexture})` }}>
      <div className="sun-shade" />
    </div>
  );
}
