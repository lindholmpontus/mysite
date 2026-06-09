// MatrixRain.jsx — faint falling-glyph "data rain" for the terminal screen, so
// it reads as a live, hacked console behind the decode text. Canvas-based,
// throttled, low-opacity; katakana + hex for that classic look.
import React, { useEffect, useRef } from "react";

const GLYPHS = "アイウエオカキクケコサシスセソ0123456789ABCDEF#%&*<>{}";

export default function MatrixRain({ color = "#8fe9ff", opacity = 0.14 }) {
  const ref = useRef(null);

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    let raf = 0;
    let w = 0;
    let h = 0;
    let cols = 0;
    let drops = [];
    let font = 14;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = cvs.getBoundingClientRect();
      if (!r.width || !r.height) return;
      w = cvs.width = Math.round(r.width * dpr);
      h = cvs.height = Math.round(r.height * dpr);
      font = Math.round(14 * dpr);
      cols = Math.max(1, Math.floor(w / font));
      drops = Array.from({ length: cols }, () => (Math.random() * h) / font);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cvs);

    let last = 0;
    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      if (t - last < 55) return; // ~18fps — the steppy matrix cadence
      last = t;
      // fade the previous frame to leave trailing tails
      ctx.fillStyle = "rgba(3,6,12,0.28)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.font = `${font}px monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        ctx.fillText(ch, i * font, drops[i] * font);
        if (drops[i] * font > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [color]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 w-full h-full" style={{ opacity }} />;
}
