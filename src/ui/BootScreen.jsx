// BootScreen.jsx — the opening: a derelict console SCREEN adrift in deep space,
// your view locked on it. The screen runs a sparse, glitchy DISTRESS MESSAGE
// (monochrome phosphor) that decrypts in over faint data-rain. Hitting "JACK IN"
// zooms through the screen: the message fades, the void dissolves so live space
// shows through, and the console flies at you — you punch into the solar system.
import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import ConsoleBezel from "./ConsoleBezel";
import ScrambleText from "./ScrambleText";
import MatrixRain from "./MatrixRain";
import StarField from "./StarField";

const ACCENT = "#c9d6e4"; // cool white-grey (monochrome space terminal)

function Terminal({ onJackIn }) {
  return (
    <div
      className="crt-flicker relative h-full w-full flex flex-col font-mono"
      style={{ color: ACCENT, textShadow: "0 0 10px rgba(200,215,232,0.4)" }}
    >
      {/* scanlines + soft screen glow */}
      <span aria-hidden="true" className="crt-scan pointer-events-none absolute inset-0" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(200,215,232,0.05), transparent 70%)" }}
      />

      {/* the message — big, sparse, decrypting in (hacker decode). Click-through
          so it never intercepts the JACK IN button if the text overflows. */}
      <div className="pointer-events-none relative flex-1 flex flex-col items-center justify-center text-center gap-4 sm:gap-7 px-2">
        <h2
          className="help-glitch font-display uppercase tracking-[0.12em] text-5xl sm:text-7xl"
          style={{ color: "#ffffff", textShadow: `0 0 30px ${ACCENT}`, animationDelay: "0.35s" }}
        >
          Help…
        </h2>
        <p className="text-lg sm:text-3xl font-light text-white/90">
          <ScrambleText text="An alien stole my resumé" delay={1100} perChar={26} />
        </p>
        <p className="text-lg sm:text-3xl font-light text-white/90">
          <ScrambleText text="and scattered it across the solar system" delay={1900} perChar={22} />
        </p>
        <p className="text-lg sm:text-3xl font-light" style={{ color: ACCENT }}>
          <ScrambleText text="Help me retrieve the fragments" delay={2700} perChar={26} />
          <span className="crt-cursor inline-block w-[0.5ch] h-[1em] align-text-bottom ml-1" style={{ background: ACCENT }} />
        </p>
      </div>

      {/* the JACK IN payoff — centered, inside the screen. Appears early so you
          can proceed right away (the message keeps decoding above it). */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="relative z-10 flex justify-center"
      >
        <button
          onClick={onJackIn}
          className="group font-mono text-[11px] sm:text-sm tracking-[0.22em] uppercase px-5 sm:px-8 py-2.5 sm:py-3 rounded transition-all duration-200 cursor-pointer"
          style={{ border: `1px solid ${ACCENT}`, color: ACCENT, background: "rgba(200,215,232,0.08)", boxShadow: "0 0 20px rgba(200,215,232,0.28)" }}
        >
          <span className="inline-block mr-2 group-hover:translate-x-0.5 transition-transform">▶</span>
          begin recovery
        </button>
      </Motion.div>
    </div>
  );
}

export default function BootScreen({ onReveal }) {
  const [revealing, setRevealing] = useState(false);

  const jackIn = () => {
    if (revealing) return;
    setRevealing(true);
    setTimeout(() => onReveal?.(), 950); // hand off once we've punched through
  };

  return (
    <Motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ perspective: "1500px" }}
    >
      {/* DEEP-SPACE background — near-black void, a drifting starfield + faint
          nebula + a soft glow around the derelict console. Dissolves on reveal. */}
      <Motion.div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 130% 95% at 50% 46%, #08050a 0%, #000002 72%)" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: revealing ? 0 : 1 }}
        transition={{ duration: 0.55, ease: "easeIn" }}
      >
        <StarField />
        <span aria-hidden="true" className="boot-nebula" />
        {/* soft glow pooling around the drifting console */}
        <span aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 40% at 50% 46%, rgba(120,140,170,0.12), transparent 64%)" }} />
        {/* deep vignette — keeps the edges black */}
        <span aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.82) 100%)" }} />
      </Motion.div>

      {/* FLOAT rig — the console drifts and slowly tumbles in zero-g (3D tilt via
          the parent's perspective). No preserve-3d: the children are flat, and
          it would otherwise break pointer hit-testing on the button. */}
      <Motion.div
        className="relative"
        animate={revealing ? { rotateX: 0, rotateY: 0, x: 0, y: 0 } : { rotateX: [2.6, -2.6], rotateY: [-3.6, 3.6], x: [-7, 7], y: [-11, 11] }}
        transition={
          revealing
            ? { duration: 0.4 }
            : {
                rotateX: { duration: 13, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                rotateY: { duration: 17, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                x: { duration: 11, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                y: { duration: 9, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
              }
        }
      >
        {/* the screen — fills most of the viewport; zooms toward us + fades on reveal */}
        <Motion.div
          className="relative w-[94vw] h-[86vh] sm:w-[min(98vw,147vh)] sm:h-auto sm:aspect-[3/2]"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: revealing ? 3.8 : 1, opacity: revealing ? 0 : 1 }}
          transition={{ duration: 0.85, delay: revealing ? 0.25 : 0, ease: [0.6, 0, 0.85, 0.35] }}
          style={{ transformOrigin: "center center" }}
        >
          {/* screen surface — a soft dark pool that fades to nothing at the
              edges, so the starfield shows through and the screen blends into
              the void instead of being a solid box */}
          <div
            aria-hidden="true"
            className="absolute inset-[2.5%] sm:inset-[7%]"
            style={{ background: "radial-gradient(ellipse 78% 74% at 50% 45%, rgba(6,8,12,0.72), rgba(6,8,12,0) 80%)" }}
          />
          {/* live data rain on the screen (behind the text), masked to fade out */}
          <div
            className="absolute inset-[2.5%] sm:inset-[7%] overflow-hidden"
            style={{
              WebkitMaskImage: "radial-gradient(ellipse 80% 78% at 50% 48%, #000 50%, transparent 86%)",
              maskImage: "radial-gradient(ellipse 80% 78% at 50% 48%, #000 50%, transparent 86%)",
            }}
          >
            <MatrixRain color={ACCENT} opacity={0.18} />
          </div>

          {/* slim vector screen frame (desktop) */}
          <div className="hidden sm:block">
            <ConsoleBezel />
          </div>
          {/* mobile frame — faint corner-only feel via a soft border */}
          <div
            className="sm:hidden absolute inset-0 rounded-2xl"
            style={{ border: `1px solid ${ACCENT}33`, boxShadow: `0 0 30px rgba(200,215,232,0.08)` }}
          />

          {/* terminal content — inset INSIDE the screen so the button sits within it */}
          <Motion.div
            className="absolute inset-[8%] sm:inset-[11%]"
            animate={{ opacity: revealing ? 0 : 1 }}
            transition={{ duration: 0.25 }}
          >
            <Terminal onJackIn={jackIn} />
          </Motion.div>
        </Motion.div>
      </Motion.div>

      {/* punch-through flash */}
      <Motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at center, rgba(235,242,250,0.92), rgba(200,215,232,0.2) 40%, transparent 70%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: revealing ? [0, 0.7, 0] : 0 }}
        transition={{ duration: 0.8, times: [0, 0.55, 1], ease: "easeOut" }}
      />
    </Motion.div>
  );
}
