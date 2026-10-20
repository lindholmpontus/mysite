// App.jsx — the stage. The visitor says who they are, the (fake) agents
// build the portfolio in a live preview next to the terminal, and at the end
// the preview takes over the screen with the terminal tucked into a dock.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const Motion = motion.div;
import Terminal from "./agent/Terminal";
import Site from "./site/Site";
import { useAgentRun } from "./agent/useAgentRun";
import { introScript, replyTo, buildScript } from "./agent/script";

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
        <Motion
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="hmr"
        >
          <span style={{ color: "var(--ok)" }}>[vite]</span> hmr update <span className="text-ink">/{file}</span>
        </Motion>
      )}
    </AnimatePresence>
  );
}

function Preview({ site, full, scrollRef }) {
  const goTo = (id) => {
    const box = scrollRef.current;
    const el = box?.querySelector(`[data-sec="${id}"]`);
    if (el) box.scrollTo({ top: el.offsetTop - 56, behavior: "smooth" });
  };

  return (
    <div className={`flex flex-col min-h-0 h-full ${full ? "" : "browser"}`}>
      {!full && (
        <div className="browser-bar">
          <span className="flex gap-1.5">
            <i className="dot" style={{ background: "#ff5f57" }} />
            <i className="dot" style={{ background: "#febc2e" }} />
            <i className="dot" style={{ background: "#28c840" }} />
          </span>
          <span className="url">localhost:5173</span>
          <span className="w-10" />
        </div>
      )}
      <div ref={scrollRef} className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain site-scroll">
        <Site site={site} onNav={goTo} />
      </div>
      {!full && site.hmr && <HmrToast key={site.hmr.at} file={site.hmr.file} />}
    </div>
  );
}

export default function App() {
  const run = useAgentRun();
  const { blocks, site, asking, running, play, answer, skip, push } = run;
  const agentsPresent = useAgentsPresent(blocks);
  const scrollRef = useRef(null);
  // the dock remembers which run it was opened in, so a replay starts closed
  const runKey = blocks[0]?.id;
  const [dockFor, setDockFor] = useState(null);
  const dockOpen = dockFor !== null && dockFor === runKey;
  const setDockOpen = (f) => setDockFor(f(dockOpen) ? runKey : null);

  const start = useCallback(() => {
    if (reducedMotion()) {
      // no theatrics: build it instantly for a generic visitor
      play(buildScript("curious"), { reset: true, startSpeed: 0 });
    } else {
      play(introScript(), { reset: true });
    }
  }, [play]);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    if (site.phase === "replay") start();
  }, [site.phase, start]);

  // follow the agents around the preview while they build
  useEffect(() => {
    if (site.phase === "open" || !site.focus) return;
    const box = scrollRef.current;
    const el = box?.querySelector(`[data-sec="${site.focus}"]`);
    if (el) box.scrollTo({ top: Math.max(0, el.offsetTop - 56), behavior: "smooth" });
  }, [site.focus, site.hmr, site.phase]);

  useEffect(() => {
    if (site.phase === "open") scrollRef.current?.scrollTo({ top: 0 });
  }, [site.phase]);

  const onSubmit = (text) => {
    push({ kind: "user", text });
    play(replyTo(text));
  };

  const phase = site.phase;
  const split = phase === "build" || phase === "done";
  const open = phase === "open";

  const terminal = (
    <Terminal
      blocks={blocks}
      asking={asking}
      onAnswer={answer}
      running={running && !asking}
      onSkip={skip}
      onSubmit={onSubmit}
      inputEnabled={!running}
      agentsPresent={agentsPresent}
      className="h-full"
    />
  );

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-shell text-ink font-mono">
      {!open && (
        <div className={`h-full flex ${split ? "flex-col-reverse lg:flex-row" : "justify-center"} gap-0 lg:gap-3 lg:p-3`}>
          <Motion
            layout
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
            className={`term-window min-h-0 ${
              split ? "flex-1 lg:flex-none lg:w-[42%] lg:max-w-[560px] lg:min-w-[380px]" : "w-full max-w-3xl my-0 sm:my-6"
            }`}
          >
            <div className="term-titlebar">
              <span>
                <span style={{ color: "var(--sage)" }}>✻</span> pontus-code
              </span>
              <span className="text-dim hidden sm:inline">~/portfolio · {phase === "intro" ? "idle" : phase === "build" ? "working" : "done"}</span>
            </div>
            {terminal}
          </Motion>

          <AnimatePresence>
            {split && (
              <Motion
                key="preview"
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="h-[44%] lg:h-full lg:flex-1 min-w-0 relative"
              >
                <Preview site={site} full={false} scrollRef={scrollRef} />
              </Motion>
            )}
          </AnimatePresence>
        </div>
      )}

      {open && (
        <Motion initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="h-full">
          <Preview site={site} full scrollRef={scrollRef} />

          <AnimatePresence>
            {dockOpen && (
              <Motion
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                className="fixed z-40 bottom-20 right-3 left-3 sm:left-auto sm:w-[460px] h-[min(62vh,560px)] term-window shadow-2xl"
              >
                <div className="term-titlebar">
                  <span>
                    <span style={{ color: "var(--sage)" }}>✻</span> pontus-code
                  </span>
                  <button onClick={() => setDockOpen(() => false)} className="text-dim hover:text-ink cursor-pointer" aria-label="Minimize terminal">
                    ▁
                  </button>
                </div>
                {terminal}
              </Motion>
            )}
          </AnimatePresence>

          <button onClick={() => setDockOpen((o) => !o)} className="dock" aria-expanded={dockOpen}>
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
