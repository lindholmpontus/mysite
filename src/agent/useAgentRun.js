// useAgentRun.js — plays a scripted "agent session". Nothing here talks to a
// model: a script is a list of events (say, think, tool, site, ask, …) and
// this hook walks it with timing, streaming text into terminal blocks and
// patching the preview's site state as it goes.
import { useCallback, useEffect, useRef, useState } from "react";

export const EMPTY_SITE = { sections: {}, chaos: {}, focus: null, hmr: null, phase: "intro" };

// sections/chaos merge key by key; everything else (phase, focus, audience,
// order) is replaced.
function mergeSite(prev, patch) {
  const { sections, chaos, hmr, ...rest } = patch;
  return {
    ...prev,
    ...rest,
    sections: { ...prev.sections, ...sections },
    chaos: { ...prev.chaos, ...chaos },
    hmr: hmr ? { file: hmr, at: Date.now() } : prev.hmr,
  };
}

let nextId = 1;
const uid = () => nextId++;

export function useAgentRun() {
  const [blocks, setBlocks] = useState([]);
  const [site, setSite] = useState(EMPTY_SITE);
  const [asking, setAsking] = useState(null); // { id, resolve, defaultIndex }
  const [running, setRunning] = useState(false);
  const speed = useRef(1); // delay multiplier; 0 = skip to the end
  const runToken = useRef(0);
  const asked = useRef(null);

  const push = useCallback((b) => {
    const id = uid();
    setBlocks((bs) => [...bs, { id, ...b }]);
    return id;
  }, []);
  const patch = useCallback((id, p) => {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...(typeof p === "function" ? p(b) : p) } : b)));
  }, []);
  const remove = useCallback((id) => setBlocks((bs) => bs.filter((b) => b.id !== id)), []);

  const play = useCallback(
    async (events, { reset = false, startSpeed = 1 } = {}) => {
      const token = ++runToken.current;
      const alive = () => runToken.current === token;
      const sleep = (ms) =>
        speed.current === 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms * speed.current));
      const answers = {};
      let todoId = null;
      speed.current = startSpeed;

      if (reset) {
        setBlocks([]);
        setSite(EMPTY_SITE);
      }
      setRunning(true);

      const handlers = {
        async say({ who, text, pace = 20, hold }) {
          const id = push({ kind: "msg", who, text: "", full: text });
          if (speed.current === 0) return patch(id, { text });
          for (let i = 0; i <= text.length && alive(); i += 2) {
            if (speed.current === 0) break;
            patch(id, { text: text.slice(0, i) });
            await sleep(pace);
          }
          patch(id, { text });
          // give the reader time before the next line lands
          await sleep(hold ?? Math.min(3800, 700 + text.length * 26));
        },
        async user({ text }) {
          const id = push({ kind: "user", text: "", typing: true });
          for (let i = 0; i <= text.length && alive() && speed.current !== 0; i++) {
            patch(id, { text: text.slice(0, i) });
            await sleep(38);
          }
          patch(id, { text, typing: false });
          await sleep(300);
        },
        async think({ who = "sage", label, ms = 1600, from = 0 }) {
          const id = push({ kind: "think", who, label, ms: ms * speed.current, from });
          await sleep(ms);
          remove(id);
        },
        async tool({ who = "sage", name, arg, diff, result, ms = 700, fail }) {
          const id = push({ kind: "tool", who, name, arg, status: "running" });
          await sleep(ms);
          patch(id, { status: fail ? "fail" : "ok", diff, result });
          await sleep(350);
        },
        async site({ patch: p }) {
          setSite((s) => mergeSite(s, p));
        },
        async todo({ items, set }) {
          if (items) {
            todoId = push({ kind: "todo", items: items.map((label) => ({ label, state: "todo" })) });
            return;
          }
          patch(todoId, (b) => ({
            items: b.items.map((it) => (set[it.label] ? { ...it, state: set[it.label] } : it)),
          }));
        },
        async join({ who, text }) {
          push({ kind: "join", who, text });
          await sleep(1100);
        },
        async sys({ text, tone }) {
          push({ kind: "sys", text, tone });
          await sleep(250);
        },
        async block({ block }) {
          push(block);
        },
        async wait({ ms }) {
          await sleep(ms);
        },
        async ask({ id, question, options, defaultIndex = 0, who }) {
          const blockId = push({ kind: "ask", question, options, who, answered: null });
          let index = defaultIndex;
          if (speed.current !== 0) {
            index = await new Promise((resolve) => {
              asked.current = { resolve, defaultIndex };
              setAsking({ blockId, options, defaultIndex });
            });
            asked.current = null;
            setAsking(null);
          }
          answers[id] = options[index].value;
          patch(blockId, { answered: index });
          await sleep(300);
        },
        async branch({ id, map }) {
          await run(map[answers[id]] || map.default || []);
        },
        async parallel({ tracks }) {
          await Promise.all(tracks.map((t) => run(t)));
        },
      };

      async function run(list) {
        for (const ev of list) {
          if (!alive()) return;
          await handlers[ev.t](ev);
        }
      }

      await run(events);
      if (alive()) setRunning(false);
      return alive();
    },
    [patch, push, remove]
  );

  const answer = useCallback((index) => asked.current?.resolve(index), []);

  // Fast-forward: everything after this resolves instantly, pending
  // questions take their default answer.
  const skip = useCallback(() => {
    speed.current = 0;
    if (asked.current) asked.current.resolve(asked.current.defaultIndex);
  }, []);
  const setSpeed = useCallback((v) => {
    speed.current = v;
  }, []);

  const stop = useCallback(() => {
    runToken.current++;
    if (asked.current) asked.current.resolve(0);
    setRunning(false);
  }, []);

  useEffect(() => stop, [stop]);

  return { blocks, site, setSite, asking, running, play, answer, skip, setSpeed, push, stop, speed };
}
