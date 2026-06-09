// smoke-journey.mjs — headless-Chrome CDP smoke test for the 3D journey.
// Boots the site, screenshots the boot screen, clicks JACK IN, screenshots the
// scene, steps the journey forward (wheel + ArrowDown), screenshots mid-flight
// and parked, and reports every console error/warning seen along the way.
// Run: node scripts/smoke-journey.mjs   (dev server must be on :5173)
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9333;
const URL = "http://localhost:5174";
const OUT = "scripts/smoke-out";
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  "--headless=new",
  "--no-first-run",
  "--no-default-browser-check",
  "--enable-unsafe-swiftshader", // software WebGL fallback in headless
  "--window-size=1600,900",
  "--user-data-dir=" + process.env.TEMP + "/smoke-journey-profile",
  "about:blank",
]);
process.on("exit", () => chrome.kill());

// wait for the devtools endpoint, grab the page target
let target = null;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try {
    const list = await (await fetch(`http://localhost:${PORT}/json`)).json();
    target = list.find((t) => t.type === "page");
  } catch {}
}
if (!target) throw new Error("chrome devtools endpoint never came up");

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let msgId = 0;
const pending = new Map();
const consoleLog = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(m.error.message)) : res(m.result);
  } else if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type)) {
    consoleLog.push(`[console.${m.params.type}] ` + m.params.args.map((a) => a.value ?? a.description ?? "").join(" "));
  } else if (m.method === "Runtime.exceptionThrown") {
    consoleLog.push("[exception] " + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text));
  } else if (m.method === "Log.entryAdded" && ["error", "warning"].includes(m.params.entry.level)) {
    consoleLog.push(`[log.${m.params.entry.level}] ` + m.params.entry.text);
  }
};
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = ++msgId;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });

const shot = async (name) => {
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, "base64"));
  console.log("saved", `${OUT}/${name}.png`);
};
const evaluate = (expression) => send("Runtime.evaluate", { expression, returnByValue: true });

await send("Runtime.enable");
await send("Log.enable");
await send("Page.enable");
await send("Page.navigate", { url: URL });
await sleep(4600); // boot message decodes ~3.5s; CTA fades in at 3.6s
await shot("1-boot");

// hover the CTA with a real CDP mouse move (triggers :hover), then screenshot
const rect = await evaluate(
  `(() => { const b = [...document.querySelectorAll('button')].find(x => /begin recovery|jack/i.test(x.textContent)); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`
);
if (rect.result.value) {
  const { x, y } = rect.result.value;
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await sleep(400);
  await shot("1b-boot-cta-hover");
}

// click JACK IN
const clicked = await evaluate(
  `(() => { const b = [...document.querySelectorAll('button')].find(x => /begin recovery|jack/i.test(x.textContent)); if (b) { b.click(); return true; } return false; })()`
);
console.log("jack-in clicked:", clicked.result.value);
await sleep(4500);
await shot("2-scene-hero");

// step away from launch with a SCROLL UP (regression: this used to wedge input
// forever) — at the route ends any gesture must move you away
await evaluate(`window.dispatchEvent(new WheelEvent('wheel', { deltaY: -140, cancelable: true }))`);
await sleep(2200);
await shot("3-mid-flight");
await sleep(5000);
await shot("4-parked-earth");

// one more leg for a banked-turn view
await evaluate(`window.dispatchEvent(new WheelEvent('wheel', { deltaY: 140, cancelable: true }))`);
await sleep(3000);
await shot("5-mid-flight-2");

const state = await evaluate(
  `(() => { const c = document.querySelector('canvas'); return { canvas: !!c, w: c?.width, h: c?.height }; })()`
);
console.log("canvas:", JSON.stringify(state.result.value));

console.log("\n---- console errors/warnings ----");
console.log(consoleLog.length ? consoleLog.join("\n") : "(none)");
ws.close();
chrome.kill();
process.exit(0);
