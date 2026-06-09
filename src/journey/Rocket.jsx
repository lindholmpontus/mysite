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
    const warp = journeyState.warp;

    // anchor: ahead of and slightly below the camera, with a gentle idle bob.
    // On portrait (mobile) the camera aims low to lift the planet up, so the
    // ship rides near screen-center in the top half (above the info sheet);
    // warp pulls it closer so the FOV kick doesn't shrink it.
    const portrait = camera.aspect < 0.85;
    const dist = (portrait ? 14 : 11) - warp * 2.5;
    const drop = (portrait ? -0.6 : 2.4) + warp * 0.3;
    _fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
    _up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    g.position
      .copy(camera.position)
      .addScaledVector(_fwd, dist)
      .addScaledVector(_up, -drop + Math.sin(t * 1.3) * 0.12);

    // ALWAYS match the camera's orientation, so the nose points into the
    // screen (-Z) and the engine plume always trails toward the camera. This
    // is the fix for the "blue tube in front" — facing the velocity vector
    // flipped the ship 180° whenever you scrolled backward.
    g.quaternion.slerp(camera.quaternion, 1 - Math.exp(-6 * dt));

    // cosmetic banking, mirroring the camera roll, plus a slight nose-up while
    // climbing so it reads like a piloted craft (purely from the model layer)
    if (modelRef.current) {
      const targetRoll = THREE.MathUtils.clamp(journeyState.bank * 2.4, -0.5, 0.5);
      modelRef.current.rotation.z = THREE.MathUtils.lerp(
        modelRef.current.rotation.z,
        targetRoll,
        dt * 6
      );
      // ship reads slightly smaller (planets feel bigger by contrast) and
      // stretches along its axis at warp — the classic lightspeed cue
      const sBase = 0.85;
      modelRef.current.scale.set(
        sBase * (1 - warp * 0.04),
        sBase * (1 - warp * 0.04),
        sBase * (1 + warp * 0.12)
      );
    }

    // engine plume + glow scale with warp (plus a little idle flicker).
    // Keep the stretch SHORT: the cone is base-anchored, so scale.y is the
    // FULL tail length, and the camera sits only ~8.5 behind the ship at warp
    // — a long tail reaches the view and blooms into a fat pillar (warp*3.0
    // even swept past the camera as speed fluctuated)
    if (exhaustRef.current) {
      const flicker = Math.sin(t * 31) * 0.07 + Math.sin(t * 53) * 0.05;
      const target = 0.45 + warp * 1.1 + flicker * (0.3 + warp);
      exhaustRef.current.scale.y = THREE.MathUtils.lerp(exhaustRef.current.scale.y, target, dt * 10);
      if (exhaustRef.current.material) exhaustRef.current.material.opacity = 0.22 + warp * 0.28;
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
