// spaceAudio.js — a tiny Web Audio synth engine for the journey. No external
// files: everything is generated (deep-space drone, a thrust whoosh that swells
// with warp, a soft "scanner lock" chime on arrival). Browsers block audio
// until a user gesture, so call init()/resume() from a real interaction.
//
// Want richer, recorded SFX (e.g. from Pixabay)? Drop files in public/audio/
// and swap the synth nodes for buffer sources — the public API here stays the
// same. (Pixabay has no public sound-effects API, so files must be added by
// hand; their license is free for commercial use, no attribution.)
import { journeyState } from "../journey/journeyConfig";

let ctx = null;
let master = null;
let engineGain = null;
let engineFilter = null;
let started = false;
let muted = false;
let raf = 0;

function noiseBuffer(seconds) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02; // brown-ish noise = smooth rush, no hiss
    d[i] = last * 3.2;
  }
  return buf;
}

function buildGraph() {
  master = ctx.createGain();
  master.gain.value = 0; // fade in (or stay 0 if muted)
  // global low-cut so the mix isn't bass-heavy / rumbly
  const lowcut = ctx.createBiquadFilter();
  lowcut.type = "highpass";
  lowcut.frequency.value = 90;
  lowcut.Q.value = 0.5;
  master.connect(lowcut);
  lowcut.connect(ctx.destination);

  // ---- deep-space drone: quiet, higher (less bassy) detuned tones ----
  const droneBus = ctx.createGain();
  droneBus.gain.value = 0.05;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 360;
  droneBus.connect(lp);
  lp.connect(master);
  [
    [110, "sine", 0.5],
    [110.6, "sine", 0.45],
    [165, "triangle", 0.16],
  ].forEach(([f, type, g]) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    const og = ctx.createGain();
    og.gain.value = g;
    o.connect(og);
    og.connect(droneBus);
    o.start();
  });
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.05;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 110;
  lfo.connect(lfoGain);
  lfoGain.connect(lp.frequency);
  lfo.start();

  // ---- engine rush: brown noise, gain + brightness driven by warp ----
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(3);
  src.loop = true;
  engineFilter = ctx.createBiquadFilter();
  engineFilter.type = "bandpass";
  engineFilter.frequency.value = 320;
  engineFilter.Q.value = 0.6;
  engineGain = ctx.createGain();
  engineGain.gain.value = 0;
  src.connect(engineFilter);
  engineFilter.connect(engineGain);
  engineGain.connect(master);
  src.start();
}

function tick() {
  if (!ctx) return;
  const warp = journeyState.warp || 0;
  const now = ctx.currentTime;
  engineGain.gain.setTargetAtTime(Math.min(1, warp * 1.4) * 0.13, now, 0.12);
  engineFilter.frequency.setTargetAtTime(420 + warp * 900, now, 0.12);
  raf = requestAnimationFrame(tick);
}

export function initAudio() {
  if (started || typeof window === "undefined") return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  buildGraph();
  started = true;
  // fade master in (unless muted)
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(muted ? 0 : 0.85, ctx.currentTime + 1.4);
  tick();
}

export function resumeAudio() {
  if (ctx && ctx.state === "suspended") ctx.resume();
}

export function setMuted(m) {
  muted = m;
  if (master && ctx) {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(m ? 0 : 0.85, now + 0.35);
  }
}

export function isMuted() {
  return muted;
}

// soft two-note "scanner lock" chime when arriving at a planet
export function playArrival() {
  if (!ctx || muted) return;
  const now = ctx.currentTime;
  [
    [523.25, 0.0],
    [783.99, 0.09],
  ].forEach(([freq, delay]) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    const g = ctx.createGain();
    const t = now + delay;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 0.55);
  });
}

// soft rising sweep while a planet scan runs
export function playScan() {
  if (!ctx || muted) return;
  const now = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(440, now);
  o.frequency.exponentialRampToValueAtTime(1320, now + 1.1);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.05, now + 0.2);
  g.gain.setValueAtTime(0.05, now + 0.9);
  g.gain.exponentialRampToValueAtTime(0.001, now + 1.25);
  o.connect(g);
  g.connect(master);
  o.start(now);
  o.stop(now + 1.3);
}

// short rising whoosh when departing a stop
export function playDepart() {
  if (!ctx || muted) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(0.8);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.8;
  bp.frequency.setValueAtTime(220, now);
  bp.frequency.exponentialRampToValueAtTime(1100, now + 0.5);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.18, now + 0.12);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start(now);
  src.stop(now + 0.75);
}

export function disposeAudio() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  if (ctx) ctx.close();
  ctx = null;
  started = false;
}
