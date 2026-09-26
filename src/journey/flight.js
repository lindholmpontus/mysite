// flight.js — a leg between two stops, flown as a timed, fully analytic
// maneuver. The camera no longer chases a damped scroll value through speed
// and turn-rate clamps (that gave ~0.6 s of dead time after every scroll, mid-
// flight braking whenever a clamp bit, and jittery acceleration). Instead:
//
//   - the route curve is re-parameterised by DISTANCE per leg, so the ship's
//     speed along it is exactly what the profile says (no wobble from uneven
//     control-point spacing);
//   - distance over time is an S-curve: smootherstep punch-out -> cruise ->
//     a longer smootherstep brake. Position, velocity and acceleration are all
//     continuous by construction — nothing ever clamps mid-flight;
//   - the view aims a fixed distance ahead along the path, blended from the
//     departure framing into the arrival framing, so every leg starts and
//     ends exactly on the parked pose;
//   - banking comes from the path's real curvature (lateral acceleration).
//
// Same curve as before, so scripts/verify-route.mjs clearances still hold.
import * as THREE from "three";
import { STOPS, ROUTE, sampleJourney, scrollTargetFor } from "./journeyConfig";

export const FLIGHT = {
  accelTime: 1.2, // s — a firm but unhurried push-off
  brakeTime: 1.5, // s — longer and gentler: a graceful arrival, no creep
  durBase: 2.25, // s — leg duration = durBase + length / durRate, clamped
  durRate: 150,
  durMin: 3.0,
  durMax: 3.9,
  // world units along the path the view aims at. Far ahead on purpose: it
  // averages out the route's S-bends, so the view glides (≤ ~9°/s) instead of
  // yawing left-right with every bend
  lookAhead: 170,
  curveProbe: 7, // world units — curvature sampled over +/- this
};

const TABLE = 600; // arc-length samples per leg
const N = STOPS.length;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
// smootherstep and its derivative / integral (from 0): C2 ramps, so the
// acceleration starts and ends at zero with no jerk spike
const ss = (x) => x * x * x * (x * (x * 6 - 15) + 10);
const ssD = (x) => 30 * x * x * (x - 1) * (x - 1);
const ssI = (x) => x * x * x * x * (x * (x - 3) + 2.5);
export const smootherstep = (x) => ss(clamp01(x));

// ---- per-leg arc-length tables ----
export const LEGS = [];
{
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  for (let i = 0; i < N - 1; i++) {
    const u0 = i / (N - 1);
    const u1 = (i + 1) / (N - 1);
    const us = new Float64Array(TABLE + 1);
    const sd = new Float64Array(TABLE + 1);
    ROUTE.getPoint(u0, a);
    let acc = 0;
    for (let k = 0; k <= TABLE; k++) {
      const u = u0 + (u1 - u0) * (k / TABLE);
      ROUTE.getPoint(u, b);
      if (k > 0) acc += a.distanceTo(b);
      us[k] = u;
      sd[k] = acc;
      a.copy(b);
    }
    const length = acc;
    const duration = THREE.MathUtils.clamp(FLIGHT.durBase + length / FLIGHT.durRate, FLIGHT.durMin, FLIGHT.durMax);
    const cruise = length / (duration - (FLIGHT.accelTime + FLIGHT.brakeTime) / 2);
    LEGS.push({
      from: i,
      to: i + 1,
      u0,
      u1,
      us,
      sd,
      length,
      duration,
      cruise, // top speed (world units / s)
      accelPeak: (cruise * 1.875) / FLIGHT.accelTime, // smootherstep' peaks at 1.875
      startTan: ROUTE.getTangent(u0, new THREE.Vector3()).normalize(),
      endTan: ROUTE.getTangent(u1, new THREE.Vector3()).normalize(),
    });
  }
}

function uAt(leg, s) {
  const { sd, us } = leg;
  let lo = 0;
  let hi = TABLE;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (sd[mid] <= s) lo = mid;
    else hi = mid;
  }
  const f = (s - sd[lo]) / (sd[hi] - sd[lo] || 1);
  return us[lo] + (us[hi] - us[lo]) * f;
}

// point at distance s along the leg (straight extension past either end, so
// look-ahead and curvature probes stay defined at the stops)
export function legPoint(leg, s, out) {
  if (s >= leg.length) return ROUTE.getPoint(leg.u1, out).addScaledVector(leg.endTan, s - leg.length);
  if (s <= 0) return ROUTE.getPoint(leg.u0, out).addScaledVector(leg.startTan, s);
  return ROUTE.getPoint(uAt(leg, s), out);
}

// distance / speed / acceleration along the leg at time tau
export function legMotion(leg, tau, out) {
  const ta = FLIGHT.accelTime;
  const tb = FLIGHT.brakeTime;
  const tc = leg.duration - ta - tb;
  const V = leg.cruise;
  if (tau <= 0) {
    out.s = 0;
    out.v = 0;
    out.a = 0;
  } else if (tau < ta) {
    const x = tau / ta;
    out.s = V * ta * ssI(x);
    out.v = V * ss(x);
    out.a = (V * ssD(x)) / ta;
  } else if (tau < ta + tc) {
    out.s = (V * ta) / 2 + V * (tau - ta);
    out.v = V;
    out.a = 0;
  } else if (tau < leg.duration) {
    const x = (tau - ta - tc) / tb;
    out.s = (V * ta) / 2 + V * tc + V * tb * (x - ssI(x));
    out.v = V * (1 - ss(x));
    out.a = (-V * ssD(x)) / tb;
  } else {
    out.s = leg.length;
    out.v = 0;
    out.a = 0;
  }
  return out;
}

// the parked view direction at a stop (same pose the dwell uses)
const _pp = new THREE.Vector3();
const _pt = new THREE.Vector3();
export function parkedDir(stop, regard, out) {
  sampleJourney(scrollTargetFor(stop), _pp, _pt, regard);
  return out.copy(_pt).sub(_pp).normalize();
}

const _ahead = new THREE.Vector3();
const _dep = new THREE.Vector3();
const _arr = new THREE.Vector3();
const _p0 = new THREE.Vector3();
const _p1 = new THREE.Vector3();

// position + view direction at time tau into the leg. The view aims
// `lookAhead` along the path, blended from the departure framing (released
// over the punch-out) into the arrival framing (taken up over the brake).
export function legPose(leg, tau, s, regard, outPos, outDir) {
  legPoint(leg, s, outPos);
  legPoint(leg, s + FLIGHT.lookAhead, _ahead);
  outDir.copy(_ahead).sub(outPos).normalize();
  parkedDir(leg.from, regard, _dep);
  parkedDir(leg.to, regard, _arr);
  // a strong regard (portrait framing turns almost fully to each planet)
  // means a bigger swing between stops: spread it over more of the flight
  // — but never longer than the leg: a window that overhangs the start would
  // already be part-way into the arrival framing at launch (a lurch)
  const spread = 1 + Math.max(0, (regard ?? 0) - 0.3);
  const depSpan = Math.min(leg.duration, FLIGHT.accelTime * 2.2 * spread);
  const arrSpan = Math.min(leg.duration, FLIGHT.brakeTime * 2.0 * spread);
  const wDep = 1 - smootherstep(tau / depSpan);
  const wArr = smootherstep((tau - (leg.duration - arrSpan)) / arrSpan);
  // spherical blends: a straight vector lerp between framings far apart
  // (portrait: one planet on the left behind you, the next on the right
  // ahead) sweeps unevenly, fastest mid-blend; slerp turns at an even rate
  slerpDir(outDir, _dep, wDep);
  slerpDir(outDir, _arr, wArr);
  return outPos;
}

// rotate unit vector `a` a fraction t of the way to unit vector `b` (in place)
const _perp = new THREE.Vector3();
function slerpDir(a, b, t) {
  if (t <= 0) return a;
  if (t >= 1) return a.copy(b);
  const cos = THREE.MathUtils.clamp(a.dot(b), -1, 1);
  const theta = Math.acos(cos);
  if (theta < 1e-4) return a;
  _perp.copy(b).addScaledVector(a, -cos).normalize(); // b's part orthogonal to a
  return a.multiplyScalar(Math.cos(theta * t)).addScaledVector(_perp, Math.sin(theta * t));
}

// centripetal acceleration vector at distance s moving at speed v (v^2 * k)
export function legLateral(leg, s, v, out) {
  const h = FLIGHT.curveProbe;
  legPoint(leg, s - h, _p0);
  legPoint(leg, s + h, _p1);
  legPoint(leg, s, out);
  // second difference / h^2 = curvature vector
  return out.multiplyScalar(-2).add(_p0).add(_p1).multiplyScalar((v * v) / (h * h));
}

// where the HUD's progress value sits for a ship `frac` of the way along a
// leg: strictly inside the travel window (so the page reads "travel" from the
// first frame of a flight to the last), then the stop's dwell centre on arrival
export function travelProgress(leg, frac, dwells) {
  const a = dwells[leg.from].t1;
  const b = dwells[leg.to].t0;
  const eps = (b - a) * 1e-3;
  return a + eps + (b - a - 2 * eps) * clamp01(frac);
}

// the stop whose dwell centre is nearest a progress value (rail teleports and
// scroll targets are dwell centres)
export function stopForProgress(t) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < N; i++) {
    const d = Math.abs(scrollTargetFor(i) - t);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

// A steady frame clock. performance.now() deltas jitter by ~±1 ms around a
// 4.2 ms (240 Hz) frame with main-thread scheduling, while the display shows
// frames at a fixed cadence — so advancing motion by the raw delta makes each
// shown frame move a slightly different distance (visible micro-judder at
// speed). Quantise instead to whole display periods (the median of recent
// deltas): every shown frame advances the same amount, and a genuinely
// dropped frame still advances two.
export function createSteadyClock(size = 31) {
  const hist = [];
  const sorted = [];
  return (delta) => {
    if (!(delta > 0)) return 0;
    hist.push(delta);
    if (hist.length > size) hist.shift();
    sorted.length = 0;
    for (const d of hist) sorted.push(d);
    sorted.sort((x, y) => x - y);
    const period = sorted[sorted.length >> 1];
    return Math.max(1, Math.round(delta / period)) * period;
  };
}
