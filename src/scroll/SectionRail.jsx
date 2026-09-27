// SectionRail.jsx — the route map on the right edge: one dot per section, a
// fill line tracking the scroll, the current section lit, and click-to-scroll
// navigation (a smooth native scroll, so the planets glide past on the way).
import React, { useEffect, useState } from "react";
import { motion as Motion, useScroll } from "framer-motion";
import { SECTION_IDS } from "./scrollConfig";
import { SECTIONS } from "../sections/sections";
import { PLANETS } from "../scene/planets.config";

const LABELS = { launch: "Launch", complete: "Complete" };
const ACCENTS = Object.fromEntries(PLANETS.map((p) => [p.section, p.accent]));

export default function SectionRail({ recovered }) {
  const { scrollYProgress } = useScroll();
  const [active, setActive] = useState("launch");

  // the section crossing the middle of the screen is the current one
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-48% 0px -48% 0px" }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <nav
      aria-label="Jump to a section"
      // phones: hidden — native scrolling is the navigation there, and a rail
      // on a narrow screen sits on top of the cards
      className="hidden sm:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center"
    >
      <div className="relative flex flex-col items-center justify-between h-[44vh] min-h-[270px] py-1">
        <span aria-hidden="true" className="absolute inset-y-2 w-px bg-white/15" />
        <Motion.span
          aria-hidden="true"
          style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
          className="absolute inset-y-2 w-px bg-sky-300/80 shadow-[0_0_8px_rgba(125,170,255,0.9)]"
        />
        {SECTION_IDS.map((id, i) => {
          const isActive = active === id;
          const accent = ACCENTS[id] || "#9fc1ff";
          const done = recovered?.has(i); // planets are fragments 1..6
          const label = LABELS[id] || SECTIONS[id]?.title.split(" ")[0];
          return (
            <button
              key={id}
              onClick={() => go(id)}
              aria-label={`Scroll to ${LABELS[id] || SECTIONS[id]?.title}`}
              aria-current={isActive ? "true" : undefined}
              className="group relative grid place-items-center w-6 h-6 cursor-pointer focus:outline-none"
            >
              <span
                className="rounded-full border transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-sky-400"
                style={{
                  width: isActive ? 11 : done ? 8 : 7,
                  height: isActive ? 11 : done ? 8 : 7,
                  borderColor: isActive || done ? accent : "rgba(255,255,255,0.35)",
                  background: isActive ? accent : done ? `${accent}cc` : "rgba(2,3,10,0.9)",
                  boxShadow: isActive ? `0 0 12px ${accent}` : done ? `0 0 7px ${accent}99` : "none",
                }}
              />
              <span
                className="absolute right-7 whitespace-nowrap font-mono text-[10px] tracking-[0.18em] uppercase transition-colors duration-200 pointer-events-none hidden sm:block"
                style={{
                  color: isActive ? accent : done ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.38)",
                  textShadow: isActive ? `0 0 10px ${accent}` : "0 0 6px rgba(0,0,0,0.9)",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
