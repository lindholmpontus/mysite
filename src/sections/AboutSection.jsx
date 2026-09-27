// AboutSection.jsx — portrait + role, the profile (from the CV), and a row
// of quick facts. No CV/contact here — that lives at the end of the page.
import React from "react";
import { PROFILE } from "../data/content";
import selfieImg from "../assets/selfie.png";

export default function AboutSection({ accent }) {
  const facts = [
    ["Based in", PROFILE.location],
    ["Languages", PROFILE.languages],
  ];
  return (
    <div>
      <div className="flex items-center gap-5">
        <img
          src={selfieImg}
          alt=""
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shrink-0"
          style={{ boxShadow: `0 0 0 2px ${accent}99, 0 0 36px ${accent}55` }}
        />
        <div>
          <p className="font-display uppercase tracking-[0.1em] text-base sm:text-lg text-white">{PROFILE.name}</p>
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase mt-1.5" style={{ color: accent }}>
            {PROFILE.title} · {PROFILE.company}
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-4 text-[15px] leading-relaxed font-light text-white/80">
        {PROFILE.about.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 pt-5 border-t border-white/10">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">{label}</dt>
            <dd className="mt-1.5 text-sm text-white/85">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
