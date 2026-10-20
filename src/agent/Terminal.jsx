// Terminal.jsx — renders the agent session's blocks like a coding-agent CLI:
// welcome box, streamed messages, tool calls with diffs, a todo list, and
// interactive questions (arrow keys / number keys / click).
import React, { useEffect, useRef, useState } from "react";
import { AGENTS } from "./agents";

const SPIN = ["·", "✢", "✳", "✶", "✻", "✽", "✻", "✶", "✳", "✢"];

function useTick(ms, on = true) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setN((x) => x + 1), ms);
    return () => clearInterval(t);
  }, [ms, on]);
  return n;
}

function Who({ who }) {
  const a = AGENTS[who] || AGENTS.sage;
  return (
    <span className="font-bold" style={{ color: a.color }}>
      {a.name}
    </span>
  );
}

function Dot({ who, blink }) {
  const a = AGENTS[who] || AGENTS.sage;
  return (
    <span className={`shrink-0 w-4 ${blink ? "animate-blink" : ""}`} style={{ color: a.color }}>
      ⏺
    </span>
  );
}

function Welcome() {
  return (
    <div className="border rounded-lg px-4 py-3 mb-4 max-w-xl" style={{ borderColor: "var(--sage)" }}>
      <p>
        <span style={{ color: "var(--sage)" }}>✻</span> Welcome to <span className="font-bold">pontus-code</span>
        <span className="text-dim"> research preview</span>
      </p>
      <p className="text-dim mt-2 pl-4 text-[0.92em]">/help for help · no actual AI was harmed</p>
      <p className="text-dim pl-4 text-[0.92em]">cwd: ~/pontus-lindholm/portfolio</p>
    </div>
  );
}

function Msg({ b }) {
  const streaming = b.text.length < b.full.length;
  return (
    <div className="flex gap-1 my-2">
      <Dot who={b.who} />
      <p className="min-w-0 break-words">
        <Who who={b.who} /> <span className={b.who === "turbo" ? "text-turbo-ink" : ""}>{b.text}</span>
        {streaming && <span className="caret" />}
      </p>
    </div>
  );
}

function User({ b }) {
  return (
    <div className="my-3 px-2 py-1 rounded bg-user text-dim-strong">
      <span className="text-dim">&gt; </span>
      {b.text}
      {b.typing && <span className="caret" />}
    </div>
  );
}

function Think({ b }) {
  const n = useTick(110);
  const secs = Math.floor((n * 110) / 1000);
  const a = AGENTS[b.who] || AGENTS.sage;
  return (
    <div className="my-2 flex gap-1" style={{ color: a.color }}>
      <span className="w-4 shrink-0">{SPIN[n % SPIN.length]}</span>
      <span>
        {b.label}… <span className="text-dim">({secs}s · esc to skip)</span>
      </span>
    </div>
  );
}

function Tool({ b }) {
  const running = b.status === "running";
  return (
    <div className="my-2">
      <div className="flex gap-1">
        <Dot who={b.who} blink={running} />
        <p className="min-w-0 break-all">
          <span className="font-bold">{b.name}</span>
          <span className="text-dim">(</span>
          {b.arg}
          <span className="text-dim">)</span>
          {b.who !== "sage" && (
            <span className="text-dim">
              {" "}
              · <Who who={b.who} />
            </span>
          )}
        </p>
      </div>
      {!running && (
        <div className="pl-5">
          <p className={b.status === "fail" ? "text-err" : "text-dim"}>
            <span className="text-dim">⎿ </span> {b.result}
          </p>
          {b.diff && (
            <div className="mt-1 ml-4 rounded overflow-hidden text-[0.88em]">
              {b.diff.map((l, i) => (
                <div
                  key={i}
                  className={`px-2 whitespace-pre-wrap break-all ${
                    l[0] === "+" ? "diff-add" : l[0] === "-" ? "diff-del" : "text-dim"
                  }`}
                >
                  {l}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Todo({ b }) {
  return (
    <div className="my-2">
      <div className="flex gap-1">
        <Dot who="sage" />
        <span className="font-bold">Update Todos</span>
      </div>
      <div className="pl-5">
        {b.items.map((it, i) => (
          <p key={it.label} className={it.state === "done" ? "text-dim line-through" : it.state === "doing" ? "font-bold" : ""}>
            <span className="text-dim">{i === 0 ? "⎿ " : "  "}</span>
            <span style={it.state === "doing" ? { color: "var(--sage)" } : undefined}>
              {it.state === "done" ? "☒" : it.state === "doing" ? "◼" : "☐"}
            </span>{" "}
            {it.label}
          </p>
        ))}
      </div>
    </div>
  );
}

function Join({ b }) {
  const a = AGENTS[b.who];
  return (
    <div className="my-3 flex items-center gap-3 animate-slam" style={{ color: a.color }}>
      <span className="h-px flex-1 opacity-40" style={{ background: a.color }} />
      <span className="font-bold tracking-wide">
        {a.glyph} {b.text}
      </span>
      <span className="h-px flex-1 opacity-40" style={{ background: a.color }} />
    </div>
  );
}

function Sys({ b }) {
  return <p className={`my-2 ${b.tone === "err" ? "text-err font-bold" : "text-dim"}`}>{b.tone === "err" ? "✗ " : "· "}{b.text}</p>;
}

function Ask({ b, active, selected, onPick }) {
  const a = b.who ? AGENTS[b.who] : null;
  const color = a ? a.color : "var(--sage)";
  if (b.answered !== null) {
    return (
      <p className="my-2 text-dim">
        <span style={{ color }}>?</span> {b.question} <span className="text-ink">› {b.options[b.answered].label}</span>
      </p>
    );
  }
  return (
    <div className="my-3 border rounded-lg px-4 py-3" style={{ borderColor: color }}>
      <p className="font-bold" style={{ color }}>
        {a ? "Permission requested" : b.question}
      </p>
      {a && <p className="mt-1 text-ink">{b.question}</p>}
      <div className="mt-2">
        {b.options.map((o, i) => (
          <button
            key={o.value}
            disabled={!active}
            onClick={() => onPick(i)}
            className={`block w-full text-left py-0.5 rounded cursor-pointer transition-colors ${
              active && selected === i ? "" : "text-dim hover:text-ink"
            }`}
            style={active && selected === i ? { color } : undefined}
          >
            {active && selected === i ? "❯" : " "} {i + 1}. {o.label}
            {o.hint && <span className="text-dim"> — {o.hint}</span>}
          </button>
        ))}
      </div>
      <p className="mt-2 text-dim text-[0.85em]">↑/↓ to move · enter to choose · or just click</p>
    </div>
  );
}

function Summary({ b }) {
  return (
    <div className="my-3 border border-line rounded-lg px-4 py-3 max-w-xl">
      <p className="font-bold text-ok">✓ Portfolio built</p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
        {b.stats.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="text-dim">{k}</dt>
            <dd>{v}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}

const RENDER = { welcome: Welcome, msg: Msg, user: User, think: Think, tool: Tool, todo: Todo, join: Join, sys: Sys, summary: Summary };

export default function Terminal({ blocks, asking, onAnswer, running, onSkip, onSubmit, inputEnabled, agentsPresent, className = "" }) {
  const scroller = useRef(null);
  const stick = useRef(true);
  // the highlighted option, remembered per question
  const [picked, setPicked] = useState({ for: null, i: 0 });
  const sel = asking && picked.for === asking.blockId ? picked.i : asking?.defaultIndex ?? 0;
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  // keep pinned to the bottom unless the reader scrolled up
  useEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  });

  useEffect(() => {
    if (inputEnabled) inputRef.current?.focus({ preventScroll: true });
  }, [inputEnabled]);

  useEffect(() => {
    const onKey = (e) => {
      if (asking) {
        const n = asking.options.length;
        const move = (d) => (setPicked({ for: asking.blockId, i: (sel + d + n) % n }), e.preventDefault());
        if (e.key === "ArrowDown" || e.key === "j") move(1);
        else if (e.key === "ArrowUp" || e.key === "k") move(-1);
        else if (e.key === "Enter") (onAnswer(sel), e.preventDefault());
        else if (/^[1-9]$/.test(e.key) && +e.key <= n) onAnswer(+e.key - 1);
      }
      if (e.key === "Escape" && running) onSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [asking, sel, onAnswer, running, onSkip]);

  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSubmit(draft);
    setDraft("");
  };

  return (
    <div className={`term flex flex-col min-h-0 ${className}`}>
      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        }}
        className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 pt-4 pb-2 term-scroll"
      >
        {blocks.map((b) => {
          if (b.kind === "ask")
            return <Ask key={b.id} b={b} active={asking?.blockId === b.id} selected={sel} onPick={onAnswer} />;
          const C = RENDER[b.kind];
          return C ? <C key={b.id} b={b} /> : null;
        })}
      </div>

      <div className="px-4 sm:px-5 pb-3 pt-1 shrink-0">
        <form onSubmit={submit} className="flex items-center gap-2 border border-line rounded-lg px-3 py-2 focus-within:border-dim">
          <span className="text-dim">&gt;</span>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!inputEnabled}
            placeholder={
              asking ? "pick an option above ↑" : running ? "agents are working… (esc to skip)" : "say something, or try /replay"
            }
            className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-dim disabled:cursor-not-allowed"
            aria-label="Message the agents"
          />
        </form>
        <div className="flex items-center justify-between gap-3 mt-1.5 text-[0.8em] text-dim">
          <span className="truncate">
            <span style={{ color: "var(--turbo)" }}>⏵⏵</span> auto-accept edits on
            <span className="hidden sm:inline"> · {agentsPresent.length} agent{agentsPresent.length === 1 ? "" : "s"}</span>
            {agentsPresent.map((w) => (
              <span key={w} className="ml-1.5" style={{ color: AGENTS[w].color }} title={AGENTS[w].name}>
                {AGENTS[w].glyph}
              </span>
            ))}
          </span>
          {running && (
            <button onClick={onSkip} className="shrink-0 hover:text-ink cursor-pointer underline-offset-2 hover:underline">
              skip ⏭
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
