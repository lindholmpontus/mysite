// planets.config.js — the six content planets + the sun, laid out along the
// scroll journey's route in TRUE solar-system order (sun outward):
// Earth -> Mars -> Jupiter -> Saturn -> Uranus -> Neptune.
// (Mercury and Venus are skipped; Earth comes first for familiarity.)
//
// Layout for EPIC SCALE: planets are big (r 7-13) and spaced 190 apart down -Z,
// alternating sides (x = ±30). The camera parks close beside each planet (see
// journeyConfig planetStop) so it fills ~45% of the screen height, and the
// route S-weaves gently from one side to the other between stops. `side` = the
// screen side the planet sits on (so x sign matches: left = -x, right = +x).
// Geometry verified offline by scripts/verify-route.mjs — rerun it after
// changing radii/positions here.
import earthTex from "../assets/textures/earth.jpg";
import marsTex from "../assets/textures/mars.jpg";
import jupiterTex from "../assets/textures/jupiter.jpg";
import saturnTex from "../assets/textures/saturn.jpg";
import uranusTex from "../assets/textures/uranus.jpg";
import neptuneTex from "../assets/textures/neptune.jpg";
import sunTex from "../assets/textures/sun.jpg";

export const SUN_RADIUS = 9;

export const SUN = {
  id: "sun",
  name: "Sun",
  radius: SUN_RADIUS,
  texture: sunTex,
};

// Each planet: id, label, section id (content), texture, accent color, radius,
// journey position, screen side, spin speed, and optional ring (Saturn).
export const PLANETS = [
  {
    id: "about",
    name: "About Me",
    section: "about",
    texture: earthTex,
    accent: "#5b9dff",
    radius: 8.5,
    position: [-30, 6, -140],
    side: "left",
    spin: 0.12,
    tilt: [0, 0, 0.41],
  },
  {
    id: "career",
    name: "Career & Education",
    section: "career",
    texture: marsTex,
    accent: "#ff8a5b",
    radius: 7.2,
    position: [30, 6, -330],
    side: "right",
    spin: 0.14,
    tilt: [0, 0, 0.44],
  },
  {
    id: "projects",
    name: "Projects",
    section: "projects",
    texture: jupiterTex,
    accent: "#e89a5b",
    radius: 13,
    position: [-30, 6, -520],
    side: "left",
    spin: 0.08,
    tilt: [0, 0, 0.05],
  },
  {
    id: "skills",
    name: "Skills",
    section: "skills",
    texture: saturnTex,
    accent: "#e8c87a",
    radius: 10.5,
    position: [30, 6, -710],
    side: "right",
    spin: 0.1,
    tilt: [0.42, 0, 0.34],
    hasRing: true,
  },
  {
    id: "hobbies",
    name: "Hobbies",
    section: "hobbies",
    texture: uranusTex,
    accent: "#7adce8",
    radius: 8.5,
    position: [-30, 6, -900],
    side: "left",
    spin: 0.11,
    tilt: [0, 0, 1.71],
  },
  {
    id: "contact",
    name: "Contact",
    section: "contact",
    texture: neptuneTex,
    accent: "#7a8cff",
    radius: 8.2,
    position: [30, 6, -1090],
    side: "right",
    spin: 0.13,
    tilt: [0, 0, 0.49],
  },
];

export function getPlanet(id) {
  return PLANETS.find((p) => p.id === id) || null;
}
