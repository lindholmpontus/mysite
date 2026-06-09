// ProgressRail.jsx — the route map pinned to the right edge: one dot per stop,
// a fill line tracking the ship, and click-to-teleport navigation (clicks jump
// straight to the stop — only scrolling flies the route).
import React from "react";
import { motion as Motion, useTransform } from "framer-motion";
import { STOPS, scrollTargetFor } from "../journey/journeyConfig";

export default function ProgressRail({ progress, active, onJump, recovered }) {
  const n = STOPS.length;
  // map scroll to fraction-of-route so the fill line hits each dot exactly
  // while that stop is active
  const centers = STOPS.map((_, i) => scrollTargetFor(i));
  const fractions = STOPS.map((_, i) => i / (n - 1));
  const fill = useTransform(progress, centers, fractions);

  // clicks teleport (handled by the parent) — only scrolling flies the route
  const jumpTo = (i) => onJump?.(i);

  return (
    <nav
      aria-label="Fast travel to a stop"
      className="fixed right-2 sm:right-6 top-20 sm:top-1/2 sm:-translate-y-1/2 z-40 flex flex-col items-center"
    >
      {/* header so it's clear the dots are clickable shortcuts */}
      <p className="font-mono text-[8px] sm:text-[10px] tracking-[0.28em] uppercase text-white/55 text-center mb-2 sm:mb-3 whitespace-nowrap pointer-events-none">
        ▸ Fast travel
      </p>
      <div className="relative flex flex-col items-center justify-between h-[32vh] sm:h-[44vh] min-h-[210px] sm:min-h-[270px] py-1">
        {/* track + fill */}
        <span aria-hidden="true" className="absolute inset-y-2 w-px bg-white/15" />
        <Motion.span
          aria-hidden="true"
          style={{ scaleY: fill, transformOrigin: "top" }}
          className="absolute inset-y-2 w-px bg-sky-300/80 shadow-[0_0_8px_rgba(125,170,255,0.9)]"
        />

        {STOPS.map((stop, i) => {
          const isActive = active.index === i;
          const isRecovered = !!recovered?.has(i);
          return (
            <button
              key={stop.id}
              onClick={() => jumpTo(i)}
              aria-label={`${isRecovered ? "Recovered — " : ""}Jump to ${stop.label}`}
              className="group relative grid place-items-center w-6 h-6 cursor-pointer focus:outline-none"
            >
              <span
                className="rounded-full border transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-sky-400"
                style={{
                  width: isActive ? 11 : isRecovered ? 8 : 7,
                  height: isActive ? 11 : isRecovered ? 8 : 7,
                  borderColor: isActive || isRecovered ? stop.accent : "rgba(255,255,255,0.35)",
                  background: isActive
                    ? stop.accent
                    : isRecovered
                      ? `${stop.accent}cc`
                      : "rgba(2,3,10,0.9)",
                  boxShadow: isActive
                    ? `0 0 12px ${stop.accent}`
                    : isRecovered
                      ? `0 0 7px ${stop.accent}99`
                      : "none",
                }}
              />
              {/* hover label */}
              <span
                className="absolute right-7 whitespace-nowrap font-mono text-[10px] tracking-[0.2em] uppercase px-2 py-1 rounded border border-white/10 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block"
                style={{ color: isActive ? stop.accent : "rgba(255,255,255,0.7)" }}
              >
                {stop.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
