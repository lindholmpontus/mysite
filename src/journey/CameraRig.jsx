// CameraRig.jsx — the only thing that moves the camera. Reads the page scroll
// progress (a framer-motion MotionValue), damps it, and drives position/lookAt
// along the journey curve with a HARD WORLD-SPEED CAP: each frame's progress
// step is shrunk until the camera's path movement fits the speed budget, so
// the flight between planets always takes real seconds, no matter how hard
// you scroll. Also handles instant teleports (progress-rail clicks), banks the
// camera into turns, kicks the FOV at warp, and publishes everything to
// `journeyState` + MotionValues for the HUD.
/* eslint-disable react-hooks/immutability -- intentional per-frame mutation of camera + shared journey singletons */
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  sampleJourney,
  journeyState,
  CAM_FOV,
  FOV_KICK,
  MAX_WORLD_SPEED,
  SCROLL_RATE_BASE,
  SCROLL_RATE_GAIN,
} from "./journeyConfig";
import { PLANETS, SUN_RADIUS } from "../scene/planets.config";

// keep-out spheres so the camera arcs AROUND bodies instead of through them.
// keep = how far off-center the camera must stay. For planets it's just under
// the parking distance (~3.2*r + 8), so a flyby sweeps past at about the same
// comfortable size you orbit at — never skimming the surface, never clipping.
// The sun keeps a small margin so the launch leg (which passes ~17 off it) is
// left alone.
const BODIES = [
  ...PLANETS.map((p) => ({ c: new THREE.Vector3(...p.position), keep: p.radius * 3.5 + 4 })),
  { c: new THREE.Vector3(0, 0, 0), keep: SUN_RADIUS + 6 },
];

// reusable temporaries (no per-frame allocations)
const _pos = new THREE.Vector3();
const _tgt = new THREE.Vector3();
const _vel = new THREE.Vector3();
const _right = new THREE.Vector3();
const _pathA = new THREE.Vector3();
const _pathB = new THREE.Vector3();
const _tgtTmp = new THREE.Vector3();
const _lookT = new THREE.Vector3();
const _av = new THREE.Vector3();

// push a position radially out of any body's keep-out sphere. The route is
// pre-baked to clear every body, so this is just a silent last-resort floor.
function pushOut(v) {
  for (let i = 0; i < BODIES.length; i++) {
    const b = BODIES[i];
    _av.copy(v).sub(b.c);
    const d = _av.length();
    if (d > 1e-3 && d < b.keep) v.addScaledVector(_av, (b.keep - d) / d);
  }
}

export default function CameraRig({ progress, flightMV, speedMV, warpMV }) {
  const { camera } = useThree();
  const sm = useRef(null);
  if (sm.current === null) {
    sm.current = {
      t: progress.get(),
      pos: new THREE.Vector3(),
      tgt: new THREE.Vector3(),
      prevPos: new THREE.Vector3(),
      roll: 0,
      fov: CAM_FOV,
      init: false,
    };
  }

  // priority -2: runs before the rocket/streaks (-1), so they always read
  // THIS frame's camera transform (a rigidly-attached ship can't lag a frame)
  useFrame((r3f, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const s = sm.current;

    // 0) teleport request (progress-rail click): snap, re-seed, zero velocity
    if (journeyState.snapTo !== null) {
      s.t = journeyState.snapTo;
      journeyState.snapTo = null;
      s.init = false;
    }

    // 1) damp scroll, cap progress-rate
    const raw = progress.get();
    const gap = raw - s.t;
    const maxStep = (SCROLL_RATE_BASE + Math.abs(gap) * SCROLL_RATE_GAIN) * dt;
    let step = THREE.MathUtils.clamp(gap * (1 - Math.exp(-3.4 * dt)), -maxStep, maxStep);

    // 2) world-speed budget: shrink the step until the camera's actual path
    // movement fits MAX_WORLD_SPEED (progress isn't proportional to distance —
    // an entire 125-unit leg lives in a small scroll window)
    if (step !== 0) {
      const budget = MAX_WORLD_SPEED * dt;
      sampleJourney(s.t, _pathA, _tgtTmp);
      sampleJourney(s.t + step, _pathB, _tgtTmp);
      let move = _pathA.distanceTo(_pathB);
      if (move > budget) {
        step *= budget / move;
        // refine once — curve speed varies within the step
        sampleJourney(s.t + step, _pathB, _tgtTmp);
        move = _pathA.distanceTo(_pathB);
        if (move > budget) step *= budget / move;
      }
    }
    s.t += step;

    const ph = sampleJourney(s.t, _pos, _tgt);

    // 3) idle drift while parked, so orbit shots feel alive (fades out at speed)
    const time = r3f.clock.elapsedTime;
    const calm = 1 - Math.min(journeyState.warp * 3, 1);
    _pos.x += Math.sin(time * 0.21) * 0.5 * calm;
    _pos.y += Math.sin(time * 0.16 + 2.1) * 0.35 * calm;

    pushOut(_pos); // silent safety floor (route is pre-baked to clear bodies)

    if (!s.init) {
      s.pos.copy(_pos);
      s.tgt.copy(_tgt);
      s.prevPos.copy(_pos);
      s.init = true;
    }

    // 4) light position smoothing. A faithful copy of _pos exposed per-frame
    // idle-drift noise as "speed" (warp streaks + a strobing duplicate ship
    // when parked), so we keep a damping lerp — but a FAST one (rate 9), so it
    // barely lags the curve and only lightly trims the departure corner. The
    // route is baked with a big clearance buffer to absorb that small trim.
    const k = 1 - Math.exp(-9 * dt);
    s.pos.lerp(_pos, k);
    s.tgt.lerp(_tgt, k);
    pushOut(s.pos); // safety floor (never fires while the route stays clear)

    _vel.copy(s.pos).sub(s.prevPos).divideScalar(dt || 1e-3);
    const speed = _vel.length();
    s.prevPos.copy(s.pos);

    camera.position.copy(s.pos);
    camera.up.set(0, 1, 0);
    // portrait (mobile): aim below the focus so the planet rides up into the
    // top half of the screen, leaving the bottom half for the info sheet
    if (camera.aspect < 0.85) {
      _lookT.copy(s.tgt);
      _lookT.y -= 0.34 * camera.position.distanceTo(s.tgt);
      camera.lookAt(_lookT);
    } else {
      camera.lookAt(s.tgt);
    }

    // 5) bank into lateral motion (roll around the view axis)
    _right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    const rollTarget = THREE.MathUtils.clamp(-_vel.dot(_right) * 0.014, -0.2, 0.2);
    s.roll += (rollTarget - s.roll) * (1 - Math.exp(-4 * dt));
    camera.rotateZ(s.roll);

    // 6) FOV widens with speed — normalized to the world-speed cap
    const warp = THREE.MathUtils.clamp(speed / MAX_WORLD_SPEED, 0, 1);
    const fovTarget = CAM_FOV + FOV_KICK * warp;
    s.fov += (fovTarget - s.fov) * (1 - Math.exp(-4 * dt));
    if (Math.abs(camera.fov - s.fov) > 0.01) {
      camera.fov = s.fov;
      camera.updateProjectionMatrix();
    }

    // 7) publish — flightMV is the ship's REAL position along the route; all
    // HTML overlays read this (not the raw scroll), so nothing can appear
    // before the rocket actually gets there
    journeyState.speed = speed;
    journeyState.warp = warp;
    journeyState.bank = s.roll;
    journeyState.u = ph.u;
    if (speed > 0.5) journeyState.dir.copy(_vel).normalize();
    flightMV.set(s.t);
    speedMV.set(speed);
    warpMV.set(warp);
  }, -2);

  return null;
}
