// ScrollCue.jsx — a quiet "keep scrolling" pulse shown while parked at a
// planet, so visitors know the journey continues. Hidden on the hero (which
// has its own cue) and at the final stop.
import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { STOPS } from "../journey/journeyConfig";

export default function ScrollCue({ active }) {
  const show = active.phase === "dwell" && active.index > 0 && active.index < STOPS.length - 1;

  return (
    <AnimatePresence>
      {show && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 1.2, duration: 0.6 } }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="fixed bottom-5 inset-x-0 z-30 hidden sm:flex flex-col items-center gap-2 pointer-events-none"
        >
          <p className="font-mono text-[9px] tracking-[0.4em] text-white/35 uppercase">
            Scroll to continue journey
          </p>
          <Motion.svg
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 8l8 8 8-8"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Motion.svg>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
