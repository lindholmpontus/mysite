// GpuHint.jsx — shown only when WebGL is running on the CPU (the browser's
// hardware acceleration is off), where the journey drops to its lowest tier.
// Tells the visitor the one setting that gives them the real thing.
import React, { useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { isSoftwareRenderer } from "../journey/journeyConfig";

const KEY = "journey-gpu-hint-dismissed";

export default function GpuHint() {
  const [open, setOpen] = useState(() => {
    if (!isSoftwareRenderer()) return false;
    try {
      return localStorage.getItem(KEY) !== "1";
    } catch {
      return true;
    }
  });

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          role="status"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 1.2, duration: 0.4 } }}
          exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
          className="fixed bottom-5 left-[4.25rem] right-5 sm:right-auto z-40 max-w-sm flex items-start gap-3 rounded-lg border border-amber-300/25 bg-black/70 px-3.5 py-2.5 font-mono text-[11px] leading-relaxed text-white/70"
        >
          <span aria-hidden="true" className="text-amber-300 mt-px">⚠</span>
          <p>
            Your browser is rendering 3D without the graphics card, so this is the low-detail version. Turn on{" "}
            <span className="text-white">"Use graphics acceleration when available"</span> in your browser's
            settings and relaunch for the full experience.
          </p>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-white/40 hover:text-white transition-colors cursor-pointer -mt-0.5"
          >
            ✕
          </button>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
