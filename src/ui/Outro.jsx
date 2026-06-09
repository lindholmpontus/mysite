// Outro.jsx — journey's end, drifting in deep space: closing transmission,
// contact links, CV, and a way back to the launch pad.
import React from "react";
import { motion as Motion, useTransform } from "framer-motion";
import { DWELLS, STOPS } from "../journey/journeyConfig";
import { PROFILE } from "../data/content";
import linkedinLogo from "../assets/linkedin.svg";
import githubLogo from "../assets/github.png";

export default function Outro({ progress, onReturn }) {
  const { t0 } = DWELLS[STOPS.length - 1];
  const opacity = useTransform(progress, [t0 - 0.005, t0 + 0.02], [0, 1]);
  const y = useTransform(progress, [t0 - 0.005, t0 + 0.02], [40, 0]);
  const pointerEvents = useTransform(progress, (v) => (v > t0 ? "auto" : "none"));

  const backToLaunch = () => onReturn?.();

  return (
    <Motion.div
      style={{ opacity, y, pointerEvents }}
      className="fixed inset-0 z-20 flex flex-col items-center justify-center px-6 pb-36 text-center"
    >
      <p className="font-mono text-[10px] tracking-[0.5em] text-white/40 uppercase">
        All fragments recovered · records restored
      </p>
      <h2 className="font-display uppercase text-2xl sm:text-4xl tracking-[0.14em] mt-5 text-white [text-shadow:0_0_36px_rgba(125,170,255,0.4)]">
        Mission complete
      </h2>
      <p className="max-w-md font-light text-sm sm:text-base text-white/55 mt-5 leading-relaxed">
        You pieced my whole story back together. If it looks like a fit, let's
        talk — I'd love to build something with your team.
      </p>

      <div className="flex items-center gap-4 mt-9">
        <a
          href={`mailto:${PROFILE.email}`}
          className="font-mono text-xs tracking-[0.15em] uppercase px-5 py-2.5 rounded-lg border border-sky-400/60 text-sky-200 hover:bg-sky-400 hover:text-black transition-colors duration-200"
        >
          Contact me
        </a>
        <a
          href={PROFILE.cv}
          download
          className="font-mono text-xs tracking-[0.15em] uppercase px-5 py-2.5 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/50 transition-colors duration-200"
        >
          Download CV
        </a>
      </div>

      <div className="flex items-center gap-6 mt-8">
        <a
          href={PROFILE.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-70 hover:opacity-100 transition-opacity duration-200"
        >
          <img src={linkedinLogo} className="w-8 h-8" alt="LinkedIn" />
        </a>
        <a
          href={PROFILE.github}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-70 hover:opacity-100 transition-opacity duration-200"
        >
          <img src={githubLogo} className="w-8 h-8 rounded" alt="GitHub" />
        </a>
      </div>

      <button
        onClick={backToLaunch}
        className="mt-12 font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors duration-200 cursor-pointer"
      >
        ↑ Return to launch
      </button>
    </Motion.div>
  );
}
