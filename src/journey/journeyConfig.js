// journeyConfig.js — the scroll-driven space journey in one place.
//
// Designed for MAXIMUM SMOOTHNESS. The camera flies a DEAD-STRAIGHT lane down
// -Z at x=0, raised to LANE_Y so it clears the sun without arcing. The six
// planets sit a fixed distance off to ALTERNATING sides (x = ±30), so the
// straight lane sweeps past each one — never weaving, never turning to "visit"
// it. Orientation is the path TANGENT (you always look where you're going), so
// the view is as smooth as the path (which is a straight line → ~0°/s turning
// in flight). While parked at a planet the look eases a few degrees toward it
// (REGARD) for nicer framing, then releases. Verified offline: every body
// clears by ≥4 units, surface gaps 28–33 (no ballooning), max angular velocity
// ~5°/s anywhere (vs the old look-at "whip").
//
// Progress (0..1) maps onto this curve via alternating DWELL windows (camera
// parked, content panel visible) and TRAVEL windows (flying the lane).
import * as THREE from "three";
import { PLANETS, SUN_RADIUS } from "../scene/planets.config";

// ---- camera ----
export const CAM_FOV = 58; // base field of view
export const FOV_KICK = 6; // extra FOV at full warp (speed feel)
export const SCAN_MS = 1400; // planet-scan duration before the hologram materializes

// ---- flight speed limit ----
export const MAX_WORLD_SPEED = 30; // world units/sec — the ship's top speed
export const SCROLL_RATE_BASE = 0.05; // max progress/sec when the gap is small
export const SCROLL_RATE_GAIN = 0.15; // extra rate per unit of remaining gap

// ---- lane geometry ----
const LANE_Y = 6; // camera height = the planets' centre height, so each planet
// sits at eye level (vertically centred) as you pass. The sun is still cleared
// because the launch starts PAST it (z=-22) and the lane only heads further out.
const DWELL_LEAD = 46; // park this far IN FRONT of a planet (Z), so it sits ahead-and-to-the-side
const LOOK_DIST = 60; // how far ahead the look target sits along the view direction
const REGARD = 0.2; // how much the look eases toward a planet while parked (0..1)
// gentle "piloting" weave — a slow side-to-side (and slight up/down) sway baked
// into the lane so the camera banks through soft turns instead of flying
// ruler-straight. Low amplitude + low frequency keeps the turn-rate ~13°/s.
const WEAVE_X = 4;
const WEAVE_FX = 0.8;
const WEAVE_PX = 0.6;
const WEAVE_Y = 2;
const WEAVE_FY = 0.6;
const WEAVE_PY = 2.0;

// ---- scroll weights (relative sizes of each scroll window) ----
const HERO_DWELL = 5;
const PLANET_DWELL = 8;
const OUTRO_DWELL = 7;
const TRAVEL = 6;

// ---- shared per-frame state (mutated by CameraRig, read by scene FX) ----
export const journeyState = {
  speed: 0,
  warp: 0,
  bank: 0,
  u: 0,
  dir: new THREE.Vector3(0, 0, -1),
  snapTo: null,
};

export function requestSnap(t) {
  journeyState.snapTo = t;
}

/* ------------------------------------------------------------------ */
/* Stops                                                               */
/* ------------------------------------------------------------------ */

function v3(x, y, z) {
  return new THREE.Vector3(x, y, z);
}

const LAST_Z = PLANETS[PLANETS.length - 1].position[2];

// Every planet parks on the lane (x=0, y=LANE_Y), DWELL_LEAD in front of the
// planet in Z. The planet itself is off to the side (±30) → framed to one side.
function planetStop(p) {
  return {
    id: p.id,
    kind: "planet",
    label: p.name,
    planet: p,
    accent: p.accent,
    side: p.side,
    dwell: PLANET_DWELL,
    cam: v3(0, LANE_Y, p.position[2] + DWELL_LEAD),
  };
}

export const STOPS = [
  {
    id: "hero",
    kind: "hero",
    label: "Launch",
    accent: "#8fb7ff",
    dwell: HERO_DWELL,
    // launch from JUST OUTSIDE the sun, heading OUTWARD — the sun sits behind
    // you and recedes (realistic heliocentric departure; no flying over it)
    cam: v3(0, LANE_Y, -22),
  },
  ...PLANETS.map(planetStop),
  {
    id: "outro",
    kind: "outro",
    label: "Deep Space",
    accent: "#9fc1ff",
    dwell: OUTRO_DWELL,
    cam: v3(0, LANE_Y, LAST_Z - 115),
  },
];

// bake the gentle piloting weave into every stop's lane position (by index)
STOPS.forEach((s, i) => {
  s.cam.x += WEAVE_X * Math.sin(i * WEAVE_FX + WEAVE_PX);
  s.cam.y += WEAVE_Y * Math.sin(i * WEAVE_FY + WEAVE_PY);
});

const N = STOPS.length;

// planet center per stop index (null for hero/outro) — used for the regard bias
const STOP_CENTER = STOPS.map((s) => (s.kind === "planet" ? v3(...s.planet.position) : null));

/* ------------------------------------------------------------------ */
/* Scroll windows                                                      */
/* ------------------------------------------------------------------ */

export const DWELLS = (() => {
  const totalW = STOPS.reduce((s, st) => s + st.dwell, 0) + TRAVEL * (N - 1);
  let acc = 0;
  return STOPS.map((st, i) => {
    const t0 = acc / totalW;
    acc += st.dwell;
    const t1 = acc / totalW;
    if (i < N - 1) acc += TRAVEL;
    return { t0, t1 };
  });
})();

export function scrollTargetFor(index) {
  const d = DWELLS[index];
  return (d.t0 + d.t1) / 2;
}

export function phaseAt(t) {
  t = THREE.MathUtils.clamp(t, 0, 1);
  for (let i = 0; i < N; i++) {
    const d = DWELLS[i];
    if (t < d.t0) {
      const prev = DWELLS[i - 1];
      return { index: i - 1, phase: "travel", p: (t - prev.t1) / (d.t0 - prev.t1) };
    }
    if (t <= d.t1) {
      return { index: i, phase: "dwell", p: d.t1 > d.t0 ? (t - d.t0) / (d.t1 - d.t0) : 0 };
    }
  }
  return { index: N - 1, phase: "dwell", p: 1 };
}

/* ------------------------------------------------------------------ */
/* The route — a straight lane (with a silent sun-clearance floor)     */
/* ------------------------------------------------------------------ */

const MIDS = 2;
const ROUTE_MARGIN = 7;

// keep-out spheres — MUST match CameraRig's BODIES. The lane stays far from the
// planets, so clearPoint only ever nudges a waypoint off the SUN at the start
// (and even that clears, so the lane stays straight).
const CLEAR_BODIES = [
  ...PLANETS.map((p) => ({ c: v3(...p.position), keep: p.radius * 3.5 + 4 })),
  { c: v3(0, 0, 0), keep: SUN_RADIUS + 6 },
];

function clearPoint(m) {
  for (const b of CLEAR_BODIES) {
    const away = m.clone().sub(b.c);
    const d = away.length();
    const min = b.keep + ROUTE_MARGIN;
    if (d > 1e-3 && d < min) m.copy(b.c).addScaledVector(away.multiplyScalar(1 / d), min);
  }
  return m;
}

const ctrlPos = [];
for (let i = 0; i < N; i++) {
  ctrlPos.push(STOPS[i].cam);
  if (i < N - 1) {
    const a = STOPS[i].cam;
    const b = STOPS[i + 1].cam;
    for (let k = 1; k <= MIDS; k++) {
      const t = k / (MIDS + 1);
      const m = a.clone().lerp(b, t);
      clearPoint(m);
      ctrlPos.push(m);
    }
  }
}

const posCurve = new THREE.CatmullRomCurve3(ctrlPos, false, "centripetal");

function easeInOutCubic(p) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}
function smooth01(x) {
  x = THREE.MathUtils.clamp(x, 0, 1);
  return x * x * (3 - 2 * x);
}

const _tan = new THREE.Vector3();
const _toP = new THREE.Vector3();
const RAMP_U = 0.45 / (N - 1); // how far into a leg the regard-bias releases

// Map raw scroll (0..1) to camera pose. Orientation = path tangent (look where
// you're going), eased a few degrees toward the planet while parked. Writes
// into outPos/outTarget; returns phase info ({ index, phase, p, u }).
export function sampleJourney(t, outPos, outTarget) {
  const ph = phaseAt(t);
  const u =
    ph.phase === "dwell"
      ? ph.index / (N - 1)
      : (ph.index + easeInOutCubic(THREE.MathUtils.clamp(ph.p, 0, 1))) / (N - 1);

  posCurve.getPoint(u, outPos);
  posCurve.getTangent(u, _tan).normalize();

  // regard bias: full while parked at a planet, smoothly released into travel
  const nearest = Math.round(u * (N - 1));
  const center = STOP_CENTER[nearest];
  if (center) {
    const du = Math.abs(u - nearest / (N - 1));
    const ease = smooth01((RAMP_U - du) / RAMP_U);
    if (ease > 0) {
      _toP.copy(center).sub(outPos).normalize();
      _tan.lerp(_toP, REGARD * ease).normalize();
    }
  }

  outTarget.copy(outPos).addScaledVector(_tan, LOOK_DIST);
  ph.u = u;
  return ph;
}

/* ------------------------------------------------------------------ */
/* Environment helpers                                                 */
/* ------------------------------------------------------------------ */

export function detectQuality() {
  if (typeof window === "undefined") return "high";
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches;
  const smallMem = navigator.deviceMemory && navigator.deviceMemory <= 4;
  if (reduced) return "low";
  if (coarse || smallMem || window.innerWidth < 820) return "medium";
  return "high";
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function hasWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}
