// CameraRig.jsx — the only thing that moves the camera. Reads the page scroll
// progress (a framer-motion MotionValue), damps it, and drives position/lookAt
// along the journey curve under TWO HARD BUDGETS: each frame's progress step
// is shrunk until (a) the camera's path movement fits the world-speed budget
// (MAX_WORLD_SPEED shaped per-leg by speedMultAt — punch out, surge mid-leg,
// brake in) and (b) the view direction's swing fits the turn-rate budget
// (MAX_TURN_RATE), so the ship slows through banked turns instead of whipping.
// Also handles instant teleports (progress-rail clicks), banks the camera into
// turns, kicks the FOV at warp, adds a faint engine rumble at speed, and
// publishes everything to `journeyState` + MotionValues for the HUD.
/* eslint-disable react-hooks/immutability -- intentional per-frame mutation of camera + shared journey singletons */
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  sampleJourney,
  journeyState,
  prefersReducedMotion,
  keepFor,
  SUN_KEEP,
  speedMultAt,
  CAM_FOV,
  FOV_KICK,
  MAX_WORLD_SPEED,
  MAX_TURN_RATE,
  SCROLL_RATE_BASE,
  SCROLL_RATE_GAIN,
} from "./journeyConfig";
import { PLANETS } from "../scene/planets.config";

// keep-out spheres so the camera arcs AROUND bodies instead of through them
// (same keepFor the route is baked with — this is just a silent safety floor).
const BODIES = [
  ...PLANETS.map((p) => ({ c: new THREE.Vector3(...p.position), keep: keepFor(p.radius) })),
  { c: new THREE.Vector3(0, 0, 0), keep: SUN_KEEP },
];

// reusable temporaries (no per-frame allocations)
const _pos = new THREE.Vector3();
const _tgt = new THREE.Vector3();
const _vel = new THREE.Vector3();
const _right = new THREE.Vector3();
const _pathA = new THREE.Vector3();
const _pathB = new THREE.Vector3();
const _tgtTmp = new THREE.Vector3();
const _dirA = new THREE.Vector3();
const _dirB = new THREE.Vector3();
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
  const reduced = useMemo(() => prefersReducedMotion(), []);
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
    // floor keeps the budget math finite (step /= over) on a zero-delta frame
    const dt = THREE.MathUtils.clamp(delta, 1e-4, 1 / 30);
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
    // clamped to >= 0: the journey is ONE-WAY, so the ship never flies
    // backwards. Nothing asks for a lower progress (steps only advance, and
    // rail clicks teleport via snapTo, handled above), so a negative gap can
    // only be a transient — swallowing it guarantees no reverse travel.
    let step = THREE.MathUtils.clamp(gap * (1 - Math.exp(-3.4 * dt)), 0, maxStep);

    // 2) flight budgets: shrink the step until BOTH fit —
    //    a) world-speed: path movement ≤ MAX_WORLD_SPEED shaped by the per-leg
    //       profile (punch out, surge mid-leg, brake flare in)
    //    b) turn-rate: view-direction swing ≤ MAX_TURN_RATE, so the ship slows
    //       through banked turns instead of whipping the horizon
    // (progress isn't proportional to distance — an entire 190-unit leg lives
    // in a small scroll window). Curve speed and curvature vary within a step,
    // so refine iteratively.
    if (step !== 0) {
      const budget =
        MAX_WORLD_SPEED * Math.min(speedMultAt(s.t), speedMultAt(s.t + step)) * dt;
      const turnBudget = MAX_TURN_RATE * dt;
      sampleJourney(s.t, _pathA, _tgtTmp);
      _dirA.copy(_tgtTmp).sub(_pathA).normalize();
      for (let it = 0; it < 4; it++) {
        sampleJourney(s.t + step, _pathB, _tgtTmp);
        const move = _pathA.distanceTo(_pathB);
        _dirB.copy(_tgtTmp).sub(_pathB).normalize();
        const turn = _dirA.angleTo(_dirB);
        const over = Math.max(move / budget, turn / turnBudget);
        if (over <= 1.001) break;
        step /= over;
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
    const warp = THREE.MathUtils.clamp(speed / MAX_WORLD_SPEED, 0, 1);

    camera.position.copy(s.pos);
    // engine micro-rumble at speed: a faint multi-sine jitter (warp² so it only
    // bites near full speed). Purely cosmetic — applied AFTER s.pos so it never
    // feeds back into velocity/banking. Skipped for reduced-motion users.
    if (!reduced && warp > 0.15) {
      const amp = warp * warp * 0.09;
      camera.position.x += (Math.sin(time * 37.7) + Math.sin(time * 59.3 + 1.7)) * 0.5 * amp;
      camera.position.y += (Math.sin(time * 43.1 + 0.9) + Math.sin(time * 67.9 + 2.3)) * 0.5 * amp;
    }
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

    // 5) bank into lateral motion (roll around the view axis), plus a touch of
    // roll rumble at warp
    _right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    const rollTarget = THREE.MathUtils.clamp(-_vel.dot(_right) * 0.014, -0.2, 0.2);
    s.roll += (rollTarget - s.roll) * (1 - Math.exp(-4 * dt));
    const rollJitter = reduced ? 0 : Math.sin(time * 51.3) * 0.005 * warp * warp;
    camera.rotateZ(s.roll + rollJitter);

    // 6) FOV widens with speed — normalized to the world-speed cap
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
