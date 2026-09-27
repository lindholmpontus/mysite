// useAnchor.js — pin a 3D body to a DOM element. Every frame the element's
// on-screen rect is read and the body is placed along the camera ray through
// the rect's centre, at the distance where its real radius spans `fill` of
// the rect. The camera sits still at the origin, so the page's own scrolling
// (native, sticky, whatever the CSS does) moves the body — it can never drift
// out of sync with the content, whatever height the content has.
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const _dir = new THREE.Vector3();
const smooth = (x) => {
  x = Math.min(1, Math.max(0, x));
  return x * x * (3 - 2 * x);
};

// slotRef: element to follow; groupRef: the body's outer group; radius: its
// world radius; fill: diameter as a fraction of min(slot width, height);
// slack: how far (in slot sizes) past the viewport it still renders — room
// for rings/atmospheres; 0 for bodies whose glow must never linger off-slot
export function useAnchor(slotRef, groupRef, radius, fill = 0.75, { entrance = true, slack = 0.6 } = {}) {
  // priority -1: after the scroll sample (-2), before the render
  useFrame(({ camera, size }) => {
    const el = slotRef.current;
    const g = groupRef.current;
    if (!el || !g) return;
    const r = el.getBoundingClientRect();
    const H = size.height;
    const W = size.width;
    // off screen (with slack for rings/atmosphere): skip rendering it at all
    const pad = Math.max(r.width, r.height) * slack;
    const visible = r.width > 0 && r.bottom > -pad && r.top < H + pad;
    g.visible = visible;
    if (!visible) return;

    // a gentle zoom-in as the slot rises into view from below
    const rise = entrance ? smooth(1 - r.top / H) : 1;
    const px = (Math.min(r.width, r.height) * fill * (0.84 + 0.16 * rise)) / 2;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const angular = Math.atan((px / (H / 2)) * tanHalf);
    const dist = radius / Math.sin(angular);

    const nx = ((r.left + r.width / 2) / W) * 2 - 1;
    const ny = 1 - ((r.top + r.height / 2) / H) * 2;
    _dir.set(nx * tanHalf * camera.aspect, ny * tanHalf, -1).normalize();
    g.position.copy(camera.position).addScaledVector(_dir, dist);
  }, -1);
}
