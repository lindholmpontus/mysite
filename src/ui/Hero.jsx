// Hero.jsx — the in-space launch beat, shown AFTER the boot screen reveals the
// 3D scene. Intentionally minimal now: just a big, clear "scroll to launch" cue
// over the sun (the name/briefing already happened on the terminal). Fades out
// as the journey starts.
import React from "react";
import { motion as Motion, useTransform } from "framer-motion";
import { DWELLS } from "../journey/journeyConfig";

export default function Hero({ progress }) {
  const heroEnd = DWELLS[0].t1;
  const opacity = useTransform(progress, [heroEnd * 0.3, heroEnd], [1, 0]);
  const y = useTransform(progress, [0, heroEnd], [0, -40]);

  return (
    <Motion.div
      style={{ opacity, y }}
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-4 px-6 pb-12 sm:pb-16 text-center pointer-events-none"
    >
      <Motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="font-display uppercase text-2xl sm:text-4xl leading-tight tracking-[0.1em] text-white [text-shadow:0_0_34px_rgba(110,150,255,0.5)]"
      >
        Scroll to launch
      </Motion.p>
      <Motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="font-mono text-xs sm:text-base tracking-[0.32em] uppercase text-sky-200/80"
      >
        Begin the recovery
      </Motion.p>
      <Motion.svg
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="mt-1"
      >
        <path d="M4 8l8 8 8-8" stroke="rgba(147,197,253,0.95)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </Motion.svg>
    </Motion.div>
  );
}
