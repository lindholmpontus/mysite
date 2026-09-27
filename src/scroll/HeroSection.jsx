// HeroSection.jsx — the launch: a pinned stage (sticky for the first stretch
// of scroll) with the name and the mission, and the Sun cresting the bottom
// edge. Scrolling lifts the text away and SETS the Sun (its slot is fixed to
// the viewport, so the huge disc never sweeps up through the next sections),
// then the stage releases and the first planet rises in.
import React, { useRef } from "react";
import { motion as Motion, useScroll, useTransform } from "framer-motion";
import { PROFILE } from "../data/content";

export default function HeroSection({ sunSlot, live }) {
  const pinRef = useRef();
  const { scrollYProgress } = useScroll({ target: pinRef, offset: ["start start", "end start"] });
  // the Sun is set before the first planet rises (it's far closer to the
  // camera than the planets, so a planet rising over it would pass behind)
  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.35], [0, -90]);
  const sunY = useTransform(scrollYProgress, [0, 0.3], ["0vh", "40vh"]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section id="launch" ref={pinRef} className="relative h-[135vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* the Sun's slot: a big circle fixed to the viewport, its top arc
            cresting the bottom edge; it sinks away as you scroll on */}
        <Motion.div
          ref={sunSlot}
          aria-hidden="true"
          className="fixed left-1/2 top-[76vh] aspect-square w-[115vmax] sm:w-[95vmax] pointer-events-none"
          style={{ x: "-50%", y: sunY }}
        />

        <Motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 -mt-[8vh]"
        >
          <Motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={live ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-mono text-[10px] sm:text-xs tracking-[0.4em] uppercase text-white/50"
          >
            ◈ Recovery mission · 6 fragments
          </Motion.p>
          <Motion.h1
            initial={{ opacity: 0, y: 18, letterSpacing: "0.3em" }}
            animate={live ? { opacity: 1, y: 0, letterSpacing: "0.1em" } : {}}
            transition={{ delay: 0.45, duration: 1.1, ease: "easeOut" }}
            className="font-display uppercase text-4xl sm:text-6xl lg:text-7xl mt-5 text-white [text-shadow:0_0_50px_rgba(255,190,120,0.35)]"
          >
            {PROFILE.name}
          </Motion.h1>
          <Motion.p
            initial={{ opacity: 0 }}
            animate={live ? { opacity: 1 } : {}}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="font-mono text-xs sm:text-sm tracking-[0.25em] uppercase text-[#ffd9b0] mt-4"
          >
            {PROFILE.title} · {PROFILE.location}
          </Motion.p>
          <Motion.p
            initial={{ opacity: 0 }}
            animate={live ? { opacity: 1 } : {}}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="max-w-md font-light text-sm sm:text-base text-white/60 mt-6 leading-relaxed"
          >
            An alien stole my résumé and scattered it across the solar system. Scroll to recover the fragments.
          </Motion.p>
        </Motion.div>

        {/* scroll cue */}
        <Motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-7 inset-x-0 flex flex-col items-center gap-2 z-10 pointer-events-none"
        >
          <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/70">Scroll</span>
          <span className="scroll-cue-line block w-px h-10 bg-gradient-to-b from-white/70 to-transparent" />
        </Motion.div>
      </div>
    </section>
  );
}
