// environment.js — what the visitor's device and browser can do: WebGL at
// all, WebGL on the GPU or on the CPU, reduced-motion preference, and the
// render quality tier that follows from them.

// WebGL running on the CPU — the browser's hardware acceleration is off (or
// there's no usable GPU: VMs, remote desktops). The full scene runs at ~3 fps
// there, so it gets the low tier at reduced resolution plus a hint to turn
// acceleration on.
let softwareGL = null;
export function isSoftwareRenderer() {
  if (softwareGL !== null) return softwareGL;
  softwareGL = false;
  if (typeof document === "undefined") return softwareGL;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : "";
    softwareGL = /swiftshader|llvmpipe|softpipe|basic render|software/i.test(renderer);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    /* no WebGL2: hasWebGL() already routes to the 2D summary */
  }
  return softwareGL;
}

export function detectQuality() {
  if (typeof window === "undefined") return "high";
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches;
  const smallMem = navigator.deviceMemory && navigator.deviceMemory <= 4;
  if (reduced || isSoftwareRenderer()) return "low";
  if (coarse || smallMem || window.innerWidth < 820) return "medium";
  return "high";
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function hasWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}
