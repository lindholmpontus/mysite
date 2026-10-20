// FragmentMeter.jsx — the quest progress readout, top-center. Tells a first-time
// visitor at a glance that there's a finite set of things to find ("3 / 6") and
// fills a tick (in the planet's colour) as each data fragment is recovered.
import React from "react";

export default function FragmentMeter({ recovered, total, accents }) {
  const count = recovered.size;
  const done = count >= total;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1.5 pointer-events-none select-none">
      <p
        className="font-mono text-[10px] tracking-[0.3em] uppercase whitespace-nowrap"
        style={{ color: done ? "#86f3a6" : "rgba(255,255,255,0.55)" }}
      >
        ◈ {count} / {total}
        <span className="hidden sm:inline"> fragments recovered</span>
      </p>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const has = recovered.has(i + 1); // planets are STOPS indices 1..total
          const accent = accents[i] || "#5b9dff";
          return (
            <span
              key={i}
              className="h-1 w-6 rounded-full transition-all duration-500"
              style={{
                background: has ? accent : "rgba(255,255,255,0.14)",
                boxShadow: has ? `0 0 8px ${accent}` : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
