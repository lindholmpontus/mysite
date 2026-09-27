// CompleteSection.jsx — the end of the page: the mission wraps up, the
// visitor gets the obvious next steps (CV, email, profiles), and the texture
// credits live here as end credits.
import React from "react";
import { motion as Motion } from "framer-motion";
import { PROFILE } from "../data/content";

export default function CompleteSection({ count, total }) {
  const done = count >= total;
  return (
    <section id="complete" className="relative min-h-[90vh] flex items-center justify-center px-6 py-24">
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-xl"
      >
        <p className="font-mono text-[10px] sm:text-xs tracking-[0.4em] uppercase" style={{ color: done ? "#86f3a6" : "rgba(255,255,255,0.45)" }}>
          ◈ {count} / {total} fragments recovered{done ? " · records restored" : ""}
        </p>
        <h2 className="font-display uppercase text-3xl sm:text-5xl tracking-[0.14em] mt-5 text-white [text-shadow:0_0_44px_rgba(125,170,255,0.45)]">
          {done ? "Mission complete" : "Almost there"}
        </h2>
        <p className="font-light text-sm sm:text-base text-white/60 mt-5 leading-relaxed">
          Thanks for helping me piece it back together. If you'd like to talk, I'm one message away.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href={PROFILE.cv}
            download
            className="font-mono text-xs tracking-[0.2em] uppercase px-5 py-2.5 rounded-lg border border-sky-300/50 text-sky-100 hover:bg-sky-300/10 transition-colors"
          >
            ↓ Download CV
          </a>
          <a
            href={`mailto:${PROFILE.email}`}
            className="font-mono text-xs tracking-[0.2em] uppercase px-5 py-2.5 rounded-lg border border-white/20 text-white/80 hover:border-white/50 hover:text-white transition-colors"
          >
            ✉ Email me
          </a>
          <a
            href={PROFILE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs tracking-[0.2em] uppercase px-5 py-2.5 rounded-lg border border-white/20 text-white/80 hover:border-white/50 hover:text-white transition-colors"
          >
            LinkedIn ↗
          </a>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-10 font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          ↑ Back to launch
        </button>
        {/* end credits — the planet + Milky Way maps are CC BY 4.0 and need attribution */}
        <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/25 mt-8">
          Planet & sky textures:{" "}
          <a
            href="https://www.solarsystemscope.com/textures/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/20 hover:text-white/60 transition-colors"
          >
            Solar System Scope
          </a>{" "}
          (based on NASA imagery) ·{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/20 hover:text-white/60 transition-colors"
          >
            CC BY 4.0
          </a>{" "}
          · modified
        </p>
      </Motion.div>
    </section>
  );
}
