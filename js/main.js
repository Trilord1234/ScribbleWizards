/* Scribble Wizards — main.js
   Game loop and automatic quality adjustment. */
let last = performance.now();
function fpsTick(raw) {
  if (G.paused || document.hidden || raw > 0.25) return;
  FPS.acc += raw;
  FPS.n++;
  if (FPS.acc < 2) return;
  FPS.fps = FPS.n / FPS.acc;
  FPS.acc = 0;
  FPS.n = 0;
  if (qMode !== 'auto') return;
  const i = QORDER.indexOf(qLvl);
  if (FPS.fps < 44 && i < 2) {
    qLvl = QORDER[i + 1];
    FPS.good = -3;
    CC.clear();
    resize();
    qLabel();
  } else if (FPS.fps > 58.5) {
    FPS.good++;
    if (FPS.good >= 4 && i > 0) {
      qLvl = QORDER[i - 1];
      FPS.good = -6;
      CC.clear();
      resize();
      qLabel();
    }
  } else FPS.good = Math.min(FPS.good, 0);
}
function loop(now) {
  const raw = (now - last) / 1000,
    dt = Math.min(0.033, raw);
  last = now;
  try {
    if (!G.paused) {
      update(dt);
      renderBG();
      render();
    } else if (G.needDraw) {
      renderBG();
      render();
      G.needDraw = false;
    }
    if (bookOpen) renderPreview(now / 1000);
    fpsTick(raw);
  } catch (err) {
    console.error(err);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
