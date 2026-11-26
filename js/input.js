/* Scribble Wizards — input.js
   Canvas sizing, mouse/touch and keyboard input. */
/* ---------- canvas sizing & input ---------- */
let scale = 1;
const bgc = $('#bgc'),
  bctx = bgc.getContext('2d', { alpha: false });
let bgBlood = -1,
  bgW = 0;
function resize() {
  const r = cvs.getBoundingClientRect(),
    d = Math.min(window.devicePixelRatio || 1, Q().dpr);
  for (const c of [cvs, bgc]) {
    c.width = Math.max(1, Math.round(r.width * d));
    c.height = Math.max(1, Math.round(r.height * d));
  }
  scale = cvs.width / W;
  bgW = 0;
  G.needDraw = true;
}
function renderBG() {
  if (bgW === bgc.width && Math.abs(G.blood - bgBlood) < 0.02) return;
  bgBlood = G.blood;
  bgW = bgc.width;
  bctx.setTransform(bgc.width / W, 0, 0, bgc.height / H, 0, 0);
  bctx.drawImage(BG, 0, 0);
  drawMoon(bctx);
}
const ro = new ResizeObserver(resize);
ro.observe(cvs);
const arena = $('#arena');
const toWorld = e => {
  const r = cvs.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
};
arena.addEventListener('pointerdown', e => {
  if (e.target.closest('.overlay,.bookbtn')) return;
  const wp = toWorld(e);
  G.aim = wp;
  if (G.mode === 'arena' && Math.hypot(wp.x - (W - 84), wp.y - 84) < 72) {
    openBook(0);
    return;
  }
  if (G.mode === 'duel') {
    if (Math.hypot(wp.x - 84, wp.y - 150) < 58) openBook(0);
    else if (Math.hypot(wp.x - (W - 84), wp.y - 150) < 58) openBook(1);
    return;
  }
  G.firing = true;
  try {
    arena.setPointerCapture(e.pointerId);
  } catch (_) {}
  if (WZ[0].cd <= 0 && !G.over) fire(WZ[0]);
});
arena.addEventListener('pointermove', e => {
  G.aim = toWorld(e);
});
const stop = () => (G.firing = false);
arena.addEventListener('pointerup', stop);
arena.addEventListener('pointercancel', stop);
window.addEventListener('keydown', e => {
  if (
    e.code === 'Space' &&
    !bookOpen &&
    !(e.target instanceof HTMLInputElement) &&
    G.mode === 'arena'
  ) {
    e.preventDefault();
    if (WZ[0].cd <= 0 && !G.over) fire(WZ[0]);
  }
});
