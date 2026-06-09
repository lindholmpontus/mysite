// JourneyWorld.jsx — assembles the journey's 3D scene: lights, starfield, sun,
// the six section planets, an asteroid belt you fly through between Mars and
// Jupiter, the rocket, the warp streaks, the scroll-driven camera rig, and the
// reticle tracker that projects the active planet to screen space.
import React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Starfield from "../scene/Starfield";
import Sun from "../scene/Sun";
import Planet from "../scene/Planet";
import Asteroids from "../scene/Asteroids";
import SpaceDust from "../scene/SpaceDust";
import Rocket from "./Rocket";
import WarpStreaks from "./WarpStreaks";
import CameraRig from "./CameraRig";
import { PLANETS } from "../scene/planets.config";

export default function JourneyWorld({
  quality = "high",
  progress,
  flightMV,
  speedMV,
  warpMV,
  activeIndex = 0,
  reticle,
}) {
  return (
    <>
      {/* neutral fill — tinted lights gave the whole scene a blue cast */}
      <ambientLight intensity={0.14} />
      <hemisphereLight args={["#3f3f46", "#000000", 0.12]} />

      <Starfield quality={quality} />
      <Sun />

      {PLANETS.map((planet) => (
        <Planet key={planet.id} planet={planet} />
      ))}

      {/* asteroid belt in its real place — between Mars and Jupiter — so the
          Career -> Projects leg flies through it */}
      {quality !== "low" && (
        <Asteroids
          position={[0, 6, -425]}
          innerRadius={24}
          outerRadius={140}
          ySpread={20}
          count={quality === "medium" ? 110 : 190}
        />
      )}

      {/* near-field dust — the thing that makes speed visible on every leg */}
      {quality !== "low" && <SpaceDust count={quality === "medium" ? 220 : 380} />}

      <Rocket />
      {quality !== "low" && <WarpStreaks />}
      <CameraRig progress={progress} flightMV={flightMV} speedMV={speedMV} warpMV={warpMV} />
      {reticle && <ReticleTracker activeIndex={activeIndex} reticle={reticle} />}
    </>
  );
}

// ReticleTracker — projects the active planet's center + apparent radius to
// screen pixels every frame and writes them to the shared reticle MotionValues,
// so the DOM lock-on bracket can track the planet without React re-renders.
const _c = new THREE.Vector3();
const _e = new THREE.Vector3();
const _right = new THREE.Vector3();

function ReticleTracker({ activeIndex, reticle }) {
  const { camera, size } = useThree();

  useFrame(() => {
    const planet = activeIndex >= 1 ? PLANETS[activeIndex - 1] : null;
    let alpha = 0;

    if (planet) {
      _c.set(...planet.position).project(camera);
      if (_c.z < 1) {
        const x = (_c.x * 0.5 + 0.5) * size.width;
        const y = (-_c.y * 0.5 + 0.5) * size.height;
        // apparent radius: project a point one planet-radius to the side
        _right.set(1, 0, 0).applyQuaternion(camera.quaternion);
        _e.set(...planet.position).addScaledVector(_right, planet.radius).project(camera);
        const ex = (_e.x * 0.5 + 0.5) * size.width;
        reticle.x.set(x);
        reticle.y.set(y);
        reticle.r.set(Math.abs(ex - x));
        alpha = 1;
      }
    }
    reticle.a.set(THREE.MathUtils.lerp(reticle.a.get(), alpha, 0.08));
  });

  return null;
}
