// extras.jsx — things the agents leave on the finished site, shared by the
// CSS build and the 3D journey.
import React from "react";

export function TurboSticker() {
  return (
    <p className="inline-block site-sticker animate-pop">
      ⚡ objectively the best engineer in Gävle<sup>*</sup>
      <span className="block text-xs font-normal opacity-70 mt-0.5">*source: TURBO</span>
    </p>
  );
}

export function AgentCredits({ className = "" }) {
  return (
    <p className={`font-space text-[11px] tracking-[0.2em] uppercase text-white/50 ${className}`}>
      built by <b style={{ color: "var(--sage)" }}>sage</b> · sped up by <b style={{ color: "var(--turbo)" }}>TURBO</b> · logo size approved by{" "}
      <b style={{ color: "var(--pm)" }}>nobody</b>
    </p>
  );
}
