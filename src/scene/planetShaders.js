// planetShaders.js — the realistic look, as three ShaderMaterials:
//   - planet surface: Minnaert limb shading (real planets photograph as flat-ish
//     discs, not Lambert "CG balls"), Earth's drifting clouds + cloud shadows +
//     ocean sun glint, and the shadow Saturn's rings cast on the globe
//   - atmosphere shell: single-scattering ray march (Rayleigh + haze) — the thin
//     bright limb, blue haze over the disc edge, and extinction of what's behind
//   - Saturn's rings: a real radial opacity profile, lit/unlit face, and the
//     planet's shadow across them
// Light comes from `uSunPos` (the scroll layout puts it far off to one side
// of each planet). Centres and ring axes are derived from each mesh's own
// transform, so bodies can move freely.
import * as THREE from "three";
import { SUN_LIGHT } from "./planets.config";

// the sun's irradiance in the Lambert convention MeshStandardMaterial uses
// (albedo/π · E), so the new surfaces sit at the same exposure as before
const sunRadiance = () =>
  new THREE.Color(SUN_LIGHT.color).multiplyScalar(SUN_LIGHT.intensity / Math.PI);

/* ------------------------------------------------------------------ */
/* Planet surface                                                      */
/* ------------------------------------------------------------------ */

const surfaceVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosW;
  varying vec3 vNormalW;
  #ifdef USE_CLOUDS
  varying vec3 vEastW;
  #endif
  #ifdef USE_RING_SHADOW
  varying vec3 vCenterW;
  varying vec3 vRingNormalW;
  #endif
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    #ifdef USE_RING_SHADOW
    vCenterW = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    // the rings lie in the equator: the (tilted) spin axis is their normal
    vRingNormalW = normalize(mat3(modelMatrix) * vec3(0.0, 1.0, 0.0));
    #endif
    #ifdef USE_CLOUDS
    // direction of increasing longitude (u) on three's SphereGeometry
    vEastW = mat3(modelMatrix) * vec3(position.z, 0.0, -position.x + 1e-4);
    #endif
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const surfaceFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uSunPos;
  uniform vec3 uSunColor;
  uniform float uLimb;
  uniform float uAmbient;
  #ifdef USE_CLOUDS
  uniform sampler2D uClouds;
  uniform sampler2D uOcean;
  uniform float uCloudShift;
  varying vec3 vEastW;
  #endif
  #ifdef USE_RING_SHADOW
  uniform sampler2D uRing;
  uniform vec2 uRingSpan;
  varying vec3 vCenterW;
  varying vec3 vRingNormalW;
  #endif
  varying vec2 vUv;
  varying vec3 vPosW;
  varying vec3 vNormalW;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 L = normalize(uSunPos - vPosW);
    vec3 V = normalize(cameraPosition - vPosW);
    float mu0 = max(dot(N, L), 0.0);
    float mu = max(dot(N, V), 0.15);

    // Minnaert: k < 1 keeps the disc evenly bright out toward the limb, the
    // way telescope/spacecraft photos look; k = 1 is plain Lambert
    float lit = pow(mu0, uLimb) * pow(mu, uLimb - 1.0);

    vec3 albedo = texture2D(uMap, vUv).rgb;
    vec3 col = albedo * lit;

    #ifdef USE_CLOUDS
    vec2 cuv = vUv + vec2(uCloudShift, 0.0);
    float cloud = texture2D(uClouds, cuv).r;
    // cloud shadow: the cloud that shades this point sits a little toward the sun
    vec3 E = normalize(vEastW);
    vec3 No = cross(N, E);
    vec2 toSun = vec2(dot(L, E) * 0.5, dot(L, No));
    float shade = texture2D(uClouds, cuv + toSun * 0.0035 / max(mu0, 0.3)).r;
    vec3 ground = albedo * (1.0 - 0.45 * shade);

    // ocean sun glint (a rough water surface), hidden under cloud
    float water = texture2D(uOcean, vUv).r * (1.0 - cloud);
    vec3 H = normalize(L + V);
    float NH = max(dot(N, H), 0.0);
    float glint = (pow(NH, 120.0) * 0.14 + pow(NH, 16.0) * 0.02) * mu0 * water;

    col = mix(ground, vec3(0.96), cloud) * lit + glint;
    #endif

    #ifdef USE_RING_SHADOW
    // march the sun ray to the ring plane; its opacity there shadows the globe
    vec3 rn = normalize(vRingNormalW);
    float den = dot(L, rn);
    float t = -dot(vPosW - vCenterW, rn) / (abs(den) > 1e-4 ? den : 1e-4);
    float rr = length(vPosW + L * t - vCenterW);
    float ru = (rr - uRingSpan.x) / (uRingSpan.y - uRingSpan.x);
    float onRing = step(0.0, t) * step(0.0, ru) * step(ru, 1.0);
    col *= 1.0 - 0.9 * onRing * textureLod(uRing, vec2(clamp(ru, 0.0, 1.0), 0.5), 0.0).a;
    #endif

    gl_FragColor = vec4(col * uSunColor + albedo * uAmbient, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// maps: { map, clouds?, ocean? } (loaded textures); ring: { texture, inner,
// outer } for the ring-shadow variant; sunPos: world position of the light
export function createSurfaceMaterial({ maps, limb = 0.9, ring = null, sunPos = [0, 0, 0] }) {
  const defines = {};
  const uniforms = {
    uMap: { value: maps.map },
    uSunPos: { value: new THREE.Vector3(...sunPos) },
    uSunColor: { value: sunRadiance() },
    uLimb: { value: limb },
    uAmbient: { value: 0.012 },
  };
  if (maps.clouds) {
    defines.USE_CLOUDS = "";
    uniforms.uClouds = { value: maps.clouds };
    uniforms.uOcean = { value: maps.ocean };
    uniforms.uCloudShift = { value: 0 };
  }
  if (ring) {
    defines.USE_RING_SHADOW = "";
    uniforms.uRing = { value: ring.texture };
    uniforms.uRingSpan = { value: new THREE.Vector2(ring.inner, ring.outer) };
  }
  return new THREE.ShaderMaterial({
    defines,
    uniforms,
    vertexShader: surfaceVertex,
    fragmentShader: surfaceFragment,
  });
}

/* ------------------------------------------------------------------ */
/* Atmosphere                                                          */
/* ------------------------------------------------------------------ */

const atmoVertex = /* glsl */ `
  varying vec3 vPosW;
  varying vec3 vCenterW;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    vCenterW = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

// Everything is in units of the planet radius. Output is premultiplied:
// rgb = in-scattered light, a = transmittance, blended as src + dst * a — so
// the shell both glows and dims the surface / stars seen through it.
const atmoFragment = /* glsl */ `
  uniform float uRadius;
  uniform float uTop;
  uniform float uH;
  uniform vec3 uBetaR;
  uniform vec3 uBetaM;
  uniform float uG;
  uniform vec3 uSunPos;
  uniform vec3 uSunColor;
  varying vec3 vPosW;
  varying vec3 vCenterW;

  vec2 raySphere(vec3 o, vec3 d, float r) {
    float b = dot(o, d);
    float h = b * b - dot(o, o) + r * r;
    if (h < 0.0) return vec2(1e9, -1e9);
    h = sqrt(h);
    return vec2(-b - h, -b + h);
  }

  // Chapman grazing-incidence function (Schuler's approximation): how much
  // longer than straight-up a slant path out of an exponential atmosphere is.
  // x = r / H, mu = cosine of the path's zenith angle.
  float chapman(float x, float mu) {
    float c = sqrt(1.5707963 * x);
    if (mu >= 0.0) return c / ((c - 1.0) * mu + 1.0);
    // below the horizon: twice the tangent-point path, minus the part behind us
    float x0 = x * sqrt(max(1.0 - mu * mu, 0.0));
    return 2.0 * exp(min(x - x0, 60.0)) * sqrt(1.5707963 * x0) - c / (1.0 - (c - 1.0) * mu);
  }

  void main() {
    vec3 o = (cameraPosition - vCenterW) / uRadius;
    vec3 d = normalize(vPosW - cameraPosition);
    vec2 ta = raySphere(o, d, uTop);
    if (ta.x > ta.y || ta.y < 0.0) discard;
    float t0 = max(ta.x, 0.0);
    float t1 = ta.y;
    vec2 tp = raySphere(o, d, 1.0);
    if (tp.x > 0.0 && tp.x < tp.y) t1 = tp.x;

    vec3 L = normalize(uSunPos - vCenterW);
    float mu = dot(d, L);
    float phR = 0.0596831 * (1.0 + mu * mu);
    float g2 = uG * uG;
    float phM = 0.0795775 * (1.0 - g2) / pow(1.0 + g2 - 2.0 * uG * mu, 1.5);

    float ds = (t1 - t0) / float(STEPS);
    vec3 ext = uBetaR + uBetaM;
    vec3 sum = vec3(0.0);
    float odView = 0.0;
    for (int i = 0; i < STEPS; i++) {
      vec3 p = o + d * (t0 + ds * (float(i) + 0.5));
      float r = length(p);
      float rho = exp(-(r - 1.0) / uH);
      float dens = rho * ds;
      odView += dens * 0.5;

      // sunlight's path out to space, analytically
      float b = dot(p, L);
      float odLight = uH * rho * chapman(r / uH, b / r);
      // planet shadow, softened over a scale height (twilight at the terminator)
      float closest = b < 0.0 ? sqrt(max(r * r - b * b, 0.0)) : 2.0;
      float sunlit = smoothstep(1.0 - uH, 1.0 + uH, closest);

      // the sunlight path is only partly extinguished: a cheap stand-in for
      // multiple scattering, which refills it (full single-scatter extinction
      // tints the zero-phase limb an unreal yellow-green)
      vec3 att = exp(-ext * (odView + LIGHT_EXT * odLight)) * dens * sunlit;
      sum += att;
      odView += dens * 0.5;
    }
    vec3 inscatter = uSunColor * sum * (uBetaR * phR + uBetaM * phM);
    vec3 trans = exp(-ext * odView);

    gl_FragColor = vec4(inscatter, dot(trans, vec3(0.3333)));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// rayleigh / haze: optical depth straight up (per colour channel);
// scaleHeight: density e-folding height as a fraction of the radius.
export function createAtmosphereMaterial({
  radius,
  rayleigh,
  haze = [0, 0, 0],
  scaleHeight = 0.005,
  g = 0.7,
  intensity = 1,
  top,
  steps = 12,
  sunPos = [0, 0, 0],
}) {
  const H = scaleHeight;
  return new THREE.ShaderMaterial({
    defines: { STEPS: steps, LIGHT_EXT: "0.3" },
    uniforms: {
      uRadius: { value: radius },
      uTop: { value: top },
      uH: { value: H },
      uBetaR: { value: new THREE.Vector3(...rayleigh).divideScalar(H) },
      uBetaM: { value: new THREE.Vector3(...haze).divideScalar(H) },
      uG: { value: g },
      uSunPos: { value: new THREE.Vector3(...sunPos) },
      // physical sun irradiance (single scattering has no albedo/π factor)
      uSunColor: { value: sunRadiance().multiplyScalar(Math.PI * intensity) },
    },
    vertexShader: atmoVertex,
    fragmentShader: atmoFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.SrcAlphaFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
  });
}

/* ------------------------------------------------------------------ */
/* Rings                                                               */
/* ------------------------------------------------------------------ */

const ringVertex = /* glsl */ `
  varying vec2 vLocal;
  varying vec3 vPosW;
  varying vec3 vCenterW;
  varying vec3 vNormalW;
  void main() {
    vLocal = position.xy;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    vCenterW = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vNormalW = normalize(mat3(modelMatrix) * vec3(0.0, 0.0, 1.0)); // ring built in XY
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const ringFragment = /* glsl */ `
  uniform sampler2D uRing;
  uniform vec2 uSpan;
  uniform float uPlanetR;
  uniform vec3 uSunPos;
  uniform vec3 uSunColor;
  uniform float uBright;
  varying vec2 vLocal;
  varying vec3 vPosW;
  varying vec3 vCenterW;
  varying vec3 vNormalW;

  void main() {
    vec3 uNormal = normalize(vNormalW);
    float u = (length(vLocal) - uSpan.x) / (uSpan.y - uSpan.x);
    if (u < 0.0 || u > 1.0) discard;
    vec4 tex = texture2D(uRing, vec2(u, 0.5));
    if (tex.a < 0.004) discard;

    vec3 L = normalize(uSunPos - vPosW);
    vec3 V = normalize(cameraPosition - vPosW);

    // the globe's shadow across the rings
    vec3 oc = vPosW - vCenterW;
    float b = dot(oc, L);
    float miss = sqrt(max(dot(oc, oc) - b * b, 0.0));
    float shadow = b < 0.0 ? smoothstep(uPlanetR * 0.985, uPlanetR * 1.015, miss) : 1.0;

    // lit face reflects; from the unlit face only light that diffuses THROUGH
    // shows, so the dense B ring goes dark and the sparse C ring / Cassini
    // division glow
    float litFace = step(0.0, dot(L, uNormal) * dot(V, uNormal));
    vec3 col = tex.rgb * uBright * mix(0.5 * (1.0 - tex.a), 1.0, litFace);

    gl_FragColor = vec4(col * uSunColor * shadow, tex.a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createRingMaterial({ texture, inner, outer, planetRadius, sunPos = [0, 0, 0] }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uRing: { value: texture },
      uSpan: { value: new THREE.Vector2(inner, outer) },
      uPlanetR: { value: planetRadius },
      uSunPos: { value: new THREE.Vector3(...sunPos) },
      uSunColor: { value: sunRadiance() },
      uBright: { value: 1.25 },
    },
    vertexShader: ringVertex,
    fragmentShader: ringFragment,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}
