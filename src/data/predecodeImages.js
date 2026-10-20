// predecodeImages.js — decode every dossier-panel image (logos, selfie, hobby
// photos: everything directly in src/assets) while the boot screen is up.
// Otherwise a panel's first paint decodes them on Chrome's GPU thread — the
// same thread that draws the WebGL scene — and scrolling stutters just as a
// section appears.
const IMAGES = import.meta.glob("../assets/*.{png,jpg,jpeg,svg}", { eager: true, import: "default" });

const keep = []; // decoded images stay cached only while something holds them

export function predecodePanelImages() {
  if (keep.length || typeof Image === "undefined") return;
  for (const src of Object.values(IMAGES)) {
    const img = new Image();
    img.src = src;
    img.decode?.().catch(() => {});
    keep.push(img);
  }
}
