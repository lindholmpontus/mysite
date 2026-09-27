// ScrollJourneyPage.jsx — the whole site as one native-scrolling page through
// the solar system. A fixed WebGL layer (sky, dust, and each planet pinned to
// its section) sits behind ordinary HTML sections; you scroll normally
// (wheel, trackpad momentum, touch, keys, the rail) and each planet rises in
// beside its fragment of the résumé. The boot screen still opens it.
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import SpaceCanvas from "./SpaceCanvas";
import HeroSection from "./HeroSection";
import PlanetSection from "./PlanetSection";
import CompleteSection from "./CompleteSection";
import SectionRail from "./SectionRail";
import { SCROLL_PLANETS } from "./scrollConfig";
import BootScreen from "../ui/BootScreen";
import FragmentMeter from "../ui/FragmentMeter";
import GpuHint from "../ui/GpuHint";
import { detectQuality, isSoftwareRenderer } from "../journey/journeyConfig";
import { predecodePanelImages } from "../data/predecodeImages";

const TOTAL = SCROLL_PLANETS.length;
const ACCENTS = SCROLL_PLANETS.map((e) => e.planet.accent);

export default function ScrollJourneyPage() {
  const quality = useMemo(() => detectQuality(), []);
  // one slot element per body; the page lays them out, the canvas follows them
  const slots = useMemo(
    () => ({ sun: createRef(), ...Object.fromEntries(SCROLL_PLANETS.map((e) => [e.planet.id, createRef()])) }),
    []
  );
  const [live, setLive] = useState(false);
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
  // always start at the launch, and hold the page still behind the boot screen
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (!live) window.scrollTo(0, 0);
    root.style.overflow = live ? "" : "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, [live]);

  return (
    <div className="relative bg-black text-white">
      <SpaceCanvas quality={quality} slots={slots} />
      <div aria-hidden="true" className="fixed inset-0 z-[1] pointer-events-none hud-vignette" />

      <main className="relative z-10">
        <HeroSection sunSlot={slots.sun} live={live} />
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
        <CompleteSection count={recovered.size} total={TOTAL} />
      </main>

      {live && (
        <>
          {/* content slides under a soft fade at the top, not into the meter */}
          <div
            aria-hidden="true"
            className="fixed inset-x-0 top-0 h-16 z-30 pointer-events-none bg-gradient-to-b from-black/90 via-black/60 to-transparent"
          />
          <FragmentMeter recovered={recovered} total={TOTAL} accents={ACCENTS} />
          <SectionRail recovered={recovered} />
          <GpuHint />
        </>
      )}

      {!live && <BootScreen onReveal={() => setLive(true)} />}
    </div>
  );
}
