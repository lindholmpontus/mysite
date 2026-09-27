// Starfield.jsx — the deep-space backdrop: the Milky Way's glow and dust lanes
// on a sky sphere, plus a star field that follows real skies — mostly faint
// stars with a few bright ones, colours from blue-white to red-orange, crowded
// along the galactic band, and diffraction spikes on the brightest (the
// telescope-photo look). Everything follows the camera each frame, so the sky
// reads as infinitely far away no matter how long the journey gets.
/* eslint-disable react-hooks/immutability -- texture colour space set once; per-frame follow */
import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { textureUrl } from "./planets.config";

const SKY_RADIUS = 1500;
const STAR_RADIUS = 1200;
const SKY_BRIGHTNESS = 0.2; // the band is a backdrop: dim enough to keep space black

// orientation of the galactic frame: the core sits ahead of the route (-Z), a
// little left and above the lane, with the band crossing the view diagonally
const GALAXY_YAW = 0.32;
const GALAXY_PITCH = 0.1;
const GALAXY_TILT = 0.55;

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// stellar colours by rough abundance of what the eye/camera picks out
const STAR_COLORS = [
  [0.2, [0.72, 0.82, 1.0]], // blue-white (B/A)
  [0.36, [1.0, 1.0, 1.0]], // white (A/F)
  [0.24, [1.0, 0.95, 0.84]], // yellow-white (F/G)
  [0.14, [1.0, 0.82, 0.62]], // orange (K)
  [0.06, [1.0, 0.66, 0.5]], // red-orange (M)
];

// normally distributed (Box-Muller)
const gauss = (rand) => Math.sqrt(-2 * Math.log(1 - rand() * 0.9999)) * Math.cos(2 * Math.PI * rand());
const CORE_COLORS = [[1.0, 1.0, 1.0], [1.0, 0.94, 0.82], [1.0, 0.86, 0.68]];

// in the galactic frame: the plane is y = 0, the core toward +X (where the
// sky texture puts it). `count` field stars, then `dust` faint grain along
// the band, then `core` faint stars packed around the galactic core — the
// dense star cloud that makes the core read as a photo, not a glow.
function buildStars(count, dust, rand, core = 0) {
  const total = count + dust + core;
  const pos = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  const size = new Float32Array(total);
  const bright = new Float32Array(total);
  const spike = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    // the last `dust` stars are the Milky Way's grain: tiny, faint, packed
    // into the band — what makes it read as star clouds rather than fog
    const grain = i >= count;
    const inCore = i >= count + dust;
    let lon, lat;
    if (inCore) {
      // a flattened disk crowding the plane, plus the rounder bulge
      const bulge = rand() < 0.4;
      lon = gauss(rand) * (bulge ? 0.16 : 0.3);
      lat = gauss(rand) * (bulge ? 0.11 : 0.06);
    } else if (grain || rand() < 0.5) {
      // disc stars: Laplace-distributed latitude, crowding toward the core
      lon = (rand() < 0.5 ? -1 : 1) * Math.pow(rand(), 1.5) * Math.PI;
      lat = (rand() < 0.5 ? -1 : 1) * -Math.log(1 - rand() * 0.999) * (grain ? 0.07 : 0.1);
    } else {
      lon = rand() * 2 * Math.PI - Math.PI;
      lat = Math.asin(2 * rand() - 1);
    }
    pos[i * 3] = STAR_RADIUS * Math.cos(lat) * Math.cos(lon);
    pos[i * 3 + 1] = STAR_RADIUS * Math.sin(lat);
    pos[i * 3 + 2] = STAR_RADIUS * Math.cos(lat) * Math.sin(lon);

    let pick = rand();
    let c = STAR_COLORS[0][1];
    for (const [w, rgb] of STAR_COLORS) {
      c = rgb;
      if ((pick -= w) <= 0) break;
    }
    col.set(c, i * 3);

    const m = rand(); // brightness: steep power law — most stars are faint
    if (inCore) {
      col.set(CORE_COLORS[Math.floor(rand() * CORE_COLORS.length)], i * 3);
      bright[i] = 0.05 + 0.15 * m * m;
      size[i] = 1.0 + 0.55 * m;
      continue;
    }
    if (grain) {
      bright[i] = 0.05 + 0.12 * m;
      size[i] = 1.1 + 0.6 * m;
      continue;
    }
    const isSpike = rand() < 0.004;
    spike[i] = isSpike ? 1 : 0;
    bright[i] = isSpike ? 1.3 + rand() * 0.9 : 0.1 + 0.95 * Math.pow(m, 6);
    size[i] = isSpike ? 18 + rand() * 12 : 1.4 + 2.4 * Math.pow(m, 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  g.setAttribute("aBright", new THREE.BufferAttribute(bright, 1));
  g.setAttribute("aSpike", new THREE.BufferAttribute(spike, 1));
  return g;
}

const starVertex = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aBright;
  attribute float aSpike;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vBright;
  varying float vSpike;
  void main() {
    vColor = aColor;
    vBright = aBright;
    vSpike = aSpike;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
  }
`;

// ordinary stars: a soft round point. Spike stars: a tight core, a faint halo
// and four thin diffraction spikes fading along their length.
const starFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vBright;
  varying float vSpike;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(p, p);
    if (r2 > 1.0) discard;
    float core = exp(-r2 * mix(4.5, 90.0, vSpike));
    float halo = vSpike * exp(-r2 * 7.0) * 0.16;
    float spikes = vSpike * 0.5 * (
      exp(-abs(p.x) * 60.0) * exp(-abs(p.y) * 2.6) +
      exp(-abs(p.y) * 60.0) * exp(-abs(p.x) * 2.6));
    gl_FragColor = vec4(vColor * (core + halo + spikes) * vBright, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// The galactic core in close-up: a hi-res patch of the same sky (lon ±60°,
// lat ±30° around the core; generated by the same function as the full sky,
// so it blends in) laid just inside the sky sphere, edges fading out. For
// narrow lenses that would otherwise magnify the core into a blur.
const patchVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const patchFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uGain;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(uMap, vUv).rgb * vec3(1.0, 1.01, 1.1) * uGain;
    float edge = smoothstep(0.0, 0.16, vUv.x) * smoothstep(1.0, 0.84, vUv.x)
               * smoothstep(0.0, 0.22, vUv.y) * smoothstep(1.0, 0.78, vUv.y);
    gl_FragColor = vec4(c, edge);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function CorePatch({ quality, gainRef, brightness }) {
  const tex = useTexture(textureUrl("milky_way_core.jpg", quality));
  const material = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.ShaderMaterial({
      uniforms: { uMap: { value: tex }, uGain: { value: brightness } },
      vertexShader: patchVertex,
      fragmentShader: patchFragment,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, [tex, brightness]);
  useFrame(() => {
    if (gainRef) material.uniforms.uGain.value = gainRef.current;
  });
  // the patch's own UVs span its lon/lat window (sphere phi = lon + 180°)
  return (
    <mesh material={material} renderOrder={-99}>
      <sphereGeometry args={[SKY_RADIUS - 50, 96, 48, (2 * Math.PI) / 3, (2 * Math.PI) / 3, Math.PI / 3, Math.PI / 3]} />
    </mesh>
  );
}

// skyBrightness: the Milky Way band's strength (a narrow lens magnifies it);
// gainRef: optional { current } to drive that strength per frame instead;
// detailCore: add the hi-res core patch + dense core star cloud
export default function Starfield({ quality = "high", skyBrightness = SKY_BRIGHTNESS, gainRef, detailCore = false }) {
  const groupRef = useRef();
  const showSky = quality !== "low";
  const starCount = quality === "low" ? 2000 : quality === "medium" ? 5000 : 9000;
  const grainCount = quality === "low" ? 0 : quality === "medium" ? 9000 : 18000;
  const coreCount = !detailCore || quality === "low" ? 0 : quality === "medium" ? 12000 : 26000;

  const sky = useTexture(textureUrl("milky_way.jpg", quality));
  const dpr = useThree((s) => s.viewport.dpr); // the canvas's real render ratio

  const { stars, starMaterial, skyMaterial } = useMemo(() => {
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: { uPixelRatio: { value: 1 } },
      vertexShader: starVertex,
      fragmentShader: starFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    sky.colorSpace = THREE.SRGBColorSpace;
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: sky,
      // a touch cool, so only the core reads warm (dim warm light goes brown)
      color: new THREE.Color(skyBrightness, skyBrightness * 1.01, skyBrightness * 1.1),
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    const stars = buildStars(starCount, grainCount, mulberry32(4242), coreCount);
    return { stars, starMaterial, skyMaterial };
  }, [starCount, grainCount, coreCount, sky, skyBrightness]);

  useFrame(({ camera }) => {
    if (groupRef.current) groupRef.current.position.copy(camera.position);
    starMaterial.uniforms.uPixelRatio.value = dpr; // star sizes are in CSS pixels
    if (gainRef) {
      const b = gainRef.current;
      skyMaterial.color.setRGB(b, b * 1.01, b * 1.1);
    }
  });

  return (
    <group ref={groupRef}>
      <group rotation={[GALAXY_PITCH, GALAXY_YAW, 0]}>
        <group rotation={[0, 0, GALAXY_TILT]}>
          {/* galactic frame: core at +X on the sphere -> turned to face -Z;
              x mirrored because the sky is seen from inside */}
          <group rotation={[0, -Math.PI / 2, 0]} scale={[-1, 1, 1]}>
            {showSky && (
              <mesh material={skyMaterial} renderOrder={-100}>
                <sphereGeometry args={[SKY_RADIUS, 64, 32]} />
              </mesh>
            )}
            {showSky && detailCore && <CorePatch quality={quality} gainRef={gainRef} brightness={skyBrightness} />}
            <points geometry={stars} material={starMaterial} />
          </group>
        </group>
      </group>
    </group>
  );
}
