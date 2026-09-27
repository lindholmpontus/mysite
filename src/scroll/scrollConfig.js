// scrollConfig.js — the scroll layout: one section per planet, in solar-system
// order, alternating sides. Each planet renders in the fixed WebGL canvas but
// is ANCHORED to a slot element in the page (see useAnchor), so it scrolls
// exactly with the content.
import { PLANETS } from "../scene/planets.config";

// light far off to the side and a little in front: every planet shows a
// clear terminator, lit on the side facing its text and dark toward the edge
const LIGHT_FROM_RIGHT = [8e5, 3e5, 5e5];
const LIGHT_FROM_LEFT = [-8e5, 3e5, 5e5];

// fill: planet diameter as a fraction of its slot (Saturn smaller — its
// rings reach 2.34x the globe)
const FILL = { about: 0.74, career: 0.64, projects: 0.82, skills: 0.4, hobbies: 0.7, contact: 0.7 };

export const SCROLL_PLANETS = PLANETS.map((planet, i) => {
  const side = i % 2 === 0 ? "left" : "right"; // screen side of the planet
  return {
    planet,
    index: i + 1, // fragment number 1..6
    side,
    sunPos: side === "left" ? LIGHT_FROM_RIGHT : LIGHT_FROM_LEFT,
    fill: FILL[planet.id] ?? 0.72,
  };
});

export const SECTION_IDS = ["launch", ...PLANETS.map((p) => p.section), "complete"];
