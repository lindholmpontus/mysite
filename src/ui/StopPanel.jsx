// StopPanel.jsx — the holographic dossier projected after a planet scan.
// Presentational: the parent mounts it (inside <AnimatePresence>) only once the
// scan completes, so it "materializes" with a boot flicker + a sweep, sits over
// faint scanlines with an accent glow, and powers down on exit. The panel takes
// the opposite side of the screen from the planet.
import React from "react";
import { motion as Motion } from "framer-motion";
import { SECTIONS } from "../sections/sections";

const panelVariants = {
  initial: { opacity: 0, y: 26 },
  animate: {
    opacity: [0, 1, 0.55, 1], // boot flicker as it powers on
    y: 0,
    transition: { duration: 0.5, times: [0, 0.45, 0.6, 1], ease: "easeOut" },
  },
  exit: { opacity: 0, y: 14, transition: { duration: 0.22 } },
};
const bodyVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.22, duration: 0.4 } },
};

export default function StopPanel({ stop, index, total }) {
  const { title, subtitle, Component } = SECTIONS[stop.planet.section];
  const accent = stop.accent;
  const panelRight = stop.side === "left"; // panel sits opposite the planet
  const num = String(index).padStart(2, "0");
  const beamSide = panelRight ? "left-0" : "right-0"; // glowing edge faces the planet

  return (
    <div
      className={`fixed inset-0 z-20 flex pointer-events-none items-end justify-center sm:p-10 lg:p-14 sm:items-center ${
        panelRight ? "sm:justify-end sm:pr-36 lg:pr-40" : "sm:justify-start"
      }`}
    >
      <Motion.div
        variants={panelVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="pointer-events-auto relative w-full sm:w-[480px] lg:w-[520px] max-h-[56vh] sm:max-h-[78vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl bg-[#050810]/85 backdrop-blur-xl"
        style={{
          border: `1px solid ${accent}55`,
          boxShadow: `0 0 50px ${accent}22, 0 -20px 60px rgba(0,0,0,0.55)`,
        }}
      >
        {/* hologram glow + scanlines (flicker only on the glow, never the text) */}
        <span
          aria-hidden="true"
          className="holo-flicker pointer-events-none absolute inset-0"
          style={{ boxShadow: `inset 0 0 44px ${accent}1f` }}
        />
        <span aria-hidden="true" className="holo-lines pointer-events-none absolute inset-0 opacity-50" />
        {/* projection edge facing the planet */}
        <span
          aria-hidden="true"
          className={`holo-flicker pointer-events-none absolute inset-y-0 ${beamSide} w-px`}
          style={{ background: accent, boxShadow: `0 0 14px ${accent}` }}
        />
        {/* one-shot boot sweep */}
        <Motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 h-10"
          style={{ background: `linear-gradient(${accent}00, ${accent}66, ${accent}00)` }}
          initial={{ top: "-12%", opacity: 0.9 }}
          animate={{ top: "112%", opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        />

        {/* grab handle (mobile sheet) */}
        <div className="sm:hidden relative z-10 flex justify-center pt-2.5 pb-0.5">
          <span className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* ghost sector numeral */}
        <span
          aria-hidden="true"
          className="absolute -top-1 right-4 font-display text-6xl sm:text-7xl select-none pointer-events-none"
          style={{ color: `${accent}12` }}
        >
          {num}
        </span>

        {/* header */}
        <header className="relative z-10 px-6 pt-3 sm:pt-5 pb-4 border-b" style={{ borderColor: `${accent}26` }}>
          <p
            className="font-mono text-[10px] tracking-[0.3em] uppercase"
            style={{ color: accent, textShadow: `0 0 10px ${accent}` }}
          >
            ◈ Data fragment {num} / {String(total).padStart(2, "0")} — recovered
          </p>
          <h2 className="font-display uppercase text-lg sm:text-xl tracking-[0.12em] mt-2 text-white">
            {title}
          </h2>
          {subtitle && (
          <p className="font-mono text-[11px] text-white/40 mt-1 uppercase tracking-[0.2em]">{subtitle}</p>
        )}
        </header>

        {/* body */}
        <Motion.div
          variants={bodyVariants}
          data-journey-scroll
          className="relative z-10 px-6 py-5 sm:py-6 overflow-y-auto overscroll-contain custom-scrollbar"
        >
          <Component accent={accent} />
        </Motion.div>
      </Motion.div>
    </div>
  );
}
