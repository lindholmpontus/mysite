// journeyConfig.js — the scroll-driven space journey in one place.
//
// Designed for EPIC SCALE *AND* SMOOTHNESS. The camera parks close beside each
// planet (park distance derived from its radius, so every world fills ~45% of
// the screen height) and S-weaves gently across the lane between stops:
// departure/approach control points are pulled toward the lane centre, so you
// swing out of one planet's neighborhood, cruise the middle, and arc in beside
// the next — banked turns, never a whip. Orientation is the path TANGENT (you
// always look where you're going) eased a few degrees toward the planet while
// parked (REGARD). Smoothness is GUARANTEED by two per-frame budgets in
// CameraRig, not by the geometry: a world-speed cap (shaped by speedMultAt:
// punch out, surge mid-leg, brake flare in) and a view-turn-rate cap
// (MAX_TURN_RATE), so the ship slows through bends like a piloted craft.
// Verified offline by scripts/verify-route.mjs: every body clears its keep-out
// by ≥1.4 units, legs fly 3.6–5.9s, view turn ≤ ~29°/s everywhere.
//
// Progress (0..1) maps onto this curve via alternating DWELL windows (camera
// parked, content panel visible) and TRAVEL windows (flying the route).
import * as THREE from "three";
import { PLANETS, SUN_RADIUS } from "../scene/planets.config";

// ---- camera ----
export const CAM_FOV = 58; // base field of view
export const FOV_KICK = 13; // extra FOV at full warp (speed feel)
export const SCAN_MS = 1400; // planet-scan duration before the hologram materializes

// ---- flight limits ----
export const MAX_WORLD_SPEED = 46; // world units/sec — base cap (speedMultAt shapes it per leg)
export const MAX_TURN_RATE = (28 * Math.PI) / 180; // rad/s — view turn budget (no whip)
export const SCROLL_RATE_BASE = 0.05; // max progress/sec when the gap is small
export const SCROLL_RATE_GAIN = 0.15; // extra rate per unit of remaining gap

// ---- route geometry ----
const LANE_Y = 6; // camera height = the planets' centre height, so each planet
// sits at eye level (vertically centred) as you pass. The sun is still cleared
// because the launch starts PAST it (z=-22) and the route only heads further out.
const PARK_DIST = (r) => r * 3.2 + 8; // park this far in FRONT of a planet (Z)
const PARK_SIDE = (r) => r * 1.75; // ...and this far toward the lane from its centre (X)
const DEP_PULL = 0.4; // departure/approach control points pulled toward the lane centre
const DEP_AHEAD = 40; // departure control point this far past the park (clamped to leg)
const APP_AHEAD = 46; // approach control point this far before the next park (clamped)
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

// Every planet parks CLOSE BESIDE its world: PARK_DIST in front (Z) and
// PARK_SIDE in from its centre toward the lane (X), both scaled by radius —
// so big and small planets all fill ~45% of the screen height, framed to one
// side (panel on the other).
function planetStop(p) {
  const sideSign = p.side === "left" ? -1 : 1;
  return {
    id: p.id,
    kind: "planet",
    label: p.name,
    planet: p,
    accent: p.accent,
    side: p.side,
    dwell: PLANET_DWELL,
    cam: v3(
      p.position[0] - sideSign * PARK_SIDE(p.radius),
      LANE_Y,
      p.position[2] + PARK_DIST(p.radius)
    ),
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
/* The route — close parks joined by a gentle S-weave                  */
/* ------------------------------------------------------------------ */

const ROUTE_MARGIN = 3;

// keep-out spheres (camera must stay this far off a body's centre) — shared
// with CameraRig's pushOut floor via keepFor.
export const keepFor = (r) => r * 1.9 + 2.5;
export const SUN_KEEP = SUN_RADIUS + 6;

const CLEAR_BODIES = [
  ...PLANETS.map((p) => ({ c: v3(...p.position), keep: keepFor(p.radius) })),
  { c: v3(0, 0, 0), keep: SUN_KEEP },
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

// Control points per leg: park -> departure -> mid -> approach -> next park.
// dep/app are pulled toward the lane centre (DEP_PULL) so the route swings out
// of one planet's neighborhood and arcs in beside the next. Their forward
// offsets are clamped to fractions of the leg so short legs (hero -> first
// planet) can never produce out-of-order control points (a doubled-back curve
// would mean a tangent flip = view whip).
const ctrlPos = [];
for (let i = 0; i < N - 1; i++) {
  const a = STOPS[i].cam;
  const b = STOPS[i + 1].cam;
  const legDz = a.z - b.z; // always positive (the route heads -Z)
  const depA = Math.min(DEP_AHEAD, legDz * 0.28);
  const appA = Math.min(APP_AHEAD, legDz * 0.32);
  const dep = clearPoint(v3(a.x * DEP_PULL, (a.y + LANE_Y) / 2, a.z - depA));
  const app = clearPoint(v3(b.x * DEP_PULL, (b.y + LANE_Y) / 2, b.z + appA));
  const mid = clearPoint(dep.clone().lerp(app, 0.5));
  ctrlPos.push(a, dep, mid, app);
}
ctrlPos.push(STOPS[N - 1].cam);

const posCurve = new THREE.CatmullRomCurve3(ctrlPos, false, "centripetal");

function easeInOutCubic(p) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}
function smooth01(x) {
  x = THREE.MathUtils.clamp(x, 0, 1);
  return x * x * (3 - 2 * x);
}

/* ------------------------------------------------------------------ */
/* Speed profile — punch out, surge mid-leg, brake flare in            */
/* ------------------------------------------------------------------ */

// Multiplier on MAX_WORLD_SPEED by leg phase: gentle near both leg ends
// (depart/arrive at ~30%), full speed by 18% in, and a +30% overspeed surge
// through the middle. Symmetric, so flying backward feels the same.
function speedProfile(p) {
  const edge = Math.min(p, 1 - p); // 0 at both leg ends, 0.5 mid-leg
  const ramp = 0.3 + 0.7 * smooth01(edge / 0.18);
  const surge = 1 + 0.3 * smooth01((edge - 0.18) / 0.14);
  return ramp * surge;
}

// world-speed multiplier at a raw scroll position (1x outside travel)
export function speedMultAt(t) {
  const ph = phaseAt(t);
  return ph.phase === "travel" ? speedProfile(THREE.MathUtils.clamp(ph.p, 0, 1)) : speedProfile(0);
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
