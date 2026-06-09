// ConsoleBezel.jsx — a slim vector SCREEN frame (no housing/control strip): a
// thin dark edge, a glowing amber rim, and corner brackets sitting exactly at
// the four corners. The screen area is a transparent hole so the terminal +
// data-rain show through. viewBox is 3:2; the screen hole is inset ~7%.
import React from "react";

const ACCENT = "#c9d6e4"; // cool white-grey (monochrome space terminal)

export default function ConsoleBezel() {
  return (
    <svg
      viewBox="0 0 1500 1000"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    >
      <defs>
        <filter id="cb-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* faint glowing rim — no solid edge, so it reads as a display floating
          in space rather than a boxed-in panel */}
      <rect x="105" y="70" width="1290" height="860" rx="20" fill="none" stroke={ACCENT} strokeWidth="2" strokeOpacity="0.4" filter="url(#cb-glow)" />

      {/* corner brackets — the main delineation, anchored at the true corners */}
      <g stroke={ACCENT} strokeWidth="6" strokeLinecap="round" strokeOpacity="0.75" fill="none" filter="url(#cb-glow)">
        <path d="M105 165 V70 H200" />
        <path d="M1395 165 V70 H1300" />
        <path d="M105 835 V930 H200" />
        <path d="M1395 835 V930 H1300" />
      </g>
    </svg>
  );
}
