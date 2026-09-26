// RocketModel.jsx — the ship: a faceted twin-engine interceptor. Nose points
// -Z, engines point +Z. All procedural geometry (no model download). The metal
// reads through a tiny generated environment map — a warm key from behind (the
// sun is behind you, you fly away from it), a cool rim and a crisp top strip —
// so the facets catch highlights instead of rendering flat grey.
//
// exhaustRef: the plume group; Rocket stretches its scale.y (base-anchored at
// the nozzles, so it only ever grows backward). lightRef: the engine light.
/* eslint-disable react-hooks/immutability -- per-frame uniform / material updates */
import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { journeyState } from "./journeyConfig";

const ACCENT = "#5b9dff";
// engine light: a deeper blue than the UI accent, so the glow stays saturated
// after ACES tone mapping instead of washing out to pale grey
const BURN = "#2f6bff";
const PLUME_LEN = 2.4;
const ENGINE_X = 0.55;
const NOZZLE_Z = 1.66;

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

function fuselageGeometry() {
  // side profile (radius, length) turned on a lathe: 8 facets -> a ridged
  // spine and keel; flattened so the hull is wider than tall
  const profile = [
    [0.0, -1.5], [0.16, -1.5], [0.36, -1.2], [0.5, -0.45], [0.47, 0.35],
    [0.36, 1.15], [0.2, 1.9], [0.06, 2.45], [0.0, 2.55],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(profile, 8);
  g.rotateX(-Math.PI / 2); // lathe axis +Y -> nose toward -Z
  g.scale(1, 0.62, 1);
  return g;
}

// a flat plate from a 2D outline, extruded (centred on its thickness) with a
// small chamfer so the edges catch light
function plateGeometry(points, thickness, bevel) {
  const s = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(s, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
  });
  g.translate(0, 0, -thickness / 2);
  return g;
}

// swept delta with a clipped tip and a trailing-edge notch (starboard), drawn
// as (span x, rearward z); laid flat in XZ
const WING = [[0.3, -0.7], [1.95, 0.55], [2.05, 0.95], [1.6, 1.05], [0.3, 1.2]];
function wingGeometry() {
  return plateGeometry(WING, 0.06, 0.025).rotateX(Math.PI / 2); // outline y -> +Z
}

// swept tail fin, drawn as (rearward z, height y); stood up in the YZ plane
const FIN = [[0.35, 0], [1.35, 0], [1.52, 0.72], [1.2, 0.72]];
function finGeometry() {
  return plateGeometry(FIN, 0.04, 0.015).rotateY(-Math.PI / 2); // outline x -> +Z
}

function plumeGeometry(radius) {
  // open cone, base at the nozzle (y = 0), tip at y = PLUME_LEN
  const g = new THREE.ConeGeometry(radius, PLUME_LEN, 20, 8, true);
  g.translate(0, PLUME_LEN / 2, 0);
  return g;
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.25, "rgba(255,255,255,0.45)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ------------------------------------------------------------------ */
/* Environment (reflections for the hull only)                         */
/* ------------------------------------------------------------------ */

function buildEnvMap(gl) {
  const scene = new THREE.Scene();
  const sky = new THREE.SphereGeometry(50, 32, 16);
  const top = new THREE.Color("#0c1a33");
  const col = [];
  const p = sky.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = THREE.MathUtils.clamp(p.getY(i) / 50, 0, 1);
    col.push(top.r * k, top.g * k, top.b * k);
  }
  sky.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  scene.add(new THREE.Mesh(sky, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

  const panel = (color, intensity, pos, size) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(size[0], size[1]),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })
    );
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  panel("#fff0d8", 5, [0, 10, 32], [30, 14]); // the sun, behind the ship
  panel(ACCENT, 1.4, [-30, -8, -12], [22, 22]); // cool bounce, low left
  panel("#ffffff", 3.5, [0, 34, -4], [5, 36]); // crisp strip along the spine

  const pmrem = new THREE.PMREMGenerator(gl);
  const env = pmrem.fromScene(scene, 0.02).texture;
  pmrem.dispose();
  scene.traverse((o) => {
    o.geometry?.dispose();
    o.material?.dispose();
  });
  return env;
}

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

// plume: bright at the nozzle, fading to the tip, with faint travelling
// shock diamonds; edges seen side-on are softened so the cone never reads
// as a solid tube. Additive, HDR (feeds the bloom).
const plumeVertex = /* glsl */ `
  varying float vT;
  varying float vFacing;
  void main() {
    vT = position.y / ${PLUME_LEN.toFixed(2)};
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vFacing = abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }
`;
const plumeFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  varying float vT;
  varying float vFacing;
  void main() {
    // clamped: float error puts the tip a hair past 1, and pow() of a negative
    // is NaN — which the bloom blur smears across the whole frame
    float along = pow(clamp(1.0 - vT, 0.0, 1.0), 1.8);
    float diamonds = 0.82 + 0.18 * sin(vT * 26.0 - uTime * 24.0);
    float a = along * diamonds * mix(0.25, 1.0, vFacing) * uIntensity;
    gl_FragColor = vec4(uColor * a, 1.0);
  }
`;

// nozzle, looking into it: a small white-hot core, a blue burner ring, and
// the dark throat wall toward the rim
const nozzleFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float core = 1.0 - smoothstep(0.0, 0.2, r);
    float ring = exp(-pow((r - 0.5) / 0.15, 2.0));
    vec3 col = vec3(0.85, 0.92, 1.0) * core * 1.3 + uColor * (ring + 0.06);
    gl_FragColor = vec4(col * uIntensity, 1.0);
  }
`;
const uvVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

export default function RocketModel({ exhaustRef, lightRef }) {
  const gl = useThree((s) => s.gl);
  const strobeRef = useRef();
  const retroRefs = useRef([]);

  const kit = useMemo(() => {
    const env = buildEnvMap(gl);
    const glow = glowTexture();
    const accent = new THREE.Color(ACCENT);
    const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false };
    return {
      env,
      glow,
      geo: {
        fuselage: fuselageGeometry(),
        wing: wingGeometry(),
        fin: finGeometry(),
        plume: plumeGeometry(0.14), // narrower than the nozzle: the dark rim shows
        core: plumeGeometry(0.055),
        retro: plumeGeometry(0.06),
      },
      mat: {
        hull: new THREE.MeshStandardMaterial({ color: "#d3dae5", metalness: 0.6, roughness: 0.3, flatShading: true, envMap: env }),
        dark: new THREE.MeshStandardMaterial({ color: "#363e4c", metalness: 0.75, roughness: 0.35, flatShading: true, envMap: env }),
        nozzle: new THREE.MeshStandardMaterial({ color: "#1d222b", metalness: 0.85, roughness: 0.45, side: THREE.DoubleSide, envMap: env }),
        glass: new THREE.MeshPhysicalMaterial({
          color: "#07101f", metalness: 0.2, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.04,
          envMap: env, envMapIntensity: 1.8, emissive: "#0f3470", emissiveIntensity: 0.45,
        }),
        trim: new THREE.MeshBasicMaterial({ color: accent.clone().multiplyScalar(2.4), toneMapped: false }),
        plume: new THREE.ShaderMaterial({
          uniforms: { uColor: { value: new THREE.Color(BURN) }, uIntensity: { value: 1 }, uTime: { value: 0 } },
          vertexShader: plumeVertex, fragmentShader: plumeFragment, side: THREE.DoubleSide, ...additive,
        }),
        core: new THREE.ShaderMaterial({
          uniforms: { uColor: { value: new THREE.Color("#dfeaff") }, uIntensity: { value: 1 }, uTime: { value: 0 } },
          vertexShader: plumeVertex, fragmentShader: plumeFragment, side: THREE.DoubleSide, ...additive,
        }),
        nozzleGlow: new THREE.ShaderMaterial({
          uniforms: { uColor: { value: new THREE.Color(BURN) }, uIntensity: { value: 2.5 } },
          vertexShader: uvVertex, fragmentShader: nozzleFragment, toneMapped: false,
        }),
        halo: new THREE.SpriteMaterial({ map: glow, color: new THREE.Color(BURN).multiplyScalar(1.3), ...additive }),
        retro: new THREE.ShaderMaterial({
          uniforms: { uColor: { value: new THREE.Color("#bcd4ff") }, uIntensity: { value: 0 }, uTime: { value: 0 } },
          vertexShader: plumeVertex, fragmentShader: plumeFragment, side: THREE.DoubleSide, ...additive,
        }),
        retroHalo: new THREE.SpriteMaterial({ map: glow, color: new THREE.Color("#9fc0ff").multiplyScalar(1.4), ...additive }),
        port: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff3b3b").multiplyScalar(3), toneMapped: false }),
        starboard: new THREE.MeshBasicMaterial({ color: new THREE.Color("#3bff7a").multiplyScalar(3), toneMapped: false }),
        strobe: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffffff").multiplyScalar(6), toneMapped: false }),
      },
    };
  }, [gl]);

  useEffect(
    () => () => {
      kit.env.dispose();
      kit.glow.dispose();
      Object.values(kit.geo).forEach((g) => g.dispose());
      Object.values(kit.mat).forEach((m) => m.dispose());
    },
    [kit]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { warp, thrust, brake } = journeyState;
    const flicker = 1 + Math.sin(t * 31) * 0.05 + Math.sin(t * 53) * 0.04;
    const { plume, core, nozzleGlow, halo, retro, retroHalo } = kit.mat;
    // main engines: flare on the punch-out, throttle back while braking
    const burn = Math.max(0, warp + thrust * 0.7 - brake * 0.35);
    plume.uniforms.uIntensity.value = (0.4 + burn * 1.2) * flicker;
    core.uniforms.uIntensity.value = (0.25 + burn * 1.3) * flicker;
    plume.uniforms.uTime.value = core.uniforms.uTime.value = retro.uniforms.uTime.value = t;
    nozzleGlow.uniforms.uIntensity.value = (1.3 + burn * 1.7) * flicker;
    halo.opacity = 0.5 + Math.min(burn, 1.3) * 0.4;
    // retro thrusters: fire forward while the ship brakes into a stop
    const retroOn = brake > 0.02;
    for (const g of retroRefs.current) {
      if (!g) continue;
      g.visible = retroOn;
      g.scale.set(1, 0.2 + brake * 0.5, 1);
    }
    retro.uniforms.uIntensity.value = brake * 2.6 * flicker;
    retroHalo.opacity = Math.min(1, brake * 1.1);
    // anti-collision strobe: a double flash every 1.4 s
    if (strobeRef.current) {
      const c = t % 1.4;
      strobeRef.current.visible = c < 0.05 || (c > 0.16 && c < 0.21);
    }
  });

  const { geo, mat } = kit;

  return (
    // pitched a few degrees nose-down: the chase camera sits only ~12° above
    // the ship, and this tips the wings' top skin toward it
    <group scale={0.78} rotation={[-0.09, 0, 0]}>
      {/* hull */}
      <mesh geometry={geo.fuselage} material={mat.hull} />
      {/* canopy */}
      <mesh position={[0, 0.2, -0.78]} scale={[0.25, 0.19, 0.72]} material={mat.glass}>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      {/* dark tail cone cap */}
      <mesh position={[0, 0, 1.505]} scale={[1, 0.62, 1]} material={mat.nozzle}>
        <circleGeometry args={[0.16, 8]} />
      </mesh>
      {/* dorsal accent line along the spine, behind the canopy */}
      <mesh position={[0, 0.3, 0.35]} material={mat.trim}>
        <boxGeometry args={[0.025, 0.02, 1.1]} />
      </mesh>

      <Wing geo={geo} mat={mat} light={mat.starboard} />
      <group scale={[-1, 1, 1]}>
        <Wing geo={geo} mat={mat} light={mat.port} />
      </group>

      {/* canted twin tail fins */}
      {[1, -1].map((side) => (
        <group key={side} position={[0.26 * side, 0.14, 0]} rotation={[0, 0, -0.42 * side]}>
          <mesh geometry={geo.fin} material={mat.hull} />
          <mesh position={[0, 0.72, 1.36]} material={mat.trim}>
            <boxGeometry args={[0.05, 0.03, 0.3]} />
          </mesh>
        </group>
      ))}
      {/* anti-collision strobe on the tail */}
      <mesh ref={strobeRef} position={[0, 0.2, 1.52]} material={mat.strobe}>
        <sphereGeometry args={[0.045, 8, 8]} />
      </mesh>

      {/* twin engines: nacelle, nozzle, white-hot core */}
      {[1, -1].map((side) => (
        <group key={side} position={[ENGINE_X * side, -0.04, 0]}>
          <mesh position={[0, 0, 0.8]} rotation={[Math.PI / 2, 0, 0]} material={mat.dark}>
            <cylinderGeometry args={[0.24, 0.19, 1.6, 12]} />
          </mesh>
          <mesh position={[0, 0, NOZZLE_Z - 0.04]} rotation={[Math.PI / 2, 0, 0]} material={mat.nozzle}>
            <cylinderGeometry args={[0.25, 0.23, 0.2, 20, 1, true]} />
          </mesh>
          {/* just aft of the nacelle's end cap, recessed inside the nozzle ring */}
          <mesh position={[0, 0, NOZZLE_Z - 0.02]} material={mat.nozzleGlow}>
            <circleGeometry args={[0.2, 24]} />
          </mesh>
          <sprite position={[0, 0, NOZZLE_Z + 0.25]} scale={0.75} material={mat.halo} />
        </group>
      ))}

      {/* plumes — Rocket stretches this group's scale.y (local +Y = +Z) */}
      <group ref={exhaustRef} position={[0, -0.04, NOZZLE_Z]} rotation={[Math.PI / 2, 0, 0]}>
        {[1, -1].map((side) => (
          <group key={side} position={[ENGINE_X * side, 0, 0]}>
            <mesh geometry={geo.plume} material={mat.plume} />
            <mesh geometry={geo.core} material={mat.core} />
          </group>
        ))}
      </group>

      {/* retro thrusters on the nose flanks — plumes point FORWARD (-Z) */}
      {[1, -1].map((side, i) => (
        <group key={side} position={[0.37 * side, -0.02, -1.2]}>
          <group ref={(g) => (retroRefs.current[i] = g)} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
            <mesh geometry={geo.retro} material={mat.retro} />
          </group>
          <sprite scale={0.55} material={mat.retroHalo} />
        </group>
      ))}

      {/* engine glow light */}
      <pointLight ref={lightRef} position={[0, 0.1, 2.9]} color={BURN} intensity={1.2} distance={10} decay={2} />
    </group>
  );
}

// one wing (starboard; the port wing is this mirrored): the plate, a glowing
// leading-edge strip, a wingtip pod with its navigation light
function Wing({ geo, mat, light }) {
  // leading edge, root -> tip, nudged inboard onto the top skin
  const a = new THREE.Vector2(0.42, -0.5);
  const b = new THREE.Vector2(1.86, 0.58);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const len = a.distanceTo(b);
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  return (
    <group position={[0, -0.1, 0]} rotation={[0, 0, 0.07]}>
      <mesh geometry={geo.wing} material={mat.hull} />
      <mesh position={[mid.x, 0.062, mid.y]} rotation={[0, -ang, 0]} material={mat.trim}>
        <boxGeometry args={[len, 0.012, 0.035]} />
      </mesh>
      {/* wingtip pod + forward probe */}
      <mesh position={[2.04, 0.02, 0.62]} rotation={[Math.PI / 2, 0, 0]} material={mat.dark}>
        <cylinderGeometry args={[0.06, 0.075, 0.95, 8]} />
      </mesh>
      <mesh position={[2.04, 0.02, -0.02]} rotation={[-Math.PI / 2, 0, 0]} material={mat.dark}>
        <coneGeometry args={[0.035, 0.38, 8]} />
      </mesh>
      {/* navigation light (red port / green starboard), steady */}
      <mesh position={[2.04, 0.02, 1.12]} material={light}>
        <sphereGeometry args={[0.055, 8, 8]} />
      </mesh>
    </group>
  );
}
