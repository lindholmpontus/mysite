// Rocket.jsx — your ship, flying the journey ahead of the camera. It is
// RIGIDLY anchored to a point in front of / below the camera (a soft world-
// space follow lagged behind at speed and put the ship outside the frame),
// faces the direction of travel, banks with the camera, and its engine plume
// scales with warp.
import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { journeyState } from "./journeyConfig";
import RocketModel from "./RocketModel";

const _fwd = new THREE.Vector3();
const _up = new THREE.Vector3();
const _right = new THREE.Vector3();

export default function Rocket() {
  const { camera } = useThree();
  const groupRef = useRef();
  const modelRef = useRef();
  const exhaustRef = useRef();
  const lightRef = useRef();

  // priority -1: runs after the CameraRig (-2), so the rigid anchor uses THIS
  // frame's camera transform and the ship can never trail out of view
  useFrame((r3f, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const dt = Math.min(delta, 1 / 30);
    const t = r3f.clock.elapsedTime;
    const { warp, thrust, brake, accel, lateral } = journeyState;

    // anchor: ahead of and slightly below the camera, with a gentle idle bob.
    // On portrait (mobile) the camera aims low to lift the planet up, so the
    // ship rides in the top half, clear of the info sheet's top edge (~44%
    // down); warp pulls it closer so the FOV kick doesn't shrink it.
    // Subtle chase-cam life on top (from the flight's analytic acceleration,
    // so it's as smooth as the flight): the ship eases a little ahead as it
    // pushes off and settles back while braking, and drifts a touch into each
    // turn. Kept small — the ship should feel steady, not thrown around.
    const portrait = camera.aspect < 0.85;
    const dist = (portrait ? 14 : 11) - warp * 1.4 + accel * 0.45;
    const drop = (portrait ? -1.9 : 2.4) + warp * 0.3;
    _fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
    _up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    _right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    g.position
      .copy(camera.position)
      .addScaledVector(_fwd, dist)
      .addScaledVector(_up, -drop + Math.sin(t * 1.3) * 0.12)
      .addScaledVector(_right, lateral * 0.2);

    // ALWAYS match the camera's orientation, so the nose points into the
    // screen (-Z) and the engine plume always trails toward the camera. This
    // is the fix for the "blue tube in front" — facing the velocity vector
    // flipped the ship 180° whenever you scrolled backward.
    g.quaternion.slerp(camera.quaternion, 1 - Math.exp(-6 * dt));

    // attitude (model layer only): banks harder than the camera, yaws its
    // nose into the turn, lifts the nose under thrust and dips it braking
    if (modelRef.current) {
      const m = modelRef.current;
      const k = 1 - Math.exp(-3 * dt);
      const targetRoll = THREE.MathUtils.clamp(journeyState.bank * 2.2, -0.18, 0.18);
      m.rotation.z += (targetRoll - m.rotation.z) * k;
      m.rotation.y += (-lateral * 0.035 - m.rotation.y) * k;
      m.rotation.x += (thrust * 0.02 - brake * 0.015 - m.rotation.x) * k;
      // ship reads slightly smaller (planets feel bigger by contrast) and
      // stretches along its axis at warp — the classic lightspeed cue
      const sBase = 0.85;
      modelRef.current.scale.set(
        sBase * (1 - warp * 0.04),
        sBase * (1 - warp * 0.04),
        sBase * (1 + warp * 0.12)
      );
    }

    // engine plumes stretch with warp (plus a little idle flicker; their glow
    // is driven inside RocketModel). Keep the stretch SHORT: the cones are
    // base-anchored, so scale.y is the FULL tail length, and the camera sits
    // only ~8.5 behind the ship at warp — a long tail reaches the view and
    // blooms into a fat pillar (warp*3.0 even swept past the camera as speed
    // fluctuated)
    if (exhaustRef.current) {
      const flicker = Math.sin(t * 31) * 0.07 + Math.sin(t * 53) * 0.05;
      // flares on the punch-out, throttles back while the retros brake
      const target = 0.45 + warp * 1.1 + thrust * 0.4 - brake * 0.3 + flicker * (0.12 + 0.3 * warp);
      exhaustRef.current.scale.y = THREE.MathUtils.lerp(exhaustRef.current.scale.y, target, dt * 10);
    }
    if (lightRef.current) lightRef.current.intensity = 1 + warp * 3;
  }, -1);

  return (
    <group ref={groupRef}>
      <group ref={modelRef}>
        <RocketModel exhaustRef={exhaustRef} lightRef={lightRef} />
      </group>
    </group>
  );
}
