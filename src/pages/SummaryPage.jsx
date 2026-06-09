// SummaryPage.jsx — accessible 2D fallback. Same section content as the 3D
// experience, rendered as a plain scrollable page (no WebGL required).
import React from "react";
import { SECTIONS } from "../sections/sections";
import { getPlanet } from "../scene/planets.config";
import { PLANETS } from "../scene/planets.config";
import { PROFILE } from "../data/content";

const ORDER = ["about", "career", "projects", "skills", "hobbies", "contact"];

export default function SummaryPage({ onEnterFlight, canFly = true }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="font-mono text-4xl tracking-tight">{PROFILE.name}</h1>
        <p className="font-mono text-xs text-indigo-300 mt-3 tracking-[3px] uppercase">
          {PROFILE.title} · {PROFILE.location}
        </p>
        {canFly && (
          <button
            onClick={onEnterFlight}
            className="font-mono text-sm mt-7 px-6 py-2.5 rounded-xl border border-indigo-400/60 text-indigo-200 hover:bg-indigo-500 hover:text-black transition cursor-pointer"
          >
            Launch the space journey →
          </button>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-24 space-y-12">
        {ORDER.map((id) => {
          const section = SECTIONS[id];
          if (!section) return null;
          const planet = PLANETS.find((p) => p.section === id) || getPlanet(id);
          const accent = planet?.accent || "#646cff";
          const Comp = section.Component;
          return (
            <section key={id} className="scroll-mt-8">
              <h2
                className="font-mono text-2xl mb-1 tracking-wide"
                style={{ textShadow: `0 0 14px ${accent}` }}
              >
                {section.title}
              </h2>
              <p className="font-mono text-[11px] text-white/40 mb-6 tracking-[2px] uppercase">
                {section.subtitle}
              </p>
              <div
                className="rounded-2xl border p-6"
                style={{ borderColor: `${accent}30`, background: "rgba(10,12,22,0.6)" }}
              >
                <Comp accent={accent} />
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
