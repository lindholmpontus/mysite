// PlanetReticle.jsx — the screen-space targeting bracket on the active planet.
// While the ship scans (the ~1.4s after arrival) a bright line sweeps the
// planet and a SCANNING progress bar fills; once complete it reads LOCKED and
// the hologram dossier materializes. Tracks the planet's projected position +
// apparent size via the reticle MotionValues.
import React from "react";
import { motion as Motion, useTransform } from "framer-motion";
import { SCAN_MS } from "../journey/journeyConfig";

const SCAN_S = SCAN_MS / 1000;

export default function PlanetReticle({ reticle, accent, label, scanning }) {
  const box = useTransform(reticle.r, (r) => {
    const max =
      typeof window !== "undefined"
        ? Math.min(window.innerWidth, window.innerHeight) * 0.6
        : 520;
    return Math.min(Math.max(r * 2.4 + 44, 120), max);
  });

  return (
    <Motion.div
      style={{ x: reticle.x, y: reticle.y, opacity: reticle.a }}
      className="fixed left-0 top-0 z-[15] pointer-events-none"
      aria-hidden="true"
    >
      <Motion.div style={{ width: box, height: box }} className="relative -translate-x-1/2 -translate-y-1/2">
        {/* corner brackets */}
        <Bracket className="top-0 left-0 border-t-2 border-l-2" accent={accent} />
        <Bracket className="top-0 right-0 border-t-2 border-r-2" accent={accent} />
        <Bracket className="bottom-0 left-0 border-b-2 border-l-2" accent={accent} />
        <Bracket className="bottom-0 right-0 border-b-2 border-r-2" accent={accent} />

        {/* scan sweep line — one pass over the scan duration */}
        {scanning && (
          <Motion.span
            key="sweep"
            className="absolute inset-x-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
              boxShadow: `0 0 12px ${accent}`,
            }}
            initial={{ top: "2%", opacity: 0 }}
            animate={{ top: "98%", opacity: [0, 1, 1, 0] }}
            transition={{ duration: SCAN_S, ease: "linear" }}
          />
        )}

        {/* status tag + progress */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 flex flex-col items-center gap-1 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
            />
            <span
              className="font-mono text-[10px] tracking-[0.3em] uppercase"
              style={{ color: accent, textShadow: `0 0 12px ${accent}` }}
            >
              {scanning ? "Recovering" : "Recovered"} · {label}
            </span>
          </div>
          {scanning && (
            <span className="block w-24 h-[2px] rounded-full overflow-hidden bg-white/15">
              <Motion.span
                className="block h-full origin-left"
                style={{ background: accent }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: SCAN_S, ease: "linear" }}
              />
            </span>
          )}
        </div>
      </Motion.div>
    </Motion.div>
  );
}

function Bracket({ className, accent }) {
  return <span className={`absolute w-4 h-4 ${className}`} style={{ borderColor: accent }} />;
}
