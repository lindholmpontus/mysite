// PlanetSection.jsx — one planet, one fragment. Desktop: two columns — a
// sticky slot the 3D planet is pinned to (so it rises in, holds beside the
// text while you read, then scrolls away) and the holographic card. Phones:
// the slot sits above the card and simply scrolls with the page.
import React, { memo, useEffect, useRef } from "react";
import { motion as Motion } from "framer-motion";
import { SECTIONS } from "../sections/sections";

const cardV = {
  hidden: { opacity: 0, y: 48 },
  show: {
    opacity: [0, 1, 0.6, 1], // boot flicker as the hologram powers on
    y: 0,
    transition: { duration: 0.75, times: [0, 0.45, 0.6, 1], ease: "easeOut" },
  },
};

// lock-on brackets around where the planet sits, plus its callsign
function SlotReticle({ accent, title, num, recovered, fill }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative aspect-square w-[min(100%,62vh)] lg:w-[min(100%,100vh)]">
        <div className="absolute inset-0" style={{ transform: `scale(${Math.min(0.96, fill * 1.2)})` }}>
          {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((c) => (
            <span key={c} className={`absolute w-5 h-5 ${c}`} style={{ borderColor: `${accent}8c` }} />
          ))}
          <p
            className="absolute -top-7 left-0 right-0 text-center font-mono text-[10px] tracking-[0.28em] uppercase whitespace-nowrap"
            style={{ color: accent, textShadow: `0 0 10px ${accent}` }}
          >
            ◈ {recovered ? "Recovered" : "Scanning"} · {num} {title}
          </p>
        </div>
      </div>
    </div>
  );
}

function PlanetSection({ entry, slotRef, onRecovered, recovered, total }) {
  const { planet, index, side, fill } = entry;
  const { title, subtitle, Component } = SECTIONS[planet.section];
  const accent = planet.accent;
  const num = String(index).padStart(2, "0");
  const cardRef = useRef();
  const planetLeft = side === "left";

  // the fragment counts as recovered once its card is well into view
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && onRecovered(index), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [index, onRecovered]);

  return (
    <section id={planet.section} aria-labelledby={`${planet.section}-title`} className="relative">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:grid lg:grid-cols-2 lg:gap-12 lg:min-h-[165vh]">
        <div className={planetLeft ? "lg:order-1" : "lg:order-2"}>
          <div ref={slotRef} className="relative h-[62vh] lg:sticky lg:top-0 lg:h-screen">
            <SlotReticle accent={accent} title={title} num={num} recovered={recovered} fill={fill} />
          </div>
        </div>

        <div className={`${planetLeft ? "lg:order-2" : "lg:order-1"} pb-[16vh] lg:py-[30vh] lg:flex lg:flex-col lg:justify-center`}>
          <Motion.article
            ref={cardRef}
            variants={cardV}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="relative rounded-2xl border bg-[#050810]/80 overflow-hidden"
            style={{ borderColor: `${accent}55`, boxShadow: `0 0 50px ${accent}1c` }}
          >
            <span aria-hidden="true" className="holo-lines pointer-events-none absolute inset-0 opacity-40" />
            <span
              aria-hidden="true"
              className={`holo-flicker pointer-events-none absolute inset-y-0 ${planetLeft ? "left-0" : "right-0"} w-px`}
              style={{ background: accent, boxShadow: `0 0 14px ${accent}` }}
            />
            <header className="relative px-6 pt-5 pb-4 border-b" style={{ borderColor: `${accent}26` }}>
              <span
                aria-hidden="true"
                className="absolute -top-1 right-5 font-display text-6xl select-none pointer-events-none"
                style={{ color: `${accent}14` }}
              >
                {num}
              </span>
              <p
                className="font-mono text-[10px] tracking-[0.3em] uppercase"
                style={{ color: accent, textShadow: `0 0 10px ${accent}` }}
              >
                ◈ Data fragment {num} / {String(total).padStart(2, "0")}
              </p>
              <h2 id={`${planet.section}-title`} className="font-display uppercase text-xl sm:text-2xl tracking-[0.12em] mt-2 text-white">
                {title}
              </h2>
              {subtitle && (
                <p className="font-mono text-[11px] text-white/40 mt-1 uppercase tracking-[0.2em]">{subtitle}</p>
              )}
            </header>
            <div className="relative px-6 py-6">
              <Component accent={accent} />
            </div>
          </Motion.article>
        </div>
      </div>
    </section>
  );
}

// memoized: recovering one fragment re-renders only that section
export default memo(PlanetSection);
