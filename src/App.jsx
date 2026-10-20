// App.jsx — the stage. A room with a monitor: the visitor says who they are,
// the (fake) agents build the portfolio in a browser behind the terminal,
// and at the end the view zooms into the screen and the real site takes
// over, with the terminal tucked into a dock.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Terminal from "./agent/Terminal";
import Site from "./site/Site";
import Room from "./room/Room";
import { useAgentRun } from "./agent/useAgentRun";
import { introScript, replyTo, buildScript } from "./agent/script";

const Motion = motion.div;
const ZOOM_MS = 1600; // browser maximizes (0.45s), then the push-in (1.1s)

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function useAgentsPresent(blocks) {
  return useMemo(() => {
    const present = new Set(["sage"]);
    for (const b of blocks) {
      if (b.kind === "join") present.add(b.who);
      if (b.kind === "sys" && /pm-bot left/.test(b.text)) present.delete("pm");
    }
    return [...present];
  }, [blocks]);
}

// keyed on each update, so every HMR event gets a fresh toast that hides itself
function HmrToast({ file }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <Motion initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="hmr">
          <span style={{ color: "var(--ok)" }}>[vite]</span> hmr update <span className="text-ink">/{file}</span>
        </Motion>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const { blocks, site, asking, running, play, answer, skip, push } = useAgentRun();
  const agentsPresent = useAgentsPresent(blocks);
  const roomRef = useRef(null);
  const screenRef = useRef(null);
  const browserScrollRef = useRef(null);
  const fullScrollRef = useRef(null);

  // per-run UI state, remembered by the run's first block so a replay resets it
  const runKey = blocks[0]?.id;
  const [dockFor, setDockFor] = useState(null);
  const dockOpen = dockFor !== null && dockFor === runKey;
  const setDockOpen = (open) => setDockFor(open ? runKey : null);
  const [zoomedFor, setZoomedFor] = useState(null);
  const zoomed = zoomedFor !== null && zoomedFor === runKey;

  const start = useCallback(() => {
    if (reducedMotion()) play(buildScript("curious"), { reset: true, startSpeed: 0 });
    else play(introScript(), { reset: true });
  }, [play]);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    if (site.phase === "replay") start();
  }, [site.phase, start]);

  // follow the agents around the (tiny) browser while they build
  useEffect(() => {
    if (!site.focus || site.phase === "open") return;
    const box = browserScrollRef.current;
    const el = box?.querySelector(`[data-sec="${site.focus}"]`);
    if (el) box.scrollTo({ top: Math.max(0, el.offsetTop - 56), behavior: "smooth" });
  }, [site.focus, site.hmr, site.phase]);

  // "Open the site": push in on the monitor until the screen fills the
  // viewport, then swap the room for the real page.
  useEffect(() => {
    const room = roomRef.current;
    if (site.phase !== "open" || zoomed || !room) return;
    const r = screenRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const s = Math.max(vw / r.width, vh / r.height) * 1.02;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    room.style.transformOrigin = `${cx}px ${cy}px`;
    room.style.transform = `translate(${vw / 2 - cx}px, ${vh / 2 - cy}px) scale(${s})`;
    const key = runKey;
    const t = setTimeout(() => setZoomedFor(key), reducedMotion() ? 0 : ZOOM_MS);
    return () => clearTimeout(t);
  }, [site.phase, zoomed, runKey]);

  const onSubmit = (text) => {
    push({ kind: "user", text });
    play(replyTo(text));
  };

  const phase = site.phase;
  const stage = phase === "open" ? "gone" : phase === "replay" ? "intro" : phase;
  const showFull = phase === "open" && zoomed;

  const terminalWindow = (onMinimize) => (
    <>
      <div className="term-titlebar">
        <span>
          <span style={{ color: "var(--sage)" }}>✻</span> pontus-code
        </span>
        {onMinimize ? (
          <button onClick={onMinimize} className="text-dim hover:text-ink cursor-pointer" aria-label="Minimize terminal">
            ▁
          </button>
        ) : (
          <span className="text-dim hidden sm:inline">~/portfolio · {phase === "intro" ? "idle" : phase === "build" ? "working" : "done"}</span>
        )}
      </div>
      <Terminal
        blocks={blocks}
        asking={asking}
        onAnswer={answer}
        running={running && !asking}
        onSkip={skip}
        onSubmit={onSubmit}
        inputEnabled={!running}
        agentsPresent={agentsPresent}
        className="flex-1"
      />
    </>
  );

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-shell text-ink font-mono">
      {!showFull && (
        <>
          <Room
            site={site}
            stage={stage}
            chaos={site.chaos}
            roomRef={roomRef}
            screenRef={screenRef}
            browserScrollRef={browserScrollRef}
            terminal={terminalWindow()}
            toast={site.hmr && stage !== "gone" && <HmrToast key={site.hmr.at} file={site.hmr.file} />}
          />
        </>
      )}

      {showFull && (
        <Motion initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="h-full">
          <div ref={fullScrollRef} className="h-full overflow-y-auto site-scroll">
            <Site
              site={site}
              onNav={(id) => {
                const el = fullScrollRef.current?.querySelector(`[data-sec="${id}"]`);
                if (el) fullScrollRef.current.scrollTo({ top: el.offsetTop - 56, behavior: "smooth" });
              }}
            />
          </div>

          <AnimatePresence>
            {dockOpen && (
              <Motion
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                className="fixed z-40 bottom-20 right-3 left-3 sm:left-auto sm:w-[460px] h-[min(62vh,560px)] win term-dock shadow-2xl"
              >
                {terminalWindow(() => setDockOpen(false))}
              </Motion>
            )}
          </AnimatePresence>

          <button onClick={() => setDockOpen(!dockOpen)} className="dock" aria-expanded={dockOpen}>
            <span style={{ color: "var(--sage)" }}>✻</span>
            <span>{dockOpen ? "hide terminal" : "talk to the agents"}</span>
            <span className="flex gap-1">
              {agentsPresent.map((w) => (
                <span key={w} className="w-1.5 h-1.5 rounded-full" style={{ background: `var(--${w})` }} />
              ))}
            </span>
          </button>
        </Motion>
      )}
    </div>
  );
}
