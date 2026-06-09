// ProjectsSection.jsx — clean text cards (no screenshots); clicking a card opens
// the ProjectModal with the full write-up (and the demo video where there is one).
import React, { useState } from "react";
import { projects, getTagColor } from "../data/projects";
import ProjectModal from "../components/ProjectModal";

export default function ProjectsSection({ accent }) {
  const [active, setActive] = useState(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {projects.map((project) => {
          const cta = project.video ? "Watch demo" : project.link ? "Visit ↗" : project.github ? "View code ↗" : "Details";
          return (
            <button
              key={project.title}
              onClick={() => setActive(project)}
              className="group flex flex-col text-left rounded-xl border bg-black/40 p-4 transition hover:-translate-y-0.5"
              style={{ borderColor: `${accent}33` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${accent}99`)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${accent}33`)}
            >
              <h4 className="font-mono text-sm text-white leading-tight">{project.title}</h4>
              <p className="text-gray-400 text-xs font-light mt-1.5 mb-3 line-clamp-3 flex-grow">{project.desc}</p>
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${getTagColor(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span
                className="font-mono text-[10px] tracking-[0.2em] uppercase mt-3 opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ color: accent }}
              >
                {cta}
              </span>
            </button>
          );
        })}
      </div>

      {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
    </>
  );
}
