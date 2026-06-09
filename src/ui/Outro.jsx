// Outro.jsx — journey's end, drifting in deep space: "Mission complete" and the
// full recovered dossier — every fragment (section) laid out at once, each
// materializing in its planet's accent. Contact details live inside the Contact
// fragment, so there's no separate CV/contact block here.
import React, { useState } from "react";
import { motion as Motion, useTransform, useMotionValueEvent } from "framer-motion";
import { DWELLS, STOPS } from "../journey/journeyConfig";
import { PLANETS } from "../scene/planets.config";
import { SECTIONS } from "../sections/sections";

const gridV = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } };
const cardV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: [0, 1, 0.6, 1], y: 0, transition: { duration: 0.55, times: [0, 0.5, 0.65, 1] } },
};

export default function Outro({ progress, onReturn }) {
  const { t0 } = DWELLS[STOPS.length - 1];
  const opacity = useTransform(progress, [t0 - 0.01, t0 + 0.015], [0, 1]);
  const pointerEvents = useTransform(progress, (v) => (v > t0 - 0.004 ? "auto" : "none"));

  // mount the dossier (and its stagger) only once we actually arrive, so the
  // fragments materialize on cue instead of off-screen at page load
  const [arrived, setArrived] = useState(false);
  useMotionValueEvent(progress, "change", (v) => {
    if (v > t0 - 0.004) setArrived(true);
  });

  return (
    <Motion.div style={{ opacity, pointerEvents }} className="fixed inset-0 z-20">
      {/* darken so the dossier reads cleanly over the starfield */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(2,3,10,0.72), rgba(2,3,10,0.9) 60%, rgba(2,3,10,0.96))" }}
      />

      <div data-journey-scroll className="relative h-full overflow-y-auto overscroll-contain custom-scrollbar">
        <div className="mx-auto max-w-5xl px-5 sm:px-10 lg:px-16 py-16 sm:py-20">
          {/* header */}
          <header className="text-center mb-10 sm:mb-14">
            <p className="font-mono text-[10px] sm:text-xs tracking-[0.4em] text-white/45 uppercase">
              ◈ 6 / 6 fragments recovered · records restored
            </p>
            <h2 className="font-display uppercase text-3xl sm:text-5xl tracking-[0.14em] mt-4 text-white [text-shadow:0_0_44px_rgba(125,170,255,0.45)]">
              Mission complete
            </h2>
            <p className="max-w-md mx-auto font-light text-sm text-white/55 mt-4 leading-relaxed">
              Here's the whole dossier you pieced back together — every fragment, in one place.
            </p>
          </header>

          {/* every fragment at once — a masonry of recovered dossiers */}
          <Motion.div
            variants={gridV}
            initial="hidden"
            animate={arrived ? "show" : "hidden"}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start"
          >
            {PLANETS.map((planet, i) => {
              const { title, Component } = SECTIONS[planet.section];
              const accent = planet.accent;
              return (
                <Motion.div
                  key={planet.id}
                  variants={cardV}
                  className="relative rounded-2xl border bg-[#050810]/85 backdrop-blur-xl overflow-hidden"
                  style={{ borderColor: `${accent}55`, boxShadow: `0 0 40px ${accent}1f` }}
                >
                  <span aria-hidden="true" className="holo-lines pointer-events-none absolute inset-0 opacity-40" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 w-px"
                    style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
                  />
                  <header className="relative px-5 pt-4 pb-3 border-b" style={{ borderColor: `${accent}26` }}>
                    <p
                      className="font-mono text-[9px] tracking-[0.3em] uppercase"
                      style={{ color: accent, textShadow: `0 0 10px ${accent}` }}
                    >
                      ◈ Fragment {String(i + 1).padStart(2, "0")} / 06
                    </p>
                    <h3 className="font-display uppercase text-base sm:text-lg tracking-[0.12em] mt-1.5 text-white">
                      {title}
                    </h3>
                  </header>
                  <div className="relative px-5 py-5">
                    <Component accent={accent} />
                  </div>
                </Motion.div>
              );
            })}
          </Motion.div>

          {/* back to the start */}
          <div className="text-center mt-10 sm:mt-12">
            <button
              onClick={() => onReturn?.()}
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              ↑ Return to launch
            </button>
          </div>
        </div>
      </div>
    </Motion.div>
  );
}
