// AboutSection.jsx — photo, name, and a short intro. No CV/contact here — that
// lives at the end of the journey (Contact / outro).
import React from "react";
import { PROFILE } from "../data/content";
import selfieImg from "../assets/selfie.png";

export default function AboutSection({ accent }) {
  return (
    <div className="flex flex-col items-center text-center">
      <img
        src={selfieImg}
        alt={PROFILE.name}
        className="w-32 h-32 rounded-full object-cover border-2"
        style={{ borderColor: `${accent}80`, boxShadow: `0 0 40px ${accent}55` }}
      />
      <h3 className="font-mono text-2xl mt-5">{PROFILE.name}</h3>
      <p className="font-mono text-xs tracking-[3px] uppercase mt-2" style={{ color: accent }}>
        {PROFILE.title} · {PROFILE.location}
      </p>

      <p className="text-gray-300 leading-relaxed font-light max-w-md mt-6">{PROFILE.intro}</p>
    </div>
  );
}
