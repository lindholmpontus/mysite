// CameraRig.jsx — the only thing that moves the camera. A small state machine:
// PARKED at a stop, or FLYING a leg (see flight.js — a timed S-curve along
// the route, analytic and C2-smooth). A new scroll target launches the flight
// on the very next frame (no dead time); a rail click teleports. On top of
// the pose it banks a few degrees into the path's curvature, widens the FOV
// gently with speed, and drifts while parked. Deliberately calm: no shake, no
// zoom punch, no big rolls — a gliding camera. Publishes everything to
// `journeyState` + MotionValues for the HUD, ship and effects.
/* eslint-disable react-hooks/immutability -- intentional per-frame mutation of camera + shared journey singletons */
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  sampleJourney,
  journeyState,
  keepFor,
  SUN_KEEP,
  CAM_FOV,
  CAM_FOV_PORTRAIT,
  REGARD_PORTRAIT,
  FOV_KICK,
  DWELLS,
  scrollTargetFor,
} from "./journeyConfig";
import {
  LEGS,
  FLIGHT,
  legMotion,
  legPose,
  legPoint,
  legLateral,
  travelProgress,
  stopForProgress,
  smootherstep,
  createSteadyClock,
} from "./flight";
import { PLANETS } from "../scene/planets.config";

const LOOK_DIST = 60;
const BANK_PER_ACCEL = 0.0016; // rad of roll per unit of lateral acceleration
const BANK_MAX = 0.07; // ~4°: a hint of a banked turn, never a tilting horizon
const CALM_IN = 1.6; // s — idle drift fades in after arrival
const CALM_OUT = 0.7; // s — ...and out on departure

// keep-out spheres (same keepFor the route is baked with) — a silent safety
// floor; the route itself already clears every body
const BODIES = [
  ...PLANETS.map((p) => ({ c: new THREE.Vector3(...p.position), keep: keepFor(p.radius) })),
  { c: new THREE.Vector3(0, 0, 0), keep: SUN_KEEP },
];

// reusable temporaries (no per-frame allocations)
const _pos = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _tgt = new THREE.Vector3();
const _lat = new THREE.Vector3();
const _right = new THREE.Vector3();
const _lookT = new THREE.Vector3();
const _next = new THREE.Vector3();
const _av = new THREE.Vector3();
const _motion = { s: 0, v: 0, a: 0 };

function pushOut(v) {
  for (let i = 0; i < BODIES.length; i++) {
    const b = BODIES[i];
    _av.copy(v).sub(b.c);
    const d = _av.length();
    if (d > 1e-3 && d < b.keep) v.addScaledVector(_av, (b.keep - d) / d);
  }
}

// the HUD's progress value while parked (launch reads 0: hero fully shown)
const parkedProgress = (stop) => (stop === 0 ? 0 : scrollTargetFor(stop));

export default function CameraRig({ progress, flightMV, speedMV, warpMV }) {
  const { camera } = useThree();
  const steady = useMemo(() => createSteadyClock(), []);
  const sm = useRef(null);
  if (sm.current === null) {
    sm.current = {
      mode: "parked",
      stop: stopForProgress(progress.get()),
      leg: null,
      tau: 0,
      calm: 1,
      calm0: 1,
      sinceArrive: Infinity,
      roll: 0,
      fov: CAM_FOV,
    };
  }

  // priority -2: runs before the rocket/streaks (-1), so they always read
  // THIS frame's camera transform (a rigidly-attached ship can't lag a frame)
  useFrame((r3f, delta) => {
    const dt = THREE.MathUtils.clamp(steady(delta), 1e-4, 1 / 30);
    const s = sm.current;
    const portrait = camera.aspect < 0.85;
    const regard = portrait ? REGARD_PORTRAIT : undefined;
    const time = r3f.clock.elapsedTime;

    // 0) teleport request (progress-rail click): park there instantly
    if (journeyState.snapTo !== null) {
      s.stop = stopForProgress(journeyState.snapTo);
      journeyState.snapTo = null;
      s.mode = "parked";
      s.leg = null;
      s.calm = 1;
      s.sinceArrive = Infinity;
    }

    // 1) launch: the scroll target moved past our stop -> fly the next leg,
    // starting THIS frame (the journey is one-way; backward = teleport)
    const target = stopForProgress(progress.get());
    if (s.mode === "parked" && target > s.stop) {
      s.mode = "flying";
      s.leg = LEGS[s.stop];
      s.tau = 0;
      s.calm0 = s.calm;
    }

    // 2) advance the flight; arrival parks exactly on the next stop's pose
    if (s.mode === "flying") {
      s.tau += dt;
      if (s.tau >= s.leg.duration) {
        s.stop = s.leg.to;
        s.mode = "parked";
        s.leg = null;
        s.sinceArrive = 0;
      }
    } else {
      s.sinceArrive += dt;
    }

    // 3) pose
    let v = 0;
    let a = 0;
    let frac = 0;
    const leg = s.leg;
    if (leg) {
      legMotion(leg, s.tau, _motion);
      v = _motion.v;
      a = _motion.a;
      frac = _motion.s / leg.length;
      legPose(leg, s.tau, _motion.s, regard, _pos, _dir);
      legLateral(leg, _motion.s, v, _lat);
      legPoint(leg, _motion.s + 0.5, _next);
      journeyState.dir.copy(_next).sub(_pos).normalize();
      s.calm = s.calm0 * (1 - smootherstep(s.tau / CALM_OUT));
    } else {
      sampleJourney(scrollTargetFor(s.stop), _pos, _tgt, regard);
      _dir.copy(_tgt).sub(_pos).normalize();
      _lat.set(0, 0, 0);
      s.calm = s.sinceArrive === Infinity ? 1 : smootherstep(s.sinceArrive / CALM_IN);
    }

    // idle drift while parked, so orbit shots feel alive (continuous: it
    // eases out on departure and back in after arrival)
    _pos.x += Math.sin(time * 0.21) * 0.5 * s.calm;
    _pos.y += Math.sin(time * 0.16 + 2.1) * 0.35 * s.calm;
    pushOut(_pos);

    camera.position.copy(_pos);
    const accelPeak = leg ? leg.accelPeak : 1;
    const thrust = leg ? Math.max(0, a) / accelPeak : 0;

    // 4) orientation: look along the blended flight direction
    _tgt.copy(_pos).addScaledVector(_dir, LOOK_DIST);
    camera.up.set(0, 1, 0);
    if (portrait) {
      // aim below the focus so the planet rides up into the top half, clear
      // of the info sheet
      _lookT.copy(_tgt);
      _lookT.y -= 0.34 * LOOK_DIST;
      camera.lookAt(_lookT);
    } else {
      camera.lookAt(_tgt);
    }

    // 5) bank into the turn: roll toward the path's centripetal acceleration
    _right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    const latR = _lat.dot(_right);
    const bankTarget = THREE.MathUtils.clamp(-latR * BANK_PER_ACCEL, -BANK_MAX, BANK_MAX);
    s.roll += (bankTarget - s.roll) * (1 - Math.exp(-2.5 * dt));
    camera.rotateZ(s.roll);

    // 6) FOV widens gently with speed
    const warp = leg ? v / leg.cruise : 0;
    const base = portrait ? CAM_FOV_PORTRAIT : CAM_FOV;
    const fovTarget = base + FOV_KICK * smootherstep(warp);
    s.fov += (fovTarget - s.fov) * (1 - Math.exp(-5 * dt));
    if (Math.abs(camera.fov - s.fov) > 0.01) {
      camera.fov = s.fov;
      camera.updateProjectionMatrix();
    }

    // 7) publish — flightMV is the ship's REAL place in the journey: inside the
    // travel window for the whole flight, the stop's dwell once arrived. All
    // HTML overlays read this, so nothing appears before the ship gets there.
    journeyState.speed = v;
    journeyState.warp = warp;
    journeyState.thrust = thrust;
    journeyState.brake = leg ? Math.max(0, -a) / ((leg.cruise * 1.875) / FLIGHT.brakeTime) : 0;
    journeyState.accel = leg ? a / accelPeak : 0;
    journeyState.lateral = THREE.MathUtils.clamp(latR / 50, -1, 1);
    journeyState.bank = s.roll;
    journeyState.u = leg ? leg.u0 + (leg.u1 - leg.u0) * frac : s.stop / (DWELLS.length - 1);
    flightMV.set(leg ? travelProgress(leg, frac, DWELLS) : parkedProgress(s.stop));
    speedMV.set(v);
    warpMV.set(warp);
  }, -2);

  return null;
}
