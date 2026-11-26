/* Scribble Wizards — input.js
   Canvas sizing, mouse/touch and keyboard input. */
/* ---------- canvas sizing & input ---------- */
let scale = 1;
function resize() {
  const r = cvs.getBoundingClientRect(),
    d = window.devicePixelRatio || 1;
  cvs.width = Math.max(1, Math.round(r.width * d));
  cvs.height = Math.max(1, Math.round(r.height * d));
  scale = cvs.width / W;
}
const ro = new ResizeObserver(resize);
ro.observe(cvs);
const arena = $('#arena');
const toWorld = e => {
  const r = cvs.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
};
arena.addEventListener('pointerdown', e => {
  if (e.target.closest('.overlay')) return;
  G.aim = toWorld(e);
  G.firing = true;
  try {
    arena.setPointerCapture(e.pointerId);
  } catch (_) {}
  if (G.cd <= 0) fire();
});
arena.addEventListener('pointermove', e => {
  G.aim = toWorld(e);
});
const stop = () => (G.firing = false);
arena.addEventListener('pointerup', stop);
arena.addEventListener('pointercancel', stop);
window.addEventListener('keydown', e => {
  if (e.code === 'Space' && !(e.target instanceof HTMLInputElement)) {
    e.preventDefault();
    if (G.cd <= 0) fire();
  }
});
