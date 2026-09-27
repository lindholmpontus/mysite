// planets.config.js — the six content planets + the sun, in TRUE solar-system
// order (sun outward): Earth -> Mars -> Jupiter -> Saturn -> Uranus -> Neptune
// (Mercury and Venus are skipped; Earth comes first for familiarity). One
// planet per page section — the scroll layout (src/scroll/scrollConfig.js)
// pins each to its section; `position` is only a default world placement.
//
// Textures: true 2:1 equirectangular maps from Solar System Scope (CC BY 4.0,
// https://www.solarsystemscope.com/textures/ — based on NASA mission imagery).
// The high tier gets 4k maps where they exist; medium/low get 2k (a mipmapped
// 4k map is ~45 MB of GPU memory, too much to hand a phone several of).
const TEX_4K = import.meta.glob("../assets/textures/4k/*", { eager: true, import: "default" });
const TEX_2K = import.meta.glob("../assets/textures/2k/*", { eager: true, import: "default" });

export function textureUrl(file, quality = "high") {
  const lo = TEX_2K[`../assets/textures/2k/${file}`];
  return quality === "high" ? TEX_4K[`../assets/textures/4k/${file}`] ?? lo : lo;
}

// the one light source: the scene's point light AND the planet shaders use it
export const SUN_LIGHT = { color: "#fff0d8", intensity: 3.2 };

export const SUN_RADIUS = 9;

export const SUN = {
  id: "sun",
  name: "Sun",
  radius: SUN_RADIUS,
  texture: "sun.jpg",
};

// Each planet: id, label, section id (content), accent color, radius, default
// position, spin speed, axial tilt, plus its look:
//   maps       — texture files (map; Earth adds clouds + ocean mask)
//   limb       — Minnaert exponent: < 1 = the flatter disc real photos show
//   atmosphere — vertical optical depth per RGB channel for Rayleigh and haze
//                scattering, and the density scale height (fraction of radius)
//   ring       — ring system (Saturn), radii in planet radii
export const PLANETS = [
  {
    id: "about",
    name: "About Me",
    section: "about",
    maps: { map: "earth.jpg", clouds: "earth_clouds.jpg", ocean: "earth_ocean.jpg" },
    limb: 0.92,
    atmosphere: { rayleigh: [0.05, 0.11, 0.26], haze: [0.02, 0.02, 0.02], scaleHeight: 0.0045 },
    accent: "#5b9dff",
    radius: 8.5,
    position: [-30, 6, -140],
    spin: 0.12,
    tilt: [0, 0, 0.41],
  },
  {
    id: "career",
    name: "Career & Education",
    section: "career",
    maps: { map: "mars.jpg" },
    limb: 0.72,
    atmosphere: { rayleigh: [0.004, 0.006, 0.012], haze: [0.07, 0.055, 0.04], scaleHeight: 0.006, g: 0.6 },
    accent: "#ff8a5b",
    radius: 7.2,
    position: [30, 6, -330],
    spin: 0.14,
    tilt: [0, 0, 0.44],
  },
  {
    id: "projects",
    name: "Projects",
    section: "projects",
    maps: { map: "jupiter.jpg" },
    limb: 0.85,
    atmosphere: { rayleigh: [0.006, 0.009, 0.014], haze: [0.03, 0.028, 0.024], scaleHeight: 0.004 },
    accent: "#e89a5b",
    radius: 13,
    position: [-30, 6, -520],
    spin: 0.08,
    tilt: [0, 0, 0.05],
  },
  {
    id: "skills",
    name: "Skills",
    section: "skills",
    maps: { map: "saturn.jpg" },
    limb: 0.85,
    atmosphere: { rayleigh: [0.006, 0.009, 0.014], haze: [0.035, 0.031, 0.024], scaleHeight: 0.004 },
    accent: "#e8c87a",
    radius: 10.5,
    position: [30, 6, -710],
    spin: 0.1,
    // the rings lie in the equatorial plane; this tilt frames them as an open
    // ellipse from the parked camera (lit face toward you)
    tilt: [0.555, 0.047, 0.337],
    ring: { texture: "saturn_ring.png", inner: 1.18, outer: 2.34 },
  },
  {
    id: "hobbies",
    name: "Hobbies",
    section: "hobbies",
    maps: { map: "uranus.jpg" },
    limb: 0.95,
    atmosphere: { rayleigh: [0.02, 0.07, 0.09], haze: [0.02, 0.03, 0.03], scaleHeight: 0.006 },
    accent: "#7adce8",
    radius: 8.5,
    position: [-30, 6, -900],
    spin: 0.11,
    tilt: [0, 0, 1.71],
  },
  {
    id: "contact",
    name: "Contact",
    section: "contact",
    maps: { map: "neptune.jpg" },
    limb: 0.9,
    atmosphere: { rayleigh: [0.015, 0.045, 0.11], haze: [0.015, 0.02, 0.03], scaleHeight: 0.006 },
    accent: "#7a8cff",
    radius: 8.2,
    position: [30, 6, -1090],
    spin: 0.13,
    tilt: [0, 0, 0.49],
  },
];

export function getPlanet(id) {
  return PLANETS.find((p) => p.id === id) || null;
}
