/* Scribble Wizards — main.js
   Game loop and automatic quality adjustment. */
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  try {
    update(dt);
    render();
    renderPreview(now / 1000);
  } catch (err) {
    console.error(err);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
