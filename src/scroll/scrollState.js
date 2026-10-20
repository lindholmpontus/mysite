// scrollState.js — the page scroll, sampled once per rendered frame by the
// canvas (so every 3D element reads the same value), plus a smoothed velocity
// for scroll-driven motion (planet spin, dust streaks).
export const scrollState = {
  y: 0, // px
  progress: 0, // 0..1 over the whole page
  velocity: 0, // px / s, smoothed
  delta: 0, // px scrolled since the previous frame
};

let lastY = null;

export function sampleScroll(dt) {
  const y = window.scrollY;
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const delta = lastY === null ? 0 : y - lastY;
  lastY = y;
  scrollState.y = y;
  scrollState.progress = Math.min(1, Math.max(0, y / max));
  scrollState.delta = delta;
  const v = dt > 0 ? delta / dt : 0;
  scrollState.velocity += (v - scrollState.velocity) * (1 - Math.exp(-10 * dt));
}
