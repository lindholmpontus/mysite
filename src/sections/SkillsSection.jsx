// SkillsSection.jsx — logo grid of technologies.
import React from "react";
import { SKILLS } from "../data/content";

export default function SkillsSection({ accent }) {
  return (
    <div>
      <p className="font-mono text-[11px] text-white/40 mb-5 tracking-[2px] uppercase text-center">
        Languages · Frameworks · Tools
      </p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-6">
        {SKILLS.map((skill) => (
          <div key={skill.name} className="flex flex-col items-center group">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border bg-black/40 transition group-hover:-translate-y-1"
              style={{ borderColor: `${accent}33`, boxShadow: `0 0 0px ${accent}` }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 20px ${accent}55`)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 0 0px ${accent}`)}
            >
              <img src={skill.logo} alt={skill.name} className="w-9 h-9 object-contain" />
            </div>
            <p className="text-xs mt-2 text-gray-300 font-mono">{skill.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
