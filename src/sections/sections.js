// sections.js — registry mapping a planet's section id to its overlay content.
import AboutSection from "./AboutSection";
import CareerSection from "./CareerSection";
import ProjectsSection from "./ProjectsSection";
import SkillsSection from "./SkillsSection";
import HobbiesSection from "./HobbiesSection";
import ContactSection from "./ContactSection";
import { getPlanet } from "../scene/planets.config";

export const SECTIONS = {
  about: { title: "About Me", subtitle: "", Component: AboutSection },
  career: { title: "Career & Education", subtitle: "Where I've been", Component: CareerSection },
  projects: { title: "Projects", subtitle: "Things I've built", Component: ProjectsSection },
  skills: { title: "Skills", subtitle: "My toolkit", Component: SkillsSection },
  hobbies: { title: "Hobbies", subtitle: "Outside the code", Component: HobbiesSection },
  contact: { title: "Contact", subtitle: "Get in touch", Component: ContactSection },
};

// resolve a planet id -> {planet, section}
export function resolveSection(planetId) {
  const planet = getPlanet(planetId);
  if (!planet) return null;
  const section = SECTIONS[planet.section];
  if (!section) return null;
  return { planet, section };
}
