// ScrollJourneyPage.jsx — the whole site as one native-scrolling page through
// the solar system. A fixed WebGL layer (sky, dust, and each planet pinned to
// its section) sits behind ordinary HTML sections; you scroll normally
// (wheel, trackpad momentum, touch, keys, the rail) and each planet rises in
// beside its fragment of the résumé. The agents' build opens it: App mounts it
// under the room early (so textures load) and flips `live` after the zoom.
// `badge` and `credits` are whatever the agents left behind; `comic` is TURBO.
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { motion as Motion, useScroll, useTransform } from "framer-motion";
import SpaceCanvas from "./SpaceCanvas";
import HeroSection from "./HeroSection";
import PlanetSection from "./PlanetSection";
import CompleteSection from "./CompleteSection";
import SectionRail from "./SectionRail";
import { SCROLL_PLANETS } from "./scrollConfig";
import FragmentMeter from "../ui/FragmentMeter";
import GpuHint from "../ui/GpuHint";
import { detectQuality, isSoftwareRenderer } from "../lib/environment";
import { predecodePanelImages } from "../data/predecodeImages";

const TOTAL = SCROLL_PLANETS.length;
const ACCENTS = SCROLL_PLANETS.map((e) => e.planet.accent);

export default function ScrollJourneyPage({ live, badge, credits, comic }) {
  const quality = useMemo(() => detectQuality(), []);
  // one slot element per body; the page lays them out, the canvas follows them
  const slots = useMemo(
    () => ({ sun: createRef(), ...Object.fromEntries(SCROLL_PLANETS.map((e) => [e.planet.id, createRef()])) }),
    []
  );
  // the top fade only matters once content scrolls under the meter; over the
  // bright launch sky it would read as a dark bar
  const { scrollY } = useScroll();
  const fadeOpacity = useTransform(scrollY, (y) => Math.min(1, Math.max(0, (y - innerHeight * 0.55) / (innerHeight * 0.4))));
  const [recovered, setRecovered] = useState(() => new Set());

  const onRecovered = useCallback((index) => {
    setRecovered((prev) => {
      if (prev.has(index)) return prev;
      return new Set(prev).add(index);
    });
  }, []);

  useEffect(predecodePanelImages, []);
  // CPU-rendered WebGL: tell the CSS to drop per-frame compositor effects
  useEffect(() => {
    if (isSoftwareRenderer()) document.documentElement.dataset.softwareGl = "";
  }, []);
  // always start at the launch
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);
  useEffect(() => {
    if (live) window.scrollTo(0, 0);
  }, [live]);

  return (
    <div className={`journey relative bg-black text-white ${comic ? "chaos-comic" : ""}`}>
      <SpaceCanvas quality={quality} slots={slots} />
      <div aria-hidden="true" className="fixed inset-0 z-[1] pointer-events-none hud-vignette" />

      <main className="relative z-10">
        <HeroSection sunSlot={slots.sun} live={live} badge={badge} />
        {SCROLL_PLANETS.map((entry) => (
          <PlanetSection
            key={entry.planet.id}
            entry={entry}
            slotRef={slots[entry.planet.id]}
            onRecovered={onRecovered}
            recovered={recovered.has(entry.index)}
            total={TOTAL}
          />
        ))}
        <CompleteSection>{credits}</CompleteSection>
      </main>

      {live && (
        <>
          {/* content slides under a soft fade at the top, not into the meter */}
          <Motion.div
            aria-hidden="true"
            style={{ opacity: fadeOpacity }}
            className="fixed inset-x-0 top-0 h-16 z-30 pointer-events-none bg-gradient-to-b from-black/90 via-black/60 to-transparent"
          />
          <FragmentMeter recovered={recovered} total={TOTAL} accents={ACCENTS} />
          <SectionRail recovered={recovered} />
          <GpuHint />
        </>
      )}
    </div>
  );
}
