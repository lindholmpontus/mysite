// space.js — which planet each section lives on, in solar-system order from
// the old journey (Earth → Neptune), with its accent colour and titles.
import earth from "../assets/space/earth.jpg";
import earthClouds from "../assets/space/earth_clouds.jpg";
import mars from "../assets/space/mars.jpg";
import jupiter from "../assets/space/jupiter.jpg";
import saturn from "../assets/space/saturn.jpg";
import uranus from "../assets/space/uranus.jpg";
import neptune from "../assets/space/neptune.jpg";

export const SPACE = {
  about: { planet: "Earth", texture: earth, clouds: earthClouds, accent: "#5b9dff", title: "About Me", spin: 90 },
  career: { planet: "Mars", texture: mars, accent: "#ff8a5b", title: "Career & Education", subtitle: "Where I've been", spin: 80 },
  projects: { planet: "Jupiter", texture: jupiter, accent: "#e89a5b", title: "Projects", subtitle: "Things I've built", spin: 50 },
  skills: { planet: "Saturn", texture: saturn, accent: "#e8c87a", title: "Skills", subtitle: "My toolkit", ring: true, spin: 60 },
  hobbies: { planet: "Uranus", texture: uranus, accent: "#7adce8", title: "Hobbies", subtitle: "Outside the code", spin: 70 },
  contact: { planet: "Neptune", texture: neptune, accent: "#7a8cff", title: "Contact", subtitle: "Get in touch", spin: 70 },
};
