// planets.config.js — the six content planets + the sun, laid out along the
// scroll journey's route in TRUE solar-system order (sun outward):
// Earth -> Mars -> Jupiter -> Saturn -> Uranus -> Neptune.
// (Mercury and Venus are skipped; Earth comes first for familiarity.)
//
// Layout for MAX SMOOTHNESS: the camera flies a dead-straight lane down -Z at
// x=0 (raised above the ecliptic to clear the sun). Each planet sits a fixed
// distance off to ALTERNATING sides (x = ±30) so the straight lane passes it
// comfortably and the planet frames to one side (panel on the other) — the
// camera never has to weave or turn to visit them. `side` = the screen side the
// planet sits on (so x sign matches: left = -x, right = +x).
import earthTex from "../assets/textures/earth.jpg";
import marsTex from "../assets/textures/mars.jpg";
import jupiterTex from "../assets/textures/jupiter.jpg";
import saturnTex from "../assets/textures/saturn.jpg";
import uranusTex from "../assets/textures/uranus.jpg";
import neptuneTex from "../assets/textures/neptune.jpg";
import sunTex from "../assets/textures/sun.jpg";

export const SUN_RADIUS = 7;

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
    radius: 4.2,
    position: [-30, 6, -125],
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
    radius: 3.6,
    position: [30, 6, -257],
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
    radius: 6.2,
    position: [-30, 6, -389],
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
    radius: 5.0,
    position: [30, 6, -521],
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
    radius: 4.2,
    position: [-30, 6, -653],
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
    radius: 4.0,
    position: [30, 6, -785],
    side: "right",
    spin: 0.13,
    tilt: [0, 0, 0.49],
  },
];

export function getPlanet(id) {
  return PLANETS.find((p) => p.id === id) || null;
}
