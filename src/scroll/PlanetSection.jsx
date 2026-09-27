// PlanetSection.jsx — one planet, one fragment. Desktop: two columns — a
// sticky slot the 3D planet is pinned to (so it rises in, holds beside the
// text while you read, then scrolls away) and the holographic card. Phones:
// the slot sits above the content and simply scrolls with the page. The
// content isn't boxed: an open editorial layout over a soft dark pool.
import React, { memo, useEffect, useRef } from "react";
import { motion as Motion } from "framer-motion";
import { SECTIONS } from "../sections/sections";

const cardV = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
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
            className="relative isolate"
          >
            {/* no box: a soft, edgeless pool of dark behind the text keeps it
                readable over the sky without framing it */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-8 -inset-y-12 sm:-inset-x-16 sm:-inset-y-16 -z-10"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(2,4,10,0.84), rgba(2,4,10,0.6) 55%, rgba(2,4,10,0) 100%)",
              }}
            />
            <header>
              <div className="flex items-center gap-4 font-mono text-[11px] tracking-[0.35em] uppercase">
                <span style={{ color: accent, textShadow: `0 0 12px ${accent}` }}>{num}</span>
                <span className="h-px w-14" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
                <span className="text-white/40">
                  Fragment {num} / {String(total).padStart(2, "0")}
                </span>
              </div>
              <h2
                id={`${planet.section}-title`}
                className="font-display uppercase text-3xl sm:text-5xl leading-tight tracking-[0.06em] mt-5 text-white"
                style={{ textShadow: `0 0 44px ${accent}40` }}
              >
                {title}
              </h2>
              {subtitle && (
                <p className="font-mono text-xs text-white/45 mt-3 uppercase tracking-[0.25em]">{subtitle}</p>
              )}
            </header>
            <div className="mt-9">
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
