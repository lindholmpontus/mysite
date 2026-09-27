// CareerSection.jsx — experience and education on one timeline (from the CV):
// each employer with its roles and highlights, then education.
import React from "react";
import { EXPERIENCE, EDUCATION } from "../data/content";

function Label({ children }) {
  return <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 mb-4">{children}</p>;
}

function Points({ points, accent }) {
  return (
    <ul className="mt-2.5 space-y-2">
      {points.map((p) => (
        <li key={p} className="flex gap-2.5 text-sm font-light leading-relaxed text-white/75">
          <span className="mt-[9px] w-1 h-1 rounded-full shrink-0" style={{ background: accent }} />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

// a node centred on the timeline (the container's left border, 24px out):
// a ring, filled for current roles
function Node({ accent, filled }) {
  return (
    <span
      aria-hidden="true"
      className="absolute -left-[29px] top-[7px] w-[9px] h-[9px] rounded-full border"
      style={{
        borderColor: accent,
        background: filled ? accent : "#02040a",
        boxShadow: filled ? `0 0 10px ${accent}` : "none",
      }}
    />
  );
}

export default function CareerSection({ accent }) {
  return (
    <div className="space-y-10">
      <section>
        <Label>Experience</Label>
        <div className="relative border-l pl-6 space-y-8" style={{ borderColor: `${accent}40` }}>
          {EXPERIENCE.map((job) => (
            <div key={job.org}>
              <p className="font-display uppercase tracking-[0.1em] text-sm text-white">
                {job.org} <span className="text-white/40">· {job.place}</span>
              </p>
              <div className="mt-4 space-y-6">
                {job.roles.map((role, i) => (
                  <div key={role.title} className="relative">
                    <Node accent={accent} filled={i === 0} />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                      <h4 className="text-[15px] font-medium" style={{ color: accent }}>
                        {role.title}
                      </h4>
                      <span className="font-mono text-[11px] text-white/45">{role.period}</span>
                    </div>
                    <Points points={role.points} accent={accent} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Label>Education</Label>
        <div className="relative border-l pl-6" style={{ borderColor: `${accent}40` }}>
          {EDUCATION.map((e) => (
            <div key={e.degree} className="relative">
              <Node accent={accent} filled />
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p className="font-display uppercase tracking-[0.1em] text-sm text-white">{e.school}</p>
                <span className="font-mono text-[11px] text-white/45">{e.period}</span>
              </div>
              <h4 className="text-[15px] font-medium mt-1" style={{ color: accent }}>
                {e.degree}
              </h4>
              <Points points={e.points} accent={accent} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
