// verify-route.mjs — offline check of the journey route geometry. Mirrors the
// layout math in src/journey/journeyConfig.js + src/scene/planets.config.js
// (keep the constants in sync when tuning!). Reports, for the whole route:
//   - min clearance from every body (camera path vs keep-out spheres)
//   - max turn rate (deg/s) given the speed profile
//   - parked framing per planet (apparent diameter as % of screen height)
//   - leg flight times
// Run: node scripts/verify-route.mjs
import * as THREE from "three";

/* ---- mirrored from planets.config.js ---- */
const SUN_RADIUS = 9;
const PLANETS = [
  { id: "about", radius: 8.5, position: [-30, 6, -140], side: "left" },
  { id: "career", radius: 7.2, position: [30, 6, -330], side: "right" },
  { id: "projects", radius: 13.0, position: [-30, 6, -520], side: "left" },
  { id: "skills", radius: 10.5, position: [30, 6, -710], side: "right" },
  { id: "hobbies", radius: 8.5, position: [-30, 6, -900], side: "left" },
  { id: "contact", radius: 8.2, position: [30, 6, -1090], side: "right" },
];

/* ---- mirrored from journeyConfig.js ---- */
const CAM_FOV = 58;
const MAX_WORLD_SPEED = 46;
const LANE_Y = 6;
const PARK_DIST = (r) => r * 3.2 + 8; // forward (z) gap from planet to park
const PARK_SIDE = (r) => r * 1.75; // lateral offset, park sits toward the lane
const keepFor = (r) => r * 1.9 + 2.5;
const SUN_KEEP = SUN_RADIUS + 6;
const ROUTE_MARGIN = 3;
const SCROLL_RATE_BASE = 0.05, SCROLL_RATE_GAIN = 0.15;
const MAX_TURN_RATE = (28 * Math.PI) / 180; // rad/s view-turn budget
const WEAVE_X = 4, WEAVE_FX = 0.8, WEAVE_PX = 0.6;
const WEAVE_Y = 2, WEAVE_FY = 0.6, WEAVE_PY = 2.0;
const HERO_DWELL = 5, PLANET_DWELL = 8, OUTRO_DWELL = 7, TRAVEL = 6;
const DEP_PULL = 0.4; // departure/approach control points pulled toward lane
const DEP_AHEAD = 40; // departure point this far past the park
const APP_AHEAD = 46; // approach point this far before the next park

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const LAST_Z = PLANETS[PLANETS.length - 1].position[2];

const STOPS = [
  { id: "hero", cam: v3(0, LANE_Y, -22) },
  ...PLANETS.map((p) => {
    const sideSign = p.side === "left" ? -1 : 1;
    return {
      id: p.id,
      planet: p,
      cam: v3(
        p.position[0] - sideSign * PARK_SIDE(p.radius),
        LANE_Y,
        p.position[2] + PARK_DIST(p.radius)
      ),
    };
  }),
  { id: "outro", cam: v3(0, LANE_Y, LAST_Z - 115) },
];
STOPS.forEach((s, i) => {
  s.cam.x += WEAVE_X * Math.sin(i * WEAVE_FX + WEAVE_PX);
  s.cam.y += WEAVE_Y * Math.sin(i * WEAVE_FY + WEAVE_PY);
});
const N = STOPS.length;

const BODIES = [
  ...PLANETS.map((p) => ({ id: p.id, c: v3(...p.position), keep: keepFor(p.radius), r: p.radius })),
  { id: "sun", c: v3(0, 0, 0), keep: SUN_KEEP, r: SUN_RADIUS },
];

function clearPoint(m) {
  for (const b of BODIES) {
    const away = m.clone().sub(b.c);
    const d = away.length();
    const min = b.keep + ROUTE_MARGIN;
    if (d > 1e-3 && d < min) m.copy(b.c).addScaledVector(away.multiplyScalar(1 / d), min);
  }
  return m;
}

// control points: park, departure (pulled to lane), cleared mid, approach, park.
// dep/app offsets are clamped to fractions of the leg so short legs (hero ->
// first planet) can never produce out-of-order control points (a doubled-back
// curve = tangent flip = view whip).
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

/* ---- speed profile (mirrored) ---- */
const smooth01 = (x) => {
  x = Math.min(1, Math.max(0, x));
  return x * x * (3 - 2 * x);
};
function speedProfile(p) {
  const edge = Math.min(p, 1 - p); // 0 at both leg ends, 0.5 mid-leg
  const ramp = 0.3 + 0.7 * smooth01(edge / 0.18);
  const surge = 1 + 0.3 * smooth01((edge - 0.18) / 0.14);
  return ramp * surge;
}

/* ---- scroll windows / sampling (mirrored from journeyConfig) ---- */
const easeInOutCubic = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const DWELLS = (() => {
  const dwells = [HERO_DWELL, ...PLANETS.map(() => PLANET_DWELL), OUTRO_DWELL];
  const totalW = dwells.reduce((s, d) => s + d, 0) + TRAVEL * (N - 1);
  let acc = 0;
  return dwells.map((d, i) => {
    const t0 = acc / totalW;
    acc += d;
    const t1 = acc / totalW;
    if (i < N - 1) acc += TRAVEL;
    return { t0, t1 };
  });
})();
const scrollTargetFor = (i) => (DWELLS[i].t0 + DWELLS[i].t1) / 2;
function phaseAt(t) {
  t = Math.min(1, Math.max(0, t));
  for (let i = 0; i < N; i++) {
    const d = DWELLS[i];
    if (t < d.t0) {
      const prev = DWELLS[i - 1];
      return { index: i - 1, phase: "travel", p: (t - prev.t1) / (d.t0 - prev.t1) };
    }
    if (t <= d.t1) return { index: i, phase: "dwell", p: 0 };
  }
  return { index: N - 1, phase: "dwell", p: 1 };
}
function sampleU(t) {
  const ph = phaseAt(t);
  return ph.phase === "dwell"
    ? ph.index / (N - 1)
    : (ph.index + easeInOutCubic(Math.min(1, Math.max(0, ph.p)))) / (N - 1);
}
function samplePos(t, out) {
  return posCurve.getPoint(sampleU(t), out);
}
function profileAt(t) {
  const ph = phaseAt(t);
  return ph.phase === "travel" ? speedProfile(ph.p) : speedProfile(0);
}

/* ================== checks ================== */
let worstClear = { d: Infinity };
const SAMPLES = 8000;
const pts = [];
for (let i = 0; i <= SAMPLES; i++) pts.push(posCurve.getPoint(i / SAMPLES));

// 1) clearance along the whole curve
for (let i = 0; i < pts.length; i++) {
  for (const b of BODIES) {
    const d = pts[i].distanceTo(b.c) - b.keep;
    if (d < worstClear.d) worstClear = { d, body: b.id, u: i / SAMPLES };
  }
}

// 2) per-leg: replicate the ACTUAL CameraRig loop (exp damp + scroll-rate cap +
// profiled world-speed budget) and measure flight time, peak speed, max view
// turn rate (tangent angle change per second).
console.log("leg timings, peak speed + max turn rate (CameraRig loop replica):");
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
const tanPrev = new THREE.Vector3(), tanCur = new THREE.Vector3();
for (let leg = 0; leg < N - 1; leg++) {
  let st = scrollTargetFor(leg);
  const target = scrollTargetFor(leg + 1);
  const DT = 1 / 60;
  let time = 0, turnMax = 0, turnAt = null, vMax = 0, guard = 0;
  posCurve.getTangent(sampleU(st), tanPrev).normalize();
  while (guard++ < 6000) {
    const gap = target - st;
    const maxStep = (SCROLL_RATE_BASE + Math.abs(gap) * SCROLL_RATE_GAIN) * DT;
    let step = Math.min(maxStep, Math.max(-maxStep, gap * (1 - Math.exp(-3.4 * DT))));
    let speedNow = 0;
    if (step !== 0) {
      const budget =
        MAX_WORLD_SPEED * Math.min(profileAt(st), profileAt(st + step)) * DT;
      samplePos(st, _a);
      // iterative shrink: world-speed budget AND view-turn budget (curve speed
      // and curvature both vary within a step, so refine a few times)
      const turnBudget = MAX_TURN_RATE * DT;
      const t0v = posCurve.getTangent(sampleU(st), new THREE.Vector3()).normalize();
      const t1v = new THREE.Vector3();
      for (let it = 0; it < 4; it++) {
        samplePos(st + step, _b);
        const move = _a.distanceTo(_b);
        posCurve.getTangent(sampleU(st + step), t1v).normalize();
        const turn = t0v.angleTo(t1v);
        const over = Math.max(move / budget, turn / turnBudget);
        if (over <= 1.001) break;
        step /= over;
      }
      samplePos(st + step, _b);
      speedNow = _a.distanceTo(_b) / DT;
      vMax = Math.max(vMax, speedNow);
    }
    st += step;
    posCurve.getTangent(sampleU(st), tanCur).normalize();
    const turn = tanPrev.angleTo(tanCur) / DT;
    if (turn > turnMax) {
      turnMax = turn;
      turnAt = { ph: phaseAt(st), speed: speedNow };
    }
    tanPrev.copy(tanCur);
    time += DT;
    // arrived: inside the next dwell and barely moving
    if (phaseAt(st).index === leg + 1 && Math.abs(gap) < 0.002) break;
  }
  const where = turnAt
    ? `at ${turnAt.ph.phase} p=${(turnAt.ph.p ?? 0).toFixed(2)} v=${turnAt.speed.toFixed(0)}`
    : "";
  console.log(
    `  ${STOPS[leg].id.padEnd(8)} -> ${STOPS[leg + 1].id.padEnd(8)}  ${time.toFixed(1)}s` +
      `  peak ${vMax.toFixed(0)} u/s  maxTurn ${((turnMax * 180) / Math.PI).toFixed(1)} deg/s (${where})`
  );
}

// 3) parked framing per planet
console.log("\nparked framing (apparent planet diameter as % of screen height @16:9):");
const halfV = THREE.MathUtils.degToRad(CAM_FOV / 2);
for (let i = 0; i < PLANETS.length; i++) {
  const stop = STOPS[i + 1];
  const c = v3(...stop.planet.position);
  const d = stop.cam.distanceTo(c);
  const angR = Math.atan(stop.planet.radius / d);
  const frac = angR / halfV; // radius as fraction of half screen height
  // off-axis angle vs the tangent at the park
  const u = (i + 1) / (N - 1);
  const tan = posCurve.getTangent(u, new THREE.Vector3()).normalize();
  const toP = c.clone().sub(stop.cam).normalize();
  const off = THREE.MathUtils.radToDeg(tan.angleTo(toP));
  console.log(
    `  ${stop.id.padEnd(8)} dist ${d.toFixed(1)} (=${(d / stop.planet.radius).toFixed(2)}r)  ` +
      `diameter ${(frac * 100).toFixed(0)}% of screen height  off-axis ${off.toFixed(1)} deg`
  );
}

console.log(
  `\nworst clearance: ${worstClear.d.toFixed(2)} beyond keep-out (body: ${worstClear.body})` +
    (worstClear.d < 1 ? "  *** TOO CLOSE — TUNE ***" : "  OK")
);
