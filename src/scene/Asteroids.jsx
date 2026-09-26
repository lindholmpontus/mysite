// Asteroids.jsx — the belt between Mars and Jupiter: a few distinct procedural
// rocks (lumpy, cratered, elongated), instanced into slowly tumbling fields.
// Deterministic layout; one draw call per rock shape.
import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const SHAPES = 4;

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomUnit(rand) {
  const z = rand() * 2 - 1;
  const a = rand() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  return new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), z);
}

// a rock: a sphere pushed around by a few broad "lumps" (random waves over the
// surface), then pocked with craters — a bowl and a raised rim. Rock albedo
// varies with height, and crater floors are darker.
function rockGeometry(rand, detail) {
  const g = mergeVertices(new THREE.IcosahedronGeometry(1, detail));
  const lumps = Array.from({ length: 6 }, () => ({
    dir: randomUnit(rand),
    freq: 0.9 + rand() * 1.6,
    amp: 0.05 + rand() * 0.1,
    phase: rand() * Math.PI * 2,
  }));
  const craters = Array.from({ length: 3 + Math.floor(rand() * 4) }, () => ({
    c: randomUnit(rand),
    r: 0.22 + rand() * 0.38,
    depth: 0.05 + rand() * 0.07,
  }));
  const p = g.attributes.position;
  const color = new Float32Array(p.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    let h = 1;
    for (const l of lumps) h += l.amp * Math.sin(v.dot(l.dir) * l.freq * Math.PI + l.phase);
    let floor = 0;
    for (const k of craters) {
      const a = v.angleTo(k.c) / k.r;
      if (a < 1) {
        h -= k.depth * (1 - a * a);
        floor = Math.max(floor, 1 - a);
      } else if (a < 1.35) {
        h += k.depth * 0.3 * Math.sin(((a - 1) / 0.35) * Math.PI);
      }
    }
    p.setXYZ(i, v.x * h, v.y * h, v.z * h);
    const shade = THREE.MathUtils.clamp(0.72 + (h - 1) * 1.6 - floor * 0.28, 0.35, 1.1);
    color[i * 3] = color[i * 3 + 1] = color[i * 3 + 2] = shade;
  }
  g.setAttribute("color", new THREE.BufferAttribute(color, 3));
  g.computeVertexNormals();
  return g;
}

export default function Asteroids({
  count = 120,
  innerRadius = 95,
  outerRadius = 135,
  ySpread = 8,
  position = [0, 0, 0],
  detail = 3,
}) {
  const groupRef = useRef();
  const meshRefs = useRef([]);

  const { geometries, material, fields } = useMemo(() => {
    const rand = mulberry32(42);
    const geometries = Array.from({ length: SHAPES }, () => rockGeometry(rand, detail));
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 });
    // instances, dealt round-robin to the rock shapes
    const fields = Array.from({ length: SHAPES }, () => []);
    const tint = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = innerRadius + rand() * (outerRadius - innerRadius);
      const size = 0.25 + Math.pow(rand(), 2) * 1.0; // many small, a few big
      // dark: real asteroids reflect ~5-25% of light — carbonaceous
      // grey-black to dusty grey-brown stony rock
      tint.setHSL(0.07 + rand() * 0.04, 0.05 + rand() * 0.1, 0.11 + rand() * 0.11);
      fields[i % SHAPES].push({
        position: new THREE.Vector3(Math.cos(angle) * radius, (rand() - 0.5) * ySpread, Math.sin(angle) * radius),
        rotation: new THREE.Euler(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI),
        scale: new THREE.Vector3(size * (0.8 + rand() * 0.6), size * (0.65 + rand() * 0.4), size * (0.8 + rand() * 0.5)),
        spin: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.25),
        color: tint.clone(),
      });
    }
    return { geometries, material, fields };
  }, [count, innerRadius, outerRadius, ySpread, detail]);

  useEffect(
    () => () => {
      geometries.forEach((g) => g.dispose());
      material.dispose();
    },
    [geometries, material]
  );

  // colours once; matrices every frame (each rock tumbles on its own axis)
  useEffect(() => {
    fields.forEach((field, s) => {
      const mesh = meshRefs.current[s];
      if (!mesh) return;
      field.forEach((rock, i) => mesh.setColorAt(i, rock.color));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  }, [fields]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.008;
    const t = state.clock.elapsedTime;
    fields.forEach((field, s) => {
      const mesh = meshRefs.current[s];
      if (!mesh) return;
      field.forEach((rock, i) => {
        dummy.position.copy(rock.position);
        dummy.rotation.set(
          rock.rotation.x + rock.spin.x * t,
          rock.rotation.y + rock.spin.y * t,
          rock.rotation.z + rock.spin.z * t
        );
        dummy.scale.copy(rock.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {fields.map((field, s) => (
        <instancedMesh
          key={s}
          ref={(m) => (meshRefs.current[s] = m)}
          args={[geometries[s], material, field.length]}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}
