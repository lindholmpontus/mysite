// ProjectsSection.jsx — clean text cards. Cards with a link/repo go straight to
// it in a new tab (no modal); cards without one are just informational.
import React from "react";
import { projects, getTagColor } from "../data/projects";

export default function ProjectsSection({ accent }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {projects.map((project) => {
        const url = project.link || project.github;
        const cta = project.link ? "Visit ↗" : project.github ? "View code ↗" : null;
        const base = "group flex flex-col text-left rounded-xl border bg-black/40 p-4 transition";
        const inner = (
          <>
            <h4 className="font-mono text-sm text-white leading-tight">{project.title}</h4>
            <p className="text-gray-400 text-xs font-light mt-1.5 mb-3 line-clamp-3 flex-grow">{project.desc}</p>
            <div className="flex flex-wrap gap-1">
              {project.tags.map((tag) => (
                <span key={tag} className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${getTagColor(tag)}`}>
                  {tag}
                </span>
              ))}
            </div>
            {cta && (
              <span
                className="font-mono text-[10px] tracking-[0.2em] uppercase mt-3 opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ color: accent }}
              >
                {cta}
              </span>
            )}
          </>
        );

        return url ? (
          <a
            key={project.title}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${base} cursor-pointer hover:-translate-y-0.5`}
            style={{ borderColor: `${accent}33` }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${accent}99`)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${accent}33`)}
          >
            {inner}
          </a>
        ) : (
          <div key={project.title} className={base} style={{ borderColor: `${accent}33` }}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
