// JourneyPage.jsx — the whole site as one scroll-driven space journey.
//
// Navigation is a DISCRETE STEPPER, not native scrolling: each wheel notch /
// swipe / arrow key advances exactly one stop (with a cooldown), so scroll
// momentum and buffered events can never carry you past a planet or skip its
// panel. We own `progress` (0..1); the CameraRig damps + speed-caps toward it,
// so a step still flies the ship smoothly to the next planet.
//
// Two progress values:
//   progress — the TARGET stop (where the finger pointed)
//   flightMV — where the SHIP actually is (written by CameraRig, speed-capped)
// All overlays follow flightMV, so content only appears once the rocket arrives.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, useMotionValue, useMotionValueEvent } from "framer-motion";
import JourneyCanvas from "./JourneyCanvas";
import { STOPS, phaseAt, scrollTargetFor, requestSnap, detectQuality, SCAN_MS } from "./journeyConfig";
import Hero from "../ui/Hero";
import StopPanel from "../ui/StopPanel";
import PlanetReticle from "../ui/PlanetReticle";
import ProgressRail from "../ui/ProgressRail";
import ScrollCue from "../ui/ScrollCue";
import Outro from "../ui/Outro";
import SoundToggle from "../ui/SoundToggle";
import FragmentMeter from "../ui/FragmentMeter";
import BootScreen from "../ui/BootScreen";
import { playArrival, playDepart, playScan } from "../audio/spaceAudio";

const PLANET_STOPS = STOPS.filter((s) => s.kind === "planet");
const LAST = STOPS.length - 1;
const clampIdx = (i) => Math.max(0, Math.min(LAST, i));

export default function JourneyPage({ onExitToSummary }) {
  const quality = useMemo(() => detectQuality(), []);
  const progress = useMotionValue(0);
  const flightMV = useMotionValue(0);
  const speedMV = useMotionValue(0);
  const warpMV = useMotionValue(0);

  // boot phase: the terminal covers the (mounted, hidden) 3D scene until the
  // user "jacks in" and we reveal space. Journey input is disabled until live.
  const [live, setLive] = useState(false);
  const liveRef = useRef(false);
  const goLive = () => {
    liveRef.current = true;
    setLive(true);
  };

  // reticle screen-space tracking (written from inside the canvas every frame)
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rr = useMotionValue(0);
  const ra = useMotionValue(0);
  const reticle = useMemo(() => ({ x: rx, y: ry, r: rr, a: ra }), [rx, ry, rr, ra]);

  // coarse stop/phase state, derived from the SHIP's position
  const [active, setActive] = useState(() => phaseAt(0));
  useMotionValueEvent(flightMV, "change", (v) => {
    const next = phaseAt(v);
    setActive((prev) =>
      prev.index === next.index && prev.phase === next.phase ? prev : next
    );
  });

  const targetRef = useRef(0);
  // arrivedRef = the ship is parked at the target stop. Steps are only accepted
  // while arrived AND on a FRESH input gesture (see below). This is the fix for
  // both "saved scrolls" (trackpad momentum is one continuous gesture, so it
  // can't step more than once / can't queue) and the old multi-second "stuck"
  // (no quiet-timer — you can leave the instant you make a fresh scroll).
  const arrivedRef = useRef(true);

  // navigation: fly (capped) to a stop, or teleport (rail / return-to-launch)
  const flyTo = (i) => {
    const t = clampIdx(i);
    if (t !== targetRef.current) playDepart(); // thrust whoosh when we actually move
    targetRef.current = t;
    arrivedRef.current = false; // a new flight: not arrived until we get there
    progress.set(scrollTargetFor(t));
  };
  const teleportTo = (i) => {
    const t = clampIdx(i);
    targetRef.current = t;
    arrivedRef.current = false;
    requestSnap(scrollTargetFor(t)); // tells CameraRig to jump, not fly
    progress.set(scrollTargetFor(t));
  };

  // track arrival from the ship's actual position (for input gating)
  useEffect(() => {
    arrivedRef.current = active.phase === "dwell" && active.index === targetRef.current;
  }, [active]);

  // scan sequence: arrive at a planet -> SCANNING (~1.4s) -> fragment RECOVERED
  const [scan, setScan] = useState({ phase: "idle", index: -1 });
  const [recovered, setRecovered] = useState(() => new Set());
  useEffect(() => {
    const isPlanet = active.phase === "dwell" && STOPS[active.index]?.kind === "planet";
    if (!isPlanet) {
      setScan((s) => (s.phase === "idle" ? s : { phase: "idle", index: -1 }));
      return;
    }
    const idx = active.index;
    setScan({ phase: "scanning", index: idx });
    playScan();
    const id = setTimeout(() => {
      setScan({ phase: "revealed", index: idx });
      setRecovered((prev) => (prev.has(idx) ? prev : new Set(prev).add(idx)));
      playArrival();
    }, SCAN_MS);
    return () => clearTimeout(id);
  }, [active]);

  const planetAccents = useMemo(() => PLANET_STOPS.map((s) => s.accent), []);

  // input → discrete steps. A "gesture" is a run of input events < GAP apart;
  // only a gesture that BEGINS while parked can step, and only once. Trackpad
  // momentum is the tail of the same gesture, so it's inert; you must lift and
  // make a fresh scroll to advance again.
  useEffect(() => {
    const GAP = 160; // ms; a longer pause starts a new gesture
    const io = { lastWheel: 0, accum: 0, stepped: false, valid: false, touchY: 0, touchStepped: false, touchValid: false, lastKey: 0 };
    const step = (dir) => flyTo(targetRef.current + dir);
    const panelScrolls = (target, dy) => {
      const el = target?.closest?.("[data-journey-scroll]");
      if (!el) return false;
      const down = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      const up = el.scrollTop > 1;
      return (dy > 0 && down) || (dy < 0 && up);
    };

    const onWheel = (e) => {
      if (!liveRef.current) return; // boot screen still up
      if (panelScrolls(e.target, e.deltaY)) return; // let the panel scroll
      e.preventDefault();
      const now = performance.now();
      if (now - io.lastWheel > GAP) {
        // fresh gesture: reset, and capture whether we're parked right now
        io.accum = 0;
        io.stepped = false;
        io.valid = arrivedRef.current;
      }
      io.lastWheel = now;
      if (!io.valid || io.stepped) return;
      io.accum += e.deltaY;
      if (Math.abs(io.accum) >= 24) {
        io.stepped = true;
        step(Math.sign(io.accum));
      }
    };
    const onTouchStart = (e) => {
      if (!liveRef.current) return;
      io.touchY = e.touches[0].clientY;
      io.touchStepped = false;
      io.touchValid = arrivedRef.current; // only a swipe begun while parked steps
    };
    const onTouchMove = (e) => {
      if (!liveRef.current) return;
      const dy = io.touchY - e.touches[0].clientY; // swipe up = forward
      if (panelScrolls(e.target, dy)) return; // let the panel scroll
      e.preventDefault();
      if (!io.touchValid || io.touchStepped) return;
      if (Math.abs(dy) > 46) {
        io.touchStepped = true;
        step(Math.sign(dy));
      }
    };
    const onTouchEnd = () => {};
    const onKey = (e) => {
      if (!liveRef.current) return; // boot screen still up
      const fwd = ["ArrowDown", "PageDown", " ", "Spacebar"].includes(e.key);
      const back = ["ArrowUp", "PageUp"].includes(e.key);
      if (!fwd && !back && e.key !== "Home" && e.key !== "End") return;
      e.preventDefault();
      if (e.key === "Home") return teleportTo(0);
      if (e.key === "End") return teleportTo(LAST);
      const now = performance.now();
      if (!arrivedRef.current || now - io.lastKey < 350) return; // key-repeat guard
      io.lastKey = now;
      step(fwd ? 1 : -1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeStop = STOPS[active.index];

  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-white">
      {/* 3D space, behind everything */}
      <div className="absolute inset-0 z-0">
        <JourneyCanvas
          quality={quality}
          progress={progress}
          flightMV={flightMV}
          speedMV={speedMV}
          warpMV={warpMV}
          activeIndex={active.phase === "dwell" ? active.index : -1}
          reticle={reticle}
        />
      </div>

      {/* cinematic vignette + scanlines */}
      <div aria-hidden="true" className="absolute inset-0 z-10 pointer-events-none hud-vignette" />
      <div aria-hidden="true" className="absolute inset-0 z-10 pointer-events-none hud-scanlines" />

      {/* lock-on reticle + scan sweep around the active planet */}
      <PlanetReticle
        reticle={reticle}
        accent={activeStop.accent}
        label={activeStop.label}
        scanning={scan.phase === "scanning"}
      />

      {/* quest progress, top-center */}
      <FragmentMeter recovered={recovered} total={PLANET_STOPS.length} accents={planetAccents} />

      {/* content overlays */}
      <Hero progress={flightMV} />
      {/* the holographic dossier materializes only once the scan completes */}
      <AnimatePresence>
        {scan.phase === "revealed" && (
          <StopPanel
            key={STOPS[scan.index].id}
            stop={STOPS[scan.index]}
            index={scan.index} // STOPS index 1..6 == planet ordinal
            total={PLANET_STOPS.length}
          />
        )}
      </AnimatePresence>
      <Outro progress={flightMV} onReturn={() => teleportTo(0)} />

      {/* cockpit chrome */}
      <ProgressRail progress={flightMV} active={active} onJump={teleportTo} recovered={recovered} />
      <ScrollCue active={active} />
      <SoundToggle />

      {/* boot terminal — covers the scene until "jack in" reveals space */}
      {!live && <BootScreen onReveal={goLive} onSkip={onExitToSummary} />}
    </div>
  );
}
