// StarField.jsx — a faint, slowly-drifting 2D starfield for the boot screen, so
// the console reads as floating in real deep space. Depth-parallax (nearer stars
// drift faster and brighter) + a soft twinkle. Canvas-based, lightweight.
import React, { useEffect, useRef } from "react";

export default function StarField({ count = 150 }) {
  const ref = useRef(null);

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let w = 0;
    let h = 0;
    let stars = [];

    const seed = () => {
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(), // depth 0..1
        tw: Math.random() * Math.PI * 2,
      }));
    };
    const resize = () => {
      const r = cvs.getBoundingClientRect();
      if (!r.width || !r.height) return;
      w = cvs.width = Math.round(r.width * dpr);
      h = cvs.height = Math.round(r.height * dpr);
      seed();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cvs);

    let prev = performance.now();
    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((t - prev) / 1000, 0.05);
      prev = t;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.y += (5 + s.z * 16) * dpr * dt; // slow drift; nearer = faster
        if (s.y > h) {
          s.y = 0;
          s.x = Math.random() * w;
        }
        s.tw += dt * (0.8 + s.z * 2.2);
        const alpha = (0.25 + 0.5 * Math.abs(Math.sin(s.tw))) * (0.35 + s.z * 0.65);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.z > 0.85 ? "#bfe6ff" : "#ffffff";
        const rad = (0.4 + s.z * 1.1) * dpr;
        ctx.beginPath();
        ctx.arc(s.x, s.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [count]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 w-full h-full" />;
}
