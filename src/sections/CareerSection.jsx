// CareerSection.jsx — work experience + education on one timeline.
import React from "react";
import { CAREER } from "../data/content";

export default function CareerSection({ accent }) {
  return (
    <div className="relative">
      {/* vertical timeline line */}
      <div
        className="absolute left-[7px] top-2 bottom-2 w-px"
        style={{ background: `linear-gradient(${accent}, transparent)` }}
      />
      <ul className="space-y-7">
        {CAREER.map((item, i) => (
          <li key={i} className="relative pl-8">
            <span
              className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2"
              style={{
                borderColor: accent,
                background: item.kind === "work" ? accent : "transparent",
                boxShadow: `0 0 10px ${accent}`,
              }}
            />
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h4 className="font-mono text-base text-white">{item.role}</h4>
              <span className="font-mono text-sm" style={{ color: accent }}>
                @ {item.org}
              </span>
            </div>
            <p className="font-mono text-[11px] text-white/45 tracking-wide mt-0.5">
              {item.period} · {item.place} ·{" "}
              <span className="uppercase">{item.kind === "work" ? "Work" : "Education"}</span>
            </p>
            <ul className="mt-2 space-y-1.5">
              {item.points.map((p, j) => (
                <li key={j} className="text-gray-300 text-sm font-light leading-relaxed flex gap-2">
                  <span style={{ color: accent }}>▸</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
