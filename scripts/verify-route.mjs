// verify-route.mjs — offline check of the journey route geometry. Mirrors the
// layout math in src/journey/journeyConfig.js + src/scene/planets.config.js
// (keep the constants in sync when tuning!). Reports, for the whole route:
//   - min clearance from every body (camera path vs keep-out spheres)
//   - per leg (the flight model in src/journey/flight.js): length, duration,
//     cruise speed, peak acceleration and peak view-turn rate
//   - parked framing per planet (apparent diameter as % of screen height)
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
const LANE_Y = 6;
const PARK_DIST = (r) => r * 3.2 + 8; // forward (z) gap from planet to park
const PARK_SIDE = (r) => r * 1.75; // lateral offset, park sits toward the lane
const keepFor = (r) => r * 1.9 + 2.5;
const SUN_KEEP = SUN_RADIUS + 6;
const ROUTE_MARGIN = 3;
const REGARD = 0.2; // parked view eased this far toward the planet
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

/* ---- flight model (mirrored from src/journey/flight.js) ---- */
const FLIGHT = {
  accelTime: 1.2, brakeTime: 1.5,
  durBase: 2.25, durRate: 150, durMin: 3.0, durMax: 3.9,
  lookAhead: 170,
};
const ss = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * x * (x * (x * 6 - 15) + 10); };
const ssD = (x) => 30 * x * x * (x - 1) * (x - 1);
const ssI = (x) => x * x * x * x * (x * (x - 3) + 2.5);

function buildLeg(i) {
  const u0 = i / (N - 1), u1 = (i + 1) / (N - 1);
  const TABLE = 600, us = [], sd = [];
  const a = posCurve.getPoint(u0), b = new THREE.Vector3();
  let acc = 0;
  for (let k = 0; k <= TABLE; k++) {
    const u = u0 + (u1 - u0) * (k / TABLE);
    posCurve.getPoint(u, b);
    if (k > 0) acc += a.distanceTo(b);
    us.push(u); sd.push(acc); a.copy(b);
  }
  const duration = Math.min(FLIGHT.durMax, Math.max(FLIGHT.durMin, FLIGHT.durBase + acc / FLIGHT.durRate));
  const cruise = acc / (duration - (FLIGHT.accelTime + FLIGHT.brakeTime) / 2);
  const endTan = posCurve.getTangent(u1, new THREE.Vector3()).normalize();
  return { i, u0, u1, us, sd, length: acc, duration, cruise, endTan };
}
function legPoint(leg, s, out) {
  if (s >= leg.length) return posCurve.getPoint(leg.u1, out).addScaledVector(leg.endTan, s - leg.length);
  let k = leg.sd.findIndex((d) => d > s);
  if (k <= 0) k = 1;
  const f = (s - leg.sd[k - 1]) / (leg.sd[k] - leg.sd[k - 1] || 1);
  return posCurve.getPoint(leg.us[k - 1] + (leg.us[k] - leg.us[k - 1]) * f, out);
}
function legS(leg, tau) {
  const ta = FLIGHT.accelTime, tb = FLIGHT.brakeTime, tc = leg.duration - ta - tb, V = leg.cruise;
  if (tau <= 0) return 0;
  if (tau < ta) return V * ta * ssI(tau / ta);
  if (tau < ta + tc) return (V * ta) / 2 + V * (tau - ta);
  if (tau < leg.duration) { const x = (tau - ta - tc) / tb; return (V * ta) / 2 + V * tc + V * tb * (x - ssI(x)); }
  return leg.length;
}
// parked view direction: tangent eased toward the planet (plain tangent at
// the launch / deep-space stops)
function parkedDir(k) {
  const u = k / (N - 1);
  const p = posCurve.getPoint(u);
  const d = posCurve.getTangent(u, new THREE.Vector3()).normalize();
  if (STOPS[k].planet) d.lerp(v3(...STOPS[k].planet.position).sub(p).normalize(), REGARD).normalize();
  return d;
}
function viewDir(leg, tau, out) {
  const s = legS(leg, tau);
  const p = legPoint(leg, s, new THREE.Vector3());
  out.copy(legPoint(leg, s + FLIGHT.lookAhead, new THREE.Vector3())).sub(p).normalize();
  const wDep = 1 - ss(tau / Math.min(leg.duration, FLIGHT.accelTime * 2.2));
  const span = Math.min(leg.duration, FLIGHT.brakeTime * 2.0);
  const wArr = ss((tau - (leg.duration - span)) / span);
  return slerpDir(slerpDir(out, parkedDir(leg.i), wDep), parkedDir(leg.i + 1), wArr);
}
function slerpDir(a, b, t) {
  if (t <= 0) return a;
  if (t >= 1) return a.copy(b);
  const cos = Math.min(1, Math.max(-1, a.dot(b)));
  const theta = Math.acos(cos);
  if (theta < 1e-4) return a;
  const perp = b.clone().addScaledVector(a, -cos).normalize();
  return a.multiplyScalar(Math.cos(theta * t)).addScaledVector(perp, Math.sin(theta * t));
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

// 2) per-leg flight (the analytic model): duration, cruise speed, peak
// acceleration, peak view-turn rate
console.log("legs (timed S-curve flights):");
for (let i = 0; i < N - 1; i++) {
  const leg = buildLeg(i);
  const DT = 1 / 240;
  const d0 = new THREE.Vector3(), d1 = new THREE.Vector3();
  viewDir(leg, 0, d0);
  let turnMax = 0;
  for (let tau = DT; tau <= leg.duration; tau += DT) {
    viewDir(leg, tau, d1);
    turnMax = Math.max(turnMax, d0.angleTo(d1) / DT);
    d0.copy(d1);
  }
  const accelPeak = (leg.cruise * 1.875) / FLIGHT.accelTime;
  console.log(
    `  ${STOPS[i].id.padEnd(8)} -> ${STOPS[i + 1].id.padEnd(8)}  ${leg.length.toFixed(0).padStart(4)} u in ${leg.duration.toFixed(2)}s` +
      `  cruise ${leg.cruise.toFixed(0)} u/s  peak accel ${accelPeak.toFixed(0)} u/s²  max view turn ${((turnMax * 180) / Math.PI).toFixed(1)} deg/s`
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
