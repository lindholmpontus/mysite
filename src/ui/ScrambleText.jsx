// ScrambleText.jsx — a "hacker decode": the line shows random glyphs and
// resolves left-to-right into the real text starting at `delay` (ms). Render in
// a monospace context so width stays stable (no reflow). Reserves its space
// from the start (static scramble) so nothing jumps when it kicks off.
import React, { useEffect, useMemo, useState } from "react";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*<>/\\{}[]=+@$!?";
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

function scrambleAll(text) {
  let s = "";
  for (let i = 0; i < text.length; i++) s += text[i] === " " ? " " : rnd();
  return s;
}

export default function ScrambleText({ text, delay = 0, perChar = 20, className, style }) {
  const initial = useMemo(() => scrambleAll(text), [text]);
  const [out, setOut] = useState(initial);

  useEffect(() => {
    let raf;
    const begin = performance.now() + delay;
    const tick = (now) => {
      const t = now - begin;
      if (t < 0) {
        raf = requestAnimationFrame(tick); // hold the static scramble until delay
        return;
      }
      const revealed = Math.floor(t / perChar);
      if (revealed >= text.length) {
        setOut(text);
        return;
      }
      let s = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " " || i < revealed) s += text[i];
        else s += rnd();
      }
      setOut(s);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, delay, perChar]);

  return (
    <span className={className} style={style}>
      {out}
    </span>
  );
}
