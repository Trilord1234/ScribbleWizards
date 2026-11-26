/* Scribble Wizards — utils.js
   Small math, colour and canvas path helpers. */
/* ---------- helpers ---------- */
function hexA(h, a) {
  const n = parseInt(h.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function rrect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
function heartPath(c, s) {
  c.beginPath();
  c.moveTo(0, 0.36 * s);
  c.bezierCurveTo(-0.55 * s, 0, -0.42 * s, -0.46 * s, 0, -0.18 * s);
  c.bezierCurveTo(0.42 * s, -0.46 * s, 0.55 * s, 0, 0, 0.36 * s);
  c.closePath();
}
function starPath(c, R, r, n) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * TAU - Math.PI / 2,
      q = i % 2 ? r : R;
    i ? c.lineTo(Math.cos(a) * q, Math.sin(a) * q) : c.moveTo(Math.cos(a) * q, Math.sin(a) * q);
  }
  c.closePath();
}
function seeded(s) {
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const easeBack = x => {
  x = clamp(x, 0, 1);
  const c1 = 1.7,
    c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
function shade(h, f) {
  const n = parseInt(h.slice(1), 16);
  let r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  const t = f < 0 ? 0 : 255,
    p = Math.abs(f);
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return `rgb(${r},${g},${b})`;
}
