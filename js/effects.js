/* Scribble Wizards — effects.js
   Particles, floating texts and banners. */
/* ---------- particles & text ---------- */
function part(t, x, y, vx, vy, l, s, c, o) {
  if (G.parts.length > Q().parts) return;
  const p = { t, x, y, vx, vy, l, ml: l, s, c, g: 0, rot: Math.random() * TAU, vr: 0, drag: 0 };
  if (o) Object.assign(p, o);
  G.parts.push(p);
}
function burst(x, y, col, n = 12, sp = 260, t = 'spark', s = 4) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU,
      v = rnd(0.3, 1) * sp;
    part(t, x, y, Math.cos(a) * v, Math.sin(a) * v, rnd(0.3, 0.7), rnd(s * 0.6, s * 1.3), col, {
      drag: 3,
    });
  }
}
function chips(x, y, col, n, big) {
  for (let i = 0; i < n; i++) {
    const a = rnd(-Math.PI, 0),
      v = rnd(120, big ? 520 : 340);
    part('chunk', x, y, Math.cos(a) * v, Math.sin(a) * v, rnd(0.8, 1.6), 0, col, {
      g: 1500,
      w: rnd(4, big ? 18 : 9),
      h: rnd(3, big ? 14 : 7),
      vr: rnd(-12, 12),
    });
  }
}
function txt(x, y, s, c, size = 30) {
  if (G.texts.length > Q().txt) G.texts.shift();
  G.texts.push({ x, y, s, c, l: 1.1, size });
}
function banner(t, sub) {
  G.banner = { t, sub, l: 3 };
}
