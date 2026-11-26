/* Scribble Wizards — render.js
   Background and drawing of props, monsters, wizards, projectiles, zones and HUD. */
/* ---------- background ---------- */
const BG = document.createElement('canvas');
BG.width = W;
BG.height = H;
const TW = Array.from({ length: 45 }, () => ({
  x: rnd(0, W),
  y: rnd(0, 520),
  s: rnd(1.5, 3),
  p: rnd(0, TAU),
  v: rnd(1, 3),
}));
(function () {
  const c = BG.getContext('2d'),
    R = seeded(7);
  let g = c.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, '#0a0724');
  g.addColorStop(0.55, '#24195a');
  g.addColorStop(1, '#5a3a8c');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) {
    c.fillStyle = `rgba(255,255,255,${0.2 + R() * 0.6})`;
    const s = R() * 1.8 + 0.4;
    c.fillRect(R() * W, R() * 600, s, s);
  }
  c.globalAlpha = 0.16;
  for (let i = 0; i < 3; i++) {
    c.strokeStyle = i === 1 ? '#ff6fae' : '#62f0dd';
    c.lineWidth = 40 + i * 14;
    c.beginPath();
    c.moveTo(-50, 180 + i * 40);
    c.bezierCurveTo(400, 60 + i * 30, 900, 300 - i * 20, 1650, 120 + i * 40);
    c.stroke();
  }
  c.globalAlpha = 1;
  const ridge = (base, amp, col, step) => {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(0, GROUND);
    let x = 0;
    while (x <= W) {
      c.lineTo(x, base - R() * amp);
      x += step * (0.6 + R() * 0.8);
    }
    c.lineTo(W, GROUND);
    c.closePath();
    c.fill();
  };
  ridge(600, 180, '#2c2168', 120);
  c.fillStyle = '#1f1750';
  const cx = 1080,
    cy = 560;
  c.fillRect(cx, cy - 80, 120, 80);
  [
    [cx - 10, cy - 140, 34],
    [cx + 48, cy - 170, 26],
    [cx + 100, cy - 130, 30],
  ].forEach(([x, y, w]) => {
    c.fillRect(x, y, w, cy - y);
    c.beginPath();
    c.moveTo(x - 6, y);
    c.lineTo(x + w / 2, y - 46);
    c.lineTo(x + w + 6, y);
    c.fill();
  });
  c.fillStyle = '#ffd76e';
  [
    [cx + 4, cy - 110],
    [cx + 58, cy - 140],
    [cx + 110, cy - 100],
    [cx + 40, cy - 50],
    [cx + 80, cy - 50],
  ].forEach(([x, y]) => c.fillRect(x, y, 7, 11));
  ridge(680, 120, '#221a52', 90);
  c.fillStyle = '#17123d';
  for (let x = -20; x < W + 40; x += 26 + R() * 30) {
    const h = 50 + R() * 70,
      b = GROUND - 30 + R() * 20;
    c.beginPath();
    c.moveTo(x - 18, b);
    c.lineTo(x, b - h);
    c.lineTo(x + 18, b);
    c.fill();
  }
  g = c.createLinearGradient(0, GROUND, 0, H);
  g.addColorStop(0, '#3f8a4a');
  g.addColorStop(0.25, '#2c5f36');
  g.addColorStop(1, '#173320');
  c.fillStyle = g;
  c.fillRect(0, GROUND, W, H - GROUND);
  c.fillStyle = '#5fb45f';
  c.fillRect(0, GROUND, W, 5);
  c.strokeStyle = '#6fc46a';
  c.lineWidth = 2;
  for (let x = 0; x < W; x += 9 + R() * 10) {
    c.beginPath();
    c.moveTo(x, GROUND + 2);
    c.lineTo(x + R() * 6 - 3, GROUND - 6 - R() * 8);
    c.stroke();
  }
  c.fillStyle = 'rgba(0,0,0,.18)';
  for (let i = 0; i < 40; i++) {
    c.beginPath();
    c.ellipse(R() * W, GROUND + 20 + R() * 90, 6 + R() * 14, 3 + R() * 6, 0, 0, TAU);
    c.fill();
  }
  for (let i = 0; i < 14; i++) {
    const x = R() * W,
      y = GROUND + 4 + R() * 6;
    c.fillStyle = '#e8f6ff';
    c.fillRect(x - 1.5, y - 10, 3, 10);
    c.fillStyle = '#62f0dd';
    c.beginPath();
    c.ellipse(x, y - 10, 7, 5, 0, Math.PI, 0);
    c.fill();
  }
})();
function drawMoon(ctx) {
  const b = G.blood,
    col = b > 0.01 ? mix('#fff3cf', '#ff3b4a', b) : '#fff3cf';
  const g = ctx.createRadialGradient(1320, 150, 10, 1320, 150, 230);
  g.addColorStop(0, hexA(mix('#fff0c8', '#ff2040', b), 0.5));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(1080, 0, 500, 400);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(1320, 150, 66, 0, TAU);
  ctx.fill();
  ctx.fillStyle = hexA(mix('#c8b48c', '#7a1020', b), 0.35);
  [
    [1300, 130, 14],
    [1345, 170, 10],
    [1330, 120, 7],
    [1295, 178, 8],
  ].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  });
  if (b > 0.01) {
    ctx.fillStyle = `rgba(120,0,30,${0.18 * b})`;
    ctx.fillRect(0, 0, W, GROUND);
  }
}

/* ---------- drawing: props ---------- */
function cracks(q, w, h, dmg) {
  if (dmg < 0.08) return;
  const n = Math.ceil(dmg * 7);
  if (q._cn !== n || q._cw !== w || q._ch !== h) {
    const R = seeded(q.seed),
      P = new Path2D();
    for (let i = 0; i < n; i++) {
      let x = R() * w,
        y = R() * h;
      P.moveTo(x, y);
      let a = R() * TAU;
      for (let j = 0; j < 4; j++) {
        a += R() - 0.5;
        const L = Math.min(w, h) * (0.18 + R() * 0.25);
        x = clamp(x + Math.cos(a) * L, 0, w);
        y = clamp(y + Math.sin(a) * L, 0, h);
        P.lineTo(x, y);
      }
    }
    q._cp = P;
    q._cn = n;
    q._cw = w;
    q._ch = h;
  }
  ctx.strokeStyle = 'rgba(30,15,10,.75)';
  ctx.lineWidth = 2;
  ctx.stroke(q._cp);
}
function drawProp(q) {
  const w = q.w,
    h = q.h,
    dmg = 1 - Math.max(0, q.hp) / q.max;
  ctx.save();
  if (q.rise < 1) {
    ctx.beginPath();
    ctx.rect(q.x - 30, 0, w + 60, GROUND);
    ctx.clip();
  }
  const top = propTop(q);
  ctx.translate(q.x + (q.flash > 0 ? rnd(-2, 2) : 0), top);
  let g;
  switch (q.kind) {
    case 'brick':
      g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#d0714b');
      g.addColorStop(1, '#99452c');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#5c2a1a';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, w - 2, h - 2);
      ctx.fillStyle = 'rgba(255,220,190,.25)';
      ctx.fillRect(2, 2, w - 4, 3);
      break;
    case 'crate':
      ctx.fillStyle = '#b8823f';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#6e4520';
      ctx.lineWidth = 5;
      ctx.strokeRect(2.5, 2.5, w - 5, h - 5);
      ctx.beginPath();
      ctx.moveTo(5, 5);
      ctx.lineTo(w - 5, h - 5);
      ctx.stroke();
      ctx.strokeStyle = '#d7a160';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, h * 0.35);
      ctx.lineTo(w - 8, h * 0.35);
      ctx.moveTo(8, h * 0.68);
      ctx.lineTo(w - 8, h * 0.68);
      ctx.stroke();
      break;
    case 'barrel':
      g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#6b4220');
      g.addColorStop(0.45, '#a8703a');
      g.addColorStop(1, '#5a3618');
      ctx.fillStyle = g;
      rrect(ctx, 0, 0, w, h, 12);
      ctx.fill();
      ctx.strokeStyle = '#3e2510';
      ctx.lineWidth = 1.5;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo((w * i) / 4, 2);
        ctx.lineTo((w * i) / 4, h - 2);
        ctx.stroke();
      }
      ctx.fillStyle = '#8c939c';
      ctx.fillRect(0, h * 0.2, w, 5);
      ctx.fillRect(0, h * 0.72, w, 5);
      break;
    case 'vase':
      g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#b85a26');
      g.addColorStop(0.5, '#ea8a4a');
      g.addColorStop(1, '#a44e20');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(w * 0.3, 0);
      ctx.lineTo(w * 0.7, 0);
      ctx.quadraticCurveTo(w * 0.6, h * 0.2, w, h * 0.55);
      ctx.quadraticCurveTo(w, h, w * 0.7, h);
      ctx.lineTo(w * 0.3, h);
      ctx.quadraticCurveTo(0, h, 0, h * 0.55);
      ctx.quadraticCurveTo(w * 0.4, h * 0.2, w * 0.3, 0);
      ctx.fill();
      ctx.fillStyle = '#2a1a3a';
      ctx.fillRect(w * 0.12, h * 0.55, w * 0.76, 4);
      ctx.fillStyle = '#ffe0b0';
      for (let i = 0; i < 3; i++) ctx.fillRect(w * (0.22 + i * 0.22), h * 0.66, 4, 4);
      break;
    case 'scarecrow': {
      ctx.fillStyle = '#6b4220';
      ctx.fillRect(w / 2 - 4, 30, 8, h - 30);
      ctx.fillRect(q.stage < 2 ? 2 : w / 2, 48, q.stage < 2 ? w - 4 : w / 2 - 2, 7);
      ctx.fillStyle = '#e6c35a';
      if (q.stage < 2) {
        ctx.beginPath();
        ctx.moveTo(0, 46);
        ctx.lineTo(-8, 60);
        ctx.lineTo(4, 58);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(w, 46);
      ctx.lineTo(w + 8, 60);
      ctx.lineTo(w - 4, 58);
      ctx.fill();
      ctx.fillStyle = '#4f7fbf';
      rrect(ctx, w * 0.18, 42, w * 0.64, 52, 8);
      ctx.fill();
      ctx.fillStyle = '#d24a4a';
      ctx.fillRect(w * 0.3, 58, 8, 8);
      ctx.fillRect(w * 0.58, 74, 8, 8);
      ctx.fillStyle = '#e8d29a';
      ctx.beginPath();
      ctx.arc(w / 2, 24, 18, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#3a2a10';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 10, 18);
      ctx.lineTo(w / 2 - 4, 24);
      ctx.moveTo(w / 2 - 4, 18);
      ctx.lineTo(w / 2 - 10, 24);
      ctx.moveTo(w / 2 + 4, 18);
      ctx.lineTo(w / 2 + 10, 24);
      ctx.moveTo(w / 2 + 10, 18);
      ctx.lineTo(w / 2 + 4, 24);
      ctx.moveTo(w / 2 - 8, 32);
      ctx.lineTo(w / 2 + 8, 32);
      ctx.stroke();
      if (q.stage < 1) {
        ctx.fillStyle = '#6b3d1f';
        ctx.beginPath();
        ctx.ellipse(w / 2, 8, 26, 6, 0, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w / 2 - 14, 8);
        ctx.lineTo(w / 2 - 8, -18);
        ctx.lineTo(w / 2 + 10, -16);
        ctx.lineTo(w / 2 + 14, 8);
        ctx.fill();
      }
      for (let i = 0; i < q.stage * 3; i++) {
        ctx.fillStyle = 'rgba(0,0,0,.35)';
        ctx.fillRect(w * 0.2 + ((q.seed >> i) & 31), 48 + ((q.seed >> (i + 3)) & 31), 6, 4);
      }
      break;
    }
    case 'pillar':
      g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#77718a');
      g.addColorStop(0.5, '#c4bfd2');
      g.addColorStop(1, '#6f6982');
      ctx.fillStyle = g;
      ctx.fillRect(4, 14, w - 8, h - 24);
      ctx.fillStyle = '#b4afc4';
      ctx.fillRect(0, 0, w, 16);
      ctx.fillRect(0, h - 12, w, 12);
      ctx.strokeStyle = 'rgba(60,50,80,.5)';
      ctx.lineWidth = 2;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo((w * i) / 4, 18);
        ctx.lineTo((w * i) / 4, h - 14);
        ctx.stroke();
      }
      break;
    case 'concrete':
      g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#8a8a8a');
      g.addColorStop(0.5, '#b4b4b0');
      g.addColorStop(1, '#7c7c7c');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#5d5d5d';
      for (let r = 0; r < 3; r++)
        ctx.fillRect(10, 10 + (r * (h - 20)) / 3, w - 20, (h - 20) / 3 - 10);
      ctx.strokeStyle = '#5a5a5a';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, w - 2, h - 2);
      break;
    case 'rampart':
      ctx.fillStyle = '#8f8a99';
      ctx.fillRect(0, 22, w, h - 22);
      for (let i = 0; i < 3; i++) ctx.fillRect(i * (w / 3) + 2, 0, w / 3 - 10, 24);
      ctx.strokeStyle = '#5d586a';
      ctx.lineWidth = 2;
      for (let y = 40; y < h; y += 26) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        for (let x = ((y / 26) % 2) * 20; x < w; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, y - 26);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = '#4c4757';
      ctx.fillRect(w / 2 - 8, 60, 16, 30);
      break;
    case 'pyramid':
      ctx.fillStyle = '#d9b56a';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w / 2, 0);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#b58f45';
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w, h);
      ctx.lineTo(w * 0.62, h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,80,30,.5)';
      ctx.lineWidth = 2;
      for (let y = 22; y < h; y += 22) {
        const s = ((y / h) * w) / 2;
        ctx.beginPath();
        ctx.moveTo(w / 2 - s, y);
        ctx.lineTo(w / 2 + s, y);
        ctx.stroke();
      }
      break;
    case 'tomb':
      g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#5e5a6e');
      g.addColorStop(0.5, '#9d98ae');
      g.addColorStop(1, '#56526a');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, w / 2);
      ctx.arc(w / 2, w / 2, w / 2, Math.PI, 0);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3a3648';
      ctx.font = '900 15px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('R.I.P', w / 2, w / 2 + 8);
      ctx.fillRect(w / 2 - 2, w / 2 + 16, 4, 22);
      ctx.fillRect(w / 2 - 10, w / 2 + 22, 20, 4);
      ctx.fillStyle = '#4f7a3a';
      ctx.beginPath();
      ctx.ellipse(w * 0.3, h - 2, 14, 5, 0, 0, TAU);
      ctx.fill();
      break;
    case 'slab': {
      const g2 = ctx.createLinearGradient(0, 0, 0, h);
      g2.addColorStop(0, '#b4afc4');
      g2.addColorStop(1, '#6f6982');
      ctx.fillStyle = g2;
      rrect(ctx, 0, 0, w, h, 8);
      ctx.fill();
      ctx.fillStyle = '#4f9a4a';
      ctx.beginPath();
      ctx.ellipse(w * 0.3, 2, w * 0.2, 5, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(60,50,80,.35)';
      for (let i = 1; i < 4; i++) ctx.fillRect((w * i) / 4, 4, 2, h - 8);
      ctx.fillStyle = 'rgba(180,140,255,.25)';
      ctx.beginPath();
      ctx.ellipse(w / 2, h + 10 + Math.sin(G.time * 2) * 3, w * 0.35, 6, 0, 0, TAU);
      ctx.fill();
      break;
    }
    case 'bigtree': {
      const s = Math.sin(G.time * 1.2) * 3;
      ctx.fillStyle = '#6b4220';
      ctx.fillRect(w * 0.3, h * 0.35, w * 0.4, h * 0.65);
      ctx.fillStyle = '#4f2f14';
      ctx.fillRect(w * 0.42, h * 0.5, w * 0.08, h * 0.5);
      ctx.beginPath();
      ctx.moveTo(w * 0.3, h);
      ctx.lineTo(w * 0.1, h);
      ctx.lineTo(w * 0.32, h * 0.85);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.7, h);
      ctx.lineTo(w * 0.92, h);
      ctx.lineTo(w * 0.68, h * 0.85);
      ctx.fill();
      ctx.fillStyle = '#2f8a45';
      [
        [w / 2 + s, h * 0.12, 78],
        [w * 0.05 + s, h * 0.28, 56],
        [w * 0.95 + s, h * 0.26, 58],
        [w / 2 + s, h * 0.32, 60],
      ].forEach(([cx, cy, r]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, TAU);
        ctx.fill();
      });
      ctx.fillStyle = '#4fbf5a';
      [
        [w * 0.35 + s, h * 0.04, 34],
        [w * 0.8 + s, h * 0.18, 26],
      ].forEach(([cx, cy, r]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, TAU);
        ctx.fill();
      });
      ctx.fillStyle = '#ff5a5a';
      const R2 = seeded(q.seed);
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(R2() * w * 1.6 - w * 0.3 + s, h * (0.05 + R2() * 0.35), 6, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'tramp':
      ctx.fillStyle = '#444';
      ctx.fillRect(8, h - 4, 6, 4);
      ctx.fillRect(w - 14, h - 4, 6, 4);
      ctx.fillStyle = '#2b2b3a';
      rrect(ctx, 0, 4, w, 10, 5);
      ctx.fill();
      ctx.fillStyle = '#ff7ab0';
      ctx.beginPath();
      ctx.ellipse(w / 2, 6 + (q.flash > 0 ? 6 : 0), w / 2 - 6, 5, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      for (let x = 6; x < w; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, 9);
        ctx.lineTo(x, h - 4);
        ctx.stroke();
      }
      break;
  }
  if (q.kind !== 'tramp' && q.kind !== 'scarecrow' && q.kind !== 'tomb' && q.kind !== 'bigtree')
    cracks(q, w, h, dmg);
  if (q.kind === 'bigtree') cracks(q, w, h * 0.99, dmg * 0.7);
  if (q.kind === 'tomb') cracks(q, w, h, dmg * 0.8);
  if (q.frost > 0) {
    ctx.fillStyle = `rgba(190,235,255,${0.4 * Math.min(1, q.frost)})`;
    ctx.fillRect(0, 0, w, h);
  }
  if (q.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${q.flash * 3})`;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
  if (q.handT > 0) {
    const hx = q.handX || q.x + q.w + 16,
      rise = Math.min(1, (0.9 - q.handT) * 6) * Math.min(1, q.handT * 4);
    ctx.save();
    ctx.translate(hx, GROUND);
    ctx.fillStyle = '#7fb85a';
    ctx.fillRect(-7, -40 * rise, 14, 40 * rise);
    ctx.beginPath();
    ctx.arc(0, -40 * rise, 11, 0, TAU);
    ctx.fill();
    for (let i = 0; i < 4; i++) ctx.fillRect(-10 + i * 6, -62 * rise, 4, 18 * rise);
    ctx.restore();
  }
}

/* ---------- drawing: enemies & wizards ---------- */
function drawWizard(w, gy, e) {
  const x = w.x,
    g = gy,
    { a } = aimInfo(w),
    s = w.side,
    ko = e && e.ko,
    dk = w.dark;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath();
  ctx.ellipse(x, GROUND + 3, 40, 8, 0, 0, TAU);
  ctx.fill();
  if (w.hurt > 0 && Math.floor(w.hurt * 14) % 2) ctx.globalAlpha = 0.4;
  ctx.save();
  ctx.translate(x, g);
  if (ko) ctx.rotate(((-s * Math.PI) / 2) * Math.min(1, e.koT * 3));
  ctx.scale(s, 1);
  const robe = dk ? '#211630' : w.robe,
    trim = w.robe;
  const gr = ctx.createLinearGradient(-34, 0, 34, 0);
  gr.addColorStop(0, shade(robe, -0.35));
  gr.addColorStop(0.6, robe);
  gr.addColorStop(1, shade(robe, 0.15));
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.moveTo(-36, 0);
  ctx.quadraticCurveTo(-24, -40, -16, -74);
  ctx.lineTo(16, -74);
  ctx.quadraticCurveTo(24, -40, 36, 0);
  ctx.closePath();
  ctx.fill();
  if (dk) {
    ctx.strokeStyle = trim;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-36, -1);
    ctx.lineTo(36, -1);
    ctx.stroke();
    ctx.fillStyle = trim;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      ctx.moveTo(-34 + i * 12, 0);
      ctx.lineTo(-28 + i * 12, -8);
      ctx.lineTo(-22 + i * 12, 0);
    }
    ctx.fill();
    ctx.fillStyle = '#e8e2d0';
    ctx.beginPath();
    ctx.arc(0, -46, 5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#211630';
    ctx.fillRect(-3, -47, 2, 2);
    ctx.fillRect(1, -47, 2, 2);
  } else {
    ctx.fillStyle = '#ffe28a';
    [
      [-14, -20],
      [10, -34],
      [-4, -52],
      [18, -12],
    ].forEach(([dx, dy]) => {
      ctx.save();
      ctx.translate(dx, dy);
      starPath(ctx, 4, 1.7, 5);
      ctx.fill();
      ctx.restore();
    });
    ctx.fillStyle = '#f6c453';
    ctx.fillRect(-20, -48, 40, 5);
  }
  if (dk) {
    const hood = shade('#211630', 0.1);
    ctx.fillStyle = hood;
    ctx.beginPath();
    ctx.moveTo(-24, -70);
    ctx.quadraticCurveTo(-26, -118, 2, -122);
    ctx.quadraticCurveTo(28, -118, 24, -70);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0a0612';
    ctx.beginPath();
    ctx.ellipse(4, -92, 14, 17, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = trim;
    ctx.beginPath();
    ctx.moveTo(-14, -114);
    ctx.lineTo(-24, -140);
    ctx.lineTo(-6, -120);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(16, -114);
    ctx.lineTo(28, -140);
    ctx.lineTo(10, -120);
    ctx.fill();
    const eye = e && e.loveT > 0 ? '#ff6fae' : '#9dff6a';
    ctx.fillStyle = eye;
    ctx.shadowColor = eye;
    ctx.shadowBlur = Q().glow ? 12 : 0;
    ctx.beginPath();
    ctx.ellipse(0, -94, 3, 2, 0, 0, TAU);
    ctx.ellipse(10, -94, 3, 2, 0, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = Q().glow ? 0 : 0;
  } else {
    ctx.fillStyle = '#ffd9b8';
    ctx.beginPath();
    ctx.arc(2, -88, 15, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#f4f2ff';
    ctx.beginPath();
    ctx.moveTo(-12, -86);
    ctx.quadraticCurveTo(-8, -50, 6, -44);
    ctx.quadraticCurveTo(12, -60, 16, -86);
    ctx.quadraticCurveTo(2, -78, -12, -86);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(8, -92, 2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = e && e.loveT > 0 ? '#ff6fae' : '#f0a58a';
    ctx.beginPath();
    ctx.arc(14, -87, 3.4, 0, TAU);
    ctx.fill();
    const hat = shade(robe, -0.2);
    ctx.fillStyle = hat;
    ctx.beginPath();
    ctx.ellipse(2, -98, 30, 7, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-18, -100);
    ctx.quadraticCurveTo(-4, -130, -22 + Math.sin(G.time * 2) * 3, -168);
    ctx.quadraticCurveTo(6, -140, 22, -100);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffe28a';
    ctx.save();
    ctx.translate(0, -124);
    starPath(ctx, 6, 2.6, 5);
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(8, -110, 4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = hat;
    ctx.beginPath();
    ctx.arc(10, -111, 3.6, 0, TAU);
    ctx.fill();
  }
  if (ko) {
    ctx.fillStyle = '#fff07a';
    for (let i = 0; i < 3; i++) {
      const aa = G.time * 4 + (i * TAU) / 3;
      ctx.save();
      ctx.translate(Math.cos(aa) * 20, -100 + Math.sin(aa) * 6);
      starPath(ctx, 6, 2.5, 5);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
  if (!ko) {
    ctx.save();
    ctx.translate(x + 12 * s, g - 72);
    ctx.rotate(a);
    ctx.translate(-w.recoil * 6, 0);
    ctx.strokeStyle = robe;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(26, 0);
    ctx.stroke();
    ctx.fillStyle = dk ? '#cfc6dc' : '#ffd9b8';
    ctx.beginPath();
    ctx.arc(30, 0, 6, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = dk ? '#2a1a3a' : '#7a4a24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(26, 0);
    ctx.lineTo(58, 0);
    ctx.stroke();
    const col = spellCol(compW(w));
    if (dk) {
      ctx.fillStyle = '#e8e2d0';
      ctx.beginPath();
      ctx.arc(60, 0, 7, 0, TAU);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = Q().glow ? 14 : 0;
      ctx.fillRect(57, -3, 2.5, 2.5);
      ctx.fillRect(61.5, -3, 2.5, 2.5);
    } else {
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = Q().glow ? 16 : 0;
      ctx.beginPath();
      ctx.arc(58, 0, 4 + Math.sin(G.time * 8), 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    if (dk && Math.random() < 0.15)
      part(
        'smoke',
        x + rnd(-30, 30),
        g - rnd(0, 90),
        rnd(-10, 10),
        rnd(-40, -10),
        1,
        rnd(8, 14),
        'rgba(90,30,140,.35)'
      );
  }
  ctx.restore();
  if (w.shield > 0 && !ko) {
    const a = Math.min(1, w.shield * 2) * (0.55 + 0.2 * Math.sin(G.time * 6)),
      col = w.shieldDark ? '#b46bff' : w.shieldIce ? '#dff8ff' : '#62c8ff';
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(x, g - 80);
    ctx.strokeStyle = col;
    ctx.lineWidth = 4;
    ctx.fillStyle = hexA(w.shieldDark ? '#b46bff' : '#62c8ff', w.shieldIce ? 0.32 : 0.12);
    ctx.beginPath();
    ctx.arc(0, 0, 98, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const an = (i / 6) * TAU + G.time * 0.6;
      ctx.beginPath();
      ctx.arc(Math.cos(an) * 60, Math.sin(an) * 60, 34, 0, TAU);
      ctx.stroke();
    }
    if (w.shieldDark || w.shieldLv >= 3) {
      ctx.fillStyle = col;
      for (let i = 0; i < 14; i++) {
        const an = (i / 14) * TAU + G.time * 0.3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(an - 0.08) * 98, Math.sin(an - 0.08) * 98);
        ctx.lineTo(Math.cos(an) * 116, Math.sin(an) * 116);
        ctx.lineTo(Math.cos(an + 0.08) * 98, Math.sin(an + 0.08) * 98);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  ctx.font = '800 20px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(10,6,30,.8)';
  ctx.strokeText(w.name, x, g - (dk ? 150 : 180));
  ctx.fillStyle = dk ? '#d9a6ff' : '#fff';
  ctx.fillText(w.name, x, g - (dk ? 150 : 180));
}
function drawEnemy(e) {
  const D = EK[e.kind],
    frozen = e.freeze > 0,
    still = frozen || e.stun > 0;
  if (e.kind === 'mage') {
    drawWizard(e.wz, e.y, e);
    overlays(e, frozen);
    return;
  }
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath();
  ctx.ellipse(e.x, GROUND + 2, e.w * 0.55, 7, 0, 0, TAU);
  ctx.fill();
  if (e.poss > 0) {
    const g = ctx.createRadialGradient(e.x, e.y - e.h / 2, 4, e.x, e.y - e.h / 2, e.w);
    g.addColorStop(0, 'rgba(140,255,140,.45)');
    g.addColorStop(1, 'rgba(140,255,140,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(e.x, e.y - e.h / 2, e.w, 0, TAU);
    ctx.fill();
  }
  ctx.translate(e.x + (e.flash > 0 ? rnd(-3, 3) : 0), e.y);
  if (e.dance > 0) {
    ctx.translate(0, -Math.abs(Math.sin(G.time * 10)) * 10);
    ctx.rotate(Math.sin(G.time * 12) * 0.3);
  }
  const dir = e.dir;
  if (e.kind === 'slime') {
    const hop = still || e.bubble > 0 ? 0 : Math.abs(Math.sin(e.t * 6)) * 16,
      sq = 1 + (still ? 0 : Math.sin(e.t * 12) * 0.07);
    ctx.translate(0, -hop);
    ctx.scale(sq, 2 - sq);
    const g = ctx.createRadialGradient(-8, -26, 4, 0, -16, 30);
    g.addColorStop(0, e.charmed ? '#ffd0ea' : '#c9ffb0');
    g.addColorStop(1, e.charmed ? '#ff8ac0' : '#3fbf4a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-23, 0);
    ctx.quadraticCurveTo(-26, -38, 0, -38);
    ctx.quadraticCurveTo(26, -38, 23, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#226b2a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath();
    ctx.ellipse(-9, -27, 5, 3, -0.5, 0, TAU);
    ctx.fill();
    eyes(-7, -18, 7, -18, 5, dir, e.poss > 0);
    ctx.strokeStyle = '#14361a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -9, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (e.kind === 'goblin') {
    const walk = still ? 0 : Math.sin(e.t * 10);
    ctx.scale(-dir, 1);
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, -16);
    ctx.lineTo(-6 + walk * 5, 0);
    ctx.moveTo(6, -16);
    ctx.lineTo(6 - walk * 5, 0);
    ctx.stroke();
    ctx.fillStyle = e.charmed ? '#d27aa8' : '#7a4a28';
    rrect(ctx, -15, -44, 30, 30, 7);
    ctx.fill();
    ctx.fillStyle = '#4a2a14';
    ctx.fillRect(-15, -24, 30, 4);
    ctx.fillStyle = e.charmed ? '#ffb0d4' : '#8fbf4a';
    ctx.beginPath();
    ctx.moveTo(-12, -56);
    ctx.lineTo(-28, -66);
    ctx.lineTo(-11, -48);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -56);
    ctx.lineTo(28, -66);
    ctx.lineTo(11, -48);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -54, 14, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#4a6a20';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = e.poss > 0 ? '#9dff6a' : '#ffe14d';
    ctx.beginPath();
    ctx.arc(-6, -56, 3.5, 0, TAU);
    ctx.arc(6, -56, 3.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-7, -56, 1.6, 0, TAU);
    ctx.arc(5, -56, 1.6, 0, TAU);
    ctx.fill();
    if (!e.charmed) {
      ctx.strokeStyle = '#2a3a10';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-11, -63);
      ctx.lineTo(-3, -60);
      ctx.moveTo(11, -63);
      ctx.lineTo(3, -60);
      ctx.stroke();
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(-5, -47, 3, 4);
    ctx.fillRect(2, -47, 3, 4);
    ctx.save();
    ctx.translate(-14, -34);
    ctx.rotate(-0.6 + e.swing * 1.6);
    ctx.fillStyle = '#6b4220';
    ctx.fillRect(-3, -26, 6, 26);
    ctx.beginPath();
    ctx.arc(0, -28, 7, 0, TAU);
    ctx.fill();
    ctx.restore();
  } else if (e.kind === 'bat') {
    const f = still ? 0 : Math.sin(e.t * 18);
    ctx.translate(0, -15);
    ctx.fillStyle = e.charmed ? '#ff9ad0' : '#5b3f8f';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * 8, -2);
      ctx.lineTo(s * 30, -10 - f * 14);
      ctx.lineTo(s * 24, 2);
      ctx.lineTo(s * 18, -2);
      ctx.lineTo(s * 12, 6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 11, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(-6, -18);
    ctx.lineTo(-2, -9);
    ctx.moveTo(8, -8);
    ctx.lineTo(6, -18);
    ctx.lineTo(2, -9);
    ctx.fill();
    ctx.fillStyle = e.poss > 0 ? '#9dff6a' : '#ffe14d';
    ctx.beginPath();
    ctx.arc(-4, -2, 2.6, 0, TAU);
    ctx.arc(4, -2, 2.6, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-3, 5, 2, 3);
    ctx.fillRect(1, 5, 2, 3);
  } else if (e.kind === 'golem') {
    const sway = still ? 0 : Math.sin(e.t * 3) * 3,
      st = e.stage;
    ctx.scale(-dir, 1);
    ctx.fillStyle = '#6f7482';
    rrect(ctx, -38, -42, 30, 42, 6);
    ctx.fill();
    rrect(ctx, 8, -42, 30, 42, 6);
    ctx.fill();
    ctx.translate(sway, 0);
    const g = ctx.createLinearGradient(0, -130, 0, -36);
    g.addColorStop(0, '#a7adbb');
    g.addColorStop(1, '#6c7180');
    ctx.fillStyle = g;
    rrect(ctx, -46, -128, 92, 90, 16);
    ctx.fill();
    ctx.fillStyle = '#4f9a4a';
    ctx.beginPath();
    ctx.ellipse(-24, -124, 16, 6, 0, 0, TAU);
    ctx.fill();
    if (st < 1) {
      ctx.fillStyle = '#8a8f9c';
      ctx.save();
      ctx.translate(-50, -118);
      ctx.rotate(0.15 + (e.swing || 0) * 0.5);
      rrect(ctx, -14, 0, 24, 76, 8);
      ctx.fill();
      ctx.restore();
    }
    if (st < 2) {
      ctx.fillStyle = '#8a8f9c';
      ctx.save();
      ctx.translate(50, -118);
      ctx.rotate(-0.15);
      rrect(ctx, -10, 0, 24, 76, 8);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(0, -140);
    if (st >= 3) ctx.rotate(0.25);
    ctx.fillStyle = '#9ca2b0';
    rrect(ctx, -24, -18, 48, 34, 8);
    ctx.fill();
    if (st >= 3) {
      ctx.fillStyle = '#14102e';
      ctx.beginPath();
      ctx.moveTo(10, -18);
      ctx.lineTo(24, -18);
      ctx.lineTo(24, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = e.charmed ? '#ff9ad0' : '#62f0dd';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = Q().glow ? 12 : 0;
    ctx.fillRect(-14, -6, 10, 4);
    ctx.fillRect(4, -6, 10, 4);
    ctx.restore();
    const pul = 0.6 + 0.4 * Math.sin(G.time * 5);
    ctx.fillStyle = `rgba(98,240,221,${pul})`;
    ctx.shadowColor = '#62f0dd';
    ctx.shadowBlur = Q().glow ? 18 : 0;
    ctx.beginPath();
    ctx.arc(0, -84, 10, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = Q().glow ? 0 : 0;
    ctx.save();
    ctx.translate(-46, -128);
    cracks({ seed: e.seed }, 92, 90, (1 - e.hp / e.max) * 1.1);
    ctx.restore();
  }
  ctx.restore();
  overlays(e, frozen);
  function eyes(x1, y1, x2, y2, r, d, ps) {
    ctx.fillStyle = ps ? '#9dff6a' : '#fff';
    ctx.beginPath();
    ctx.arc(x1, y1, r, 0, TAU);
    ctx.arc(x2, y2, r, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(x1 + d * 1.8, y1, r * 0.5, 0, TAU);
    ctx.arc(x2 + d * 1.8, y2, r * 0.5, 0, TAU);
    ctx.fill();
  }
}
function overlays(e, frozen) {
  ctx.save();
  ctx.translate(e.x, e.y);
  const mage = e.kind === 'mage';
  const hh = mage ? (e.wz.dark ? 140 : 165) : e.h,
    ww = mage ? 70 : e.w;
  if (frozen) {
    ctx.fillStyle = e.brittle ? 'rgba(120,255,200,.4)' : 'rgba(170,230,255,.45)';
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.lineWidth = 2;
    rrect(ctx, -ww / 2 - 8, -hh - 8, ww + 16, hh + 10, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.fillRect(-ww / 2 - 2, -hh - 2, 6, hh * 0.5);
  }
  if (e.cocoon > 0) {
    ctx.fillStyle = 'rgba(245,245,250,.85)';
    ctx.beginPath();
    ctx.ellipse(0, -hh / 2, ww * 0.65, hh * 0.6, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,180,200,.9)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(-ww * 0.6, -hh * (0.15 + i * 0.17));
      ctx.quadraticCurveTo(0, -hh * (0.05 + i * 0.17), ww * 0.6, -hh * (0.2 + i * 0.17));
      ctx.stroke();
    }
  }
  if (e.bubble > 0) {
    const r = Math.max(ww, hh) * 0.7;
    ctx.strokeStyle = 'rgba(210,250,255,.9)';
    ctx.fillStyle = 'rgba(160,230,255,.18)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -hh / 2, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-r * 0.35, -hh / 2 - r * 0.35, r * 0.18, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.fill();
  }
  if (e.stun > 0 && !frozen && !e.ko) {
    ctx.fillStyle = '#fff07a';
    for (let i = 0; i < 3; i++) {
      const a = G.time * 5 + (i * TAU) / 3;
      ctx.save();
      ctx.translate(Math.cos(a) * 18, -hh - 12 + Math.sin(a) * 5);
      starPath(ctx, 6, 2.5, 5);
      ctx.fill();
      ctx.restore();
    }
  }
  if (e.happy > 0) {
    ctx.fillStyle = '#ffc93c';
    ctx.beginPath();
    ctx.arc(0, -e.h - 16, 8, 0, TAU);
    ctx.fill();
  }
  if (!mage && e.hp < e.max && !e.charmed) {
    const bw = Math.max(40, e.w);
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(-bw / 2, -e.h - 30, bw, 6);
    ctx.fillStyle = e.hp / e.max > 0.4 ? '#6fe36b' : '#ff6464';
    ctx.fillRect(-bw / 2, -e.h - 30, bw * Math.max(0, e.hp / e.max), 6);
  }
  ctx.restore();
}

/* ---------- drawing: projectiles ---------- */
const GS = new Map();
function glowSpr(col) {
  let c = GS.get(col);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d'),
    g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, hexA(col, 0.5));
  g.addColorStop(1, hexA(col, 0));
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  GS.set(col, c);
  return c;
}
function drawSaw(R, t) {
  ctx.save();
  ctx.rotate(t * 25);
  const g = ctx.createRadialGradient(-R * 0.3, -R * 0.3, 1, 0, 0, R);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(1, '#8d97a5');
  ctx.fillStyle = g;
  ctx.beginPath();
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU,
      b = ((i + 0.6) / n) * TAU;
    ctx.lineTo(Math.cos(a) * R * 0.82, Math.sin(a) * R * 0.82);
    ctx.lineTo(Math.cos(b) * R, Math.sin(b) * R);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#59606b';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#3d434c';
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.22, 0, TAU);
  ctx.fill();
  ctx.restore();
}
function drawWhale(r, t) {
  const L = r * 2.3,
    Hh = r * 1.05,
    sw = Math.sin(t * 6) * 0.3;
  ctx.save();
  ctx.translate(-L * 0.9, 0);
  ctx.rotate(sw);
  ctx.fillStyle = '#2b5a96';
  ctx.beginPath();
  ctx.moveTo(r * 0.1, 0);
  ctx.quadraticCurveTo(-r * 0.2, -r * 0.25, -r * 0.85, -r * 0.8);
  ctx.quadraticCurveTo(-r * 0.55, -r * 0.2, -r * 0.62, 0);
  ctx.quadraticCurveTo(-r * 0.55, r * 0.2, -r * 0.85, r * 0.8);
  ctx.quadraticCurveTo(-r * 0.2, r * 0.25, r * 0.1, 0);
  ctx.fill();
  ctx.restore();
  const g = ctx.createLinearGradient(0, -Hh, 0, Hh);
  g.addColorStop(0, '#2b5a96');
  g.addColorStop(0.55, '#4a86d0');
  g.addColorStop(1, '#6aa4e6');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(L * 0.98, -Hh * 0.05);
  ctx.bezierCurveTo(L * 0.98, -Hh * 1.05, L * 0.15, -Hh * 1.08, -L * 0.35, -Hh * 0.6);
  ctx.quadraticCurveTo(-L * 0.75, -Hh * 0.28, -L * 0.95, -Hh * 0.14);
  ctx.lineTo(-L * 0.95, Hh * 0.14);
  ctx.quadraticCurveTo(-L * 0.7, Hh * 0.4, -L * 0.2, Hh * 0.78);
  ctx.bezierCurveTo(L * 0.35, Hh * 1.08, L * 0.98, Hh * 0.8, L * 0.98, -Hh * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#eef5ff';
  ctx.beginPath();
  ctx.ellipse(L * 0.38, Hh * 0.78, L * 0.62, Hh * 0.5, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#b9cde6';
  ctx.lineWidth = Math.max(1.5, r * 0.05);
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(L * 0.9, Hh * (0.32 + i * 0.12));
    ctx.quadraticCurveTo(L * 0.35, Hh * (0.42 + i * 0.12), -L * 0.15, Hh * (0.55 + i * 0.08));
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = '#1d3f6e';
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(L * 0.97, Hh * 0.12);
  ctx.quadraticCurveTo(L * 0.7, Hh * 0.32, L * 0.42, Hh * 0.2);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(L * 0.52, -Hh * 0.12, r * 0.17, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#10213a';
  ctx.beginPath();
  ctx.arc(L * 0.55, -Hh * 0.12, r * 0.1, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(L * 0.57, -Hh * 0.16, r * 0.035, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,140,170,.45)';
  ctx.beginPath();
  ctx.ellipse(L * 0.45, Hh * 0.12, r * 0.14, r * 0.08, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#2b5a96';
  ctx.save();
  ctx.translate(L * 0.1, Hh * 0.55);
  ctx.rotate(0.5 + Math.sin(t * 8) * 0.25);
  ctx.beginPath();
  ctx.ellipse(-r * 0.25, 0, r * 0.42, r * 0.15, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  const sp = 0.6 + 0.4 * Math.abs(Math.sin(t * 5));
  ctx.strokeStyle = 'rgba(190,235,255,.9)';
  ctx.lineWidth = Math.max(2, r * 0.07);
  for (const d of [-1, 0, 1]) {
    ctx.beginPath();
    ctx.moveTo(L * 0.3, -Hh * 0.98);
    ctx.quadraticCurveTo(
      L * 0.3 + d * r * 0.5,
      -Hh * (1.2 + 0.5 * sp),
      L * 0.3 + d * r * 0.8,
      -Hh * (1.0 + 0.25 * sp)
    );
    ctx.stroke();
  }
}
function drawFish(r, f, t) {
  if (f.whale) {
    drawWhale(r, t);
    return;
  }
  const L = r * (f.whale ? 2.1 : 1.7),
    Hh = r * (f.puff ? 1.25 : f.moon ? 1.3 : f.whale ? 1.05 : 0.95),
    w = Math.sin(t * 18) * 0.35;
  ctx.save();
  ctx.translate(-L * 0.85, 0);
  ctx.rotate(w);
  ctx.fillStyle = f.f;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-r * 0.9, -r * 0.85);
  ctx.lineTo(-r * 0.65, 0);
  ctx.lineTo(-r * 0.9, r * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  if (f.sword) {
    ctx.strokeStyle = f.f;
    ctx.lineWidth = r * 0.18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(L * 0.8, 0);
    ctx.lineTo(L * 1.9, 0);
    ctx.stroke();
  }
  if (f.saw) {
    ctx.fillStyle = '#9aa5b1';
    ctx.fillRect(L * 0.8, -r * 0.13, L * 1.3, r * 0.26);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 6; i++) {
      const x = L * 0.9 + i * L * 0.2;
      ctx.beginPath();
      ctx.moveTo(x, -r * 0.13);
      ctx.lineTo(x + r * 0.1, -r * 0.38);
      ctx.lineTo(x + r * 0.2, -r * 0.13);
      ctx.moveTo(x, r * 0.13);
      ctx.lineTo(x + r * 0.1, r * 0.38);
      ctx.lineTo(x + r * 0.2, r * 0.13);
      ctx.fill();
    }
  }
  if (f.shark) {
    ctx.fillStyle = f.f;
    ctx.beginPath();
    ctx.moveTo(-L * 0.2, -Hh * 0.8);
    ctx.lineTo(L * 0.05, -Hh * 1.7);
    ctx.lineTo(L * 0.35, -Hh * 0.8);
    ctx.fill();
  }
  if (f.puff) {
    ctx.strokeStyle = f.f;
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * L * 0.9, Math.sin(a) * Hh * 0.9);
      ctx.lineTo(Math.cos(a) * L * 1.15, Math.sin(a) * Hh * 1.15);
      ctx.stroke();
    }
  }
  const g = ctx.createLinearGradient(0, -Hh, 0, Hh);
  g.addColorStop(0, f.b);
  g.addColorStop(1, f.belly || '#ffffff');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, L, Hh, 0, 0, TAU);
  ctx.fill();
  if (f.stripes) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, L, Hh, 0, 0, TAU);
    ctx.clip();
    for (const x of [L * 0.35, -L * 0.25]) {
      if (f.edge) {
        ctx.fillStyle = '#222';
        ctx.fillRect(x - r * 0.24, -Hh, r * 0.48, Hh * 2);
      }
      ctx.fillStyle = f.stripes;
      ctx.fillRect(x - r * 0.17, -Hh, r * 0.34, Hh * 2);
    }
    ctx.restore();
  }
  ctx.fillStyle = f.f;
  ctx.beginPath();
  ctx.moveTo(0, Hh * 0.2);
  ctx.lineTo(-L * 0.35, Hh * 0.7);
  ctx.lineTo(L * 0.1, Hh * 0.5);
  ctx.fill();
  ctx.fillStyle = f.teeth ? '#ffdf4d' : '#fff';
  ctx.beginPath();
  ctx.arc(L * 0.55, -Hh * 0.25, r * 0.28, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(L * 0.6, -Hh * 0.25, r * 0.14, 0, TAU);
  ctx.fill();
  if (f.teeth) {
    const m = 0.3 * Math.abs(Math.sin(t * 14));
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) {
      const x = L * 0.6 + i * r * 0.13;
      ctx.beginPath();
      ctx.moveTo(x, Hh * 0.05 - m * r);
      ctx.lineTo(x + r * 0.06, Hh * 0.3);
      ctx.lineTo(x + r * 0.12, Hh * 0.05 - m * r);
      ctx.fill();
    }
  } else {
    ctx.strokeStyle = 'rgba(0,0,0,.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(L * 0.85, Hh * 0.15, r * 0.18, -0.4, 1.2);
    ctx.stroke();
  }
}
function drawProj(p) {
  const k = p.spec,
    S = k.syn,
    c = n => k.n[n] || 0,
    r = p.r,
    t = p.t,
    ang = Math.atan2(p.vy, p.vx),
    col = spellCol(k),
    dk = k.dark;
  for (const b of p.bodies) {
    ctx.save();
    ctx.translate(b[0], b[1]);
    if (c('ghost')) ctx.globalAlpha = 0.6 + 0.15 * Math.sin(t * 10);
    ctx.drawImage(glowSpr(col), -r * 2.6, -r * 2.6, r * 5.2, r * 5.2);
    if (c('gravity')) {
      ctx.save();
      ctx.rotate(t * 4);
      ctx.strokeStyle = dk ? 'rgba(122,60,255,.85)' : 'rgba(166,139,255,.75)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.5 + i * 5, i * 2, i * 2 + 2.2);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (k.saw && !S.has('sawfish'))
      for (let q = k.saw; q >= 1; q--)
        drawSaw(
          (k.body === 'saw' ? r * 1.35 : r * 1.7) * (1 + 0.3 * (q - 1)),
          t * (q % 2 ? 1 : -1)
        );
    if (k.body === 'square') {
      ctx.rotate(t * 3);
      const w = r * 2.2,
        h = r * 1.5;
      const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
      g.addColorStop(0, dk ? '#6a6478' : '#cfd3d8');
      g.addColorStop(1, dk ? '#2e2a38' : '#8d9298');
      ctx.fillStyle = g;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = '#62666c';
      ctx.lineWidth = 2;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = dk ? '#8dff6a' : '#55595f';
      ctx.fillRect(-w * 0.38, -h * 0.28, w * 0.3, h * 0.56);
      ctx.fillRect(w * 0.08, -h * 0.28, w * 0.3, h * 0.56);
    } else if (k.body === 'fish') {
      ctx.rotate(ang);
      if (Math.cos(ang) < 0) ctx.scale(1, -1);
      drawFish(r * 1.1, p.fish, t);
    } else if (k.body === 'coin') {
      ctx.scale(Math.abs(Math.cos(t * 7)) * 0.85 + 0.15, 1);
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r * 1.2);
      g.addColorStop(0, dk ? '#e8ffb0' : '#fff1a8');
      g.addColorStop(1, dk ? '#5a8a10' : '#e0a419');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.15, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = dk ? '#2a4a08' : '#b67f10';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = dk ? '#2a4a08' : '#c98f14';
      starPath(ctx, r * 0.45, r * 0.2, 5);
      ctx.fill();
    } else if (k.body === 'orb') {
      const sh = p.love ? 'heart' : k.shape;
      if (sh === 'bite') {
        ctx.rotate(ang);
        const m = 0.12 + 0.55 * Math.abs(Math.sin(t * 14));
        ctx.fillStyle = '#ffd84d';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r * 1.2, m, TAU - m);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fff';
        for (const s of [-1, 1])
          for (let i = 0; i < 2; i++) {
            const a = s * m,
              d = r * (0.5 + i * 0.35);
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * d, Math.sin(a) * d);
            ctx.lineTo(Math.cos(a) * (d + r * 0.2), Math.sin(a) * (d + r * 0.2));
            ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d - s * r * 0.18);
            ctx.fill();
          }
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(r * 0.1, -r * 0.6 * (Math.cos(ang) < 0 ? -1 : 1), r * 0.15, 0, TAU);
        ctx.fill();
      } else if (sh === 'skull') {
        ctx.rotate(Math.cos(ang) < 0 ? ang + Math.PI : ang);
        const j = r * 0.35 * Math.abs(Math.sin(t * 14));
        ctx.fillStyle = '#ece6d4';
        ctx.beginPath();
        ctx.arc(0, -r * 0.15, r, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        ctx.fillRect(-r * 0.65, -r * 0.2, r * 1.3, r * 0.6);
        ctx.fillRect(-r * 0.55, r * 0.35 + j, r * 1.1, r * 0.35);
        ctx.fillStyle = '#1a1024';
        ctx.beginPath();
        ctx.arc(-r * 0.38, -r * 0.15, r * 0.26, 0, TAU);
        ctx.arc(r * 0.38, -r * 0.15, r * 0.26, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ff3b6b';
        ctx.beginPath();
        ctx.arc(-r * 0.38, -r * 0.15, r * 0.09, 0, TAU);
        ctx.arc(r * 0.38, -r * 0.15, r * 0.09, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#1a1024';
        for (let i = 0; i < 4; i++)
          ctx.fillRect(-r * 0.45 + i * r * 0.3, r * 0.35 + j, 2, r * 0.25);
      } else if (sh === 'bat') {
        const f = Math.sin(t * 20);
        ctx.fillStyle = '#3a1f5c';
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(s * r * 0.5, 0);
          ctx.lineTo(s * r * 2.2, -r * 0.8 - f * r);
          ctx.lineTo(s * r * 1.6, r * 0.2);
          ctx.lineTo(s * r * 0.9, r * 0.5);
          ctx.closePath();
          ctx.fill();
        }
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.8, r * 0.7, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ff3b6b';
        ctx.beginPath();
        ctx.arc(-r * 0.25, -r * 0.1, r * 0.15, 0, TAU);
        ctx.arc(r * 0.25, -r * 0.1, r * 0.15, 0, TAU);
        ctx.fill();
      } else if (sh === 'spider') {
        const f = Math.sin(t * 25);
        ctx.strokeStyle = '#120a1c';
        ctx.lineWidth = 2;
        for (const s of [-1, 1])
          for (let i = 0; i < 4; i++) {
            const a = (i - 1.5) * 0.45;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(s * r * 1.3, -r * 0.4 + i * r * 0.35 + f * (i % 2 ? 2 : -2));
            ctx.lineTo(s * r * 1.8, r * 0.4 + i * r * 0.3);
            ctx.stroke();
          }
        ctx.fillStyle = '#1a0f26';
        ctx.beginPath();
        ctx.arc(0, r * 0.2, r, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -r * 0.7, r * 0.55, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ff3b3b';
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.8, r * 0.13, 0, TAU);
        ctx.arc(r * 0.2, -r * 0.8, r * 0.13, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#8a1d4a';
        ctx.beginPath();
        ctx.arc(0, r * 0.3, r * 0.3, 0, TAU);
        ctx.fill();
      } else if (sh === 'ghost') {
        ctx.fillStyle = dk ? '#b8ffb8' : '#eef3ff';
        ctx.beginPath();
        ctx.moveTo(-r, r);
        ctx.lineTo(-r, -r * 0.1);
        ctx.arc(0, -r * 0.1, r, Math.PI, 0);
        ctx.lineTo(r, r);
        for (let i = 0; i < 4; i++) {
          const x = r - (i * r) / 2;
          ctx.quadraticCurveTo(x - r / 8, r * (0.6 + 0.3 * Math.sin(t * 14 + i)), x - r / 4, r);
          ctx.quadraticCurveTo(
            x - (r * 3) / 8,
            r * (0.6 + 0.3 * Math.sin(t * 14 + i + 1)),
            x - r / 2,
            r
          );
        }
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.15, r * 0.16, 0, TAU);
        ctx.arc(r * 0.35, -r * 0.15, r * 0.16, 0, TAU);
        ctx.fill();
      } else if (sh === 'egg') {
        ctx.rotate(t * 6);
        ctx.fillStyle = dk ? '#2e2440' : '#fff6e2';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.9, r * 1.15, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = dk ? '#9dff6a' : '#e8cfa0';
        [
          [0.3, -0.4],
          [-0.3, 0.2],
          [0.2, 0.5],
        ].forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x * r, y * r, r * 0.12, 0, TAU);
          ctx.fill();
        });
      } else if (sh === 'cushion') {
        ctx.rotate(ang);
        ctx.scale(1 + 0.35 * p.sq, 1 - 0.35 * p.sq);
        ctx.fillStyle = dk ? '#5a2a6a' : '#ff9cc0';
        ctx.beginPath();
        ctx.moveTo(-r, -r * 0.8);
        ctx.quadraticCurveTo(0, -r * 0.5, r, -r * 0.8);
        ctx.quadraticCurveTo(r * 0.7, 0, r, r * 0.8);
        ctx.quadraticCurveTo(0, r * 0.5, -r, r * 0.8);
        ctx.quadraticCurveTo(-r * 0.7, 0, -r, -r * 0.8);
        ctx.fill();
        ctx.fillStyle = dk ? '#c39bff' : '#d9578c';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.14, 0, TAU);
        ctx.fill();
      } else if (sh === 'star') {
        ctx.rotate(t * 5);
        ctx.fillStyle = dk ? '#2a0f40' : '#fff07a';
        starPath(ctx, r * 1.3, r * 0.55, 5);
        ctx.fill();
        if (dk) {
          ctx.strokeStyle = '#c39bff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else if (sh === 'note') {
        ctx.rotate(Math.sin(t * 8) * 0.3);
        ctx.fillStyle = dk ? '#c34dff' : '#ff9de2';
        ctx.beginPath();
        ctx.ellipse(-r * 0.35, r * 0.45, r * 0.6, r * 0.45, -0.4, 0, TAU);
        ctx.fill();
        ctx.fillRect(r * 0.1, -r * 1.1, r * 0.22, r * 1.6);
        ctx.beginPath();
        ctx.moveTo(r * 0.32, -r * 1.1);
        ctx.quadraticCurveTo(r * 1.1, -r * 0.8, r * 0.8, -r * 0.1);
        ctx.quadraticCurveTo(r * 0.9, -r * 0.6, r * 0.32, -r * 0.6);
        ctx.fill();
      } else if (sh === 'bomb') {
        ctx.fillStyle = '#1a1420';
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.05, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.35, r * 0.25, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#8a6a3a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(r * 0.5, -r * 0.8);
        ctx.quadraticCurveTo(r * 0.9, -r * 1.4, r * 0.6, -r * 1.6);
        ctx.stroke();
      } else if (sh === 'potion') {
        ctx.rotate(t * 5);
        ctx.fillStyle = 'rgba(230,250,255,.85)';
        ctx.beginPath();
        ctx.arc(0, r * 0.25, r * 0.85, 0, TAU);
        ctx.fill();
        ctx.fillRect(-r * 0.25, -r * 1.05, r * 0.5, r * 0.7);
        ctx.fillStyle = dk ? '#8dff6a' : '#7cf27c';
        ctx.beginPath();
        ctx.arc(0, r * 0.3, r * 0.68, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#8a5a2b';
        ctx.fillRect(-r * 0.3, -r * 1.25, r * 0.6, r * 0.3);
      } else if (sh === 'rock') {
        ctx.rotate(t * 4);
        ctx.fillStyle = '#5a5560';
        ctx.beginPath();
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * TAU,
            q = r * (0.8 + 0.25 * Math.sin(i * 2.3));
          i
            ? ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q)
            : ctx.moveTo(Math.cos(a) * q, Math.sin(a) * q);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ff8a3d';
        ctx.beginPath();
        ctx.arc(r * 0.2, -r * 0.1, r * 0.2, 0, TAU);
        ctx.fill();
      } else if (sh === 'chick') {
        const f = Math.sin(t * 22);
        ctx.scale(Math.cos(ang) < 0 ? -1 : 1, 1);
        ctx.fillStyle = '#ffe14d';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ffd02a';
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, r * 0.1, r * 0.5, r * 0.3 * (1 + f * 0.5), -0.4, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ff8a2a';
        ctx.beginPath();
        ctx.moveTo(r * 0.8, -r * 0.1);
        ctx.lineTo(r * 1.35, 0);
        ctx.lineTo(r * 0.8, r * 0.15);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(r * 0.4, -r * 0.3, r * 0.13, 0, TAU);
        ctx.fill();
      } else if (sh === 'heart') {
        ctx.rotate(Math.sin(t * 8) * 0.3);
        ctx.fillStyle = '#ff6fae';
        heartPath(ctx, r * 2.6);
        ctx.fill();
      } else {
        const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r);
        if (dk) {
          g.addColorStop(0, '#1a0826');
          g.addColorStop(0.6, '#3a1060');
          g.addColorStop(1, col);
        } else {
          g.addColorStop(0, '#ffffff');
          g.addColorStop(0.45, col);
          g.addColorStop(1, hexA(col, 0.85));
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = dk ? '#8dff6a' : 'rgba(255,255,255,.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.6, t * 8, t * 8 + 2);
        ctx.stroke();
      }
    }
    if (c('bite') && k.body !== 'orb') {
      ctx.save();
      ctx.rotate(ang);
      const m = 0.5 * Math.abs(Math.sin(t * 14));
      ctx.strokeStyle = dk ? '#ece6d4' : '#ffd84d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(r * 0.9, 0, r * 0.7, -1.2 - m, -0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(r * 0.9, 0, r * 0.7, 0.2, 1.2 + m);
      ctx.stroke();
      ctx.restore();
    }
    if (c('bubble')) {
      ctx.strokeStyle = dk ? 'rgba(140,255,100,.85)' : 'rgba(200,250,255,.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.6, 0, TAU);
      ctx.stroke();
    }
    if (c('magnet')) {
      ctx.strokeStyle = '#ff6464';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.3, -1, 1);
      ctx.stroke();
      ctx.strokeStyle = '#6f9bff';
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.3, 2.1, 4.2);
      ctx.stroke();
    }
    if (c('hourglass')) {
      ctx.strokeStyle = dk ? 'rgba(255,107,107,.8)' : 'rgba(232,192,122,.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.45, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(dk ? -t * 4 : t * 2) * r * 1.2, Math.sin(dk ? -t * 4 : t * 2) * r * 1.2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/* ---------- drawing: misc ---------- */
function drawPlant(pl) {
  const g = easeBack(pl.g),
    R = seeded(pl.seed),
    sway = Math.sin(G.time * 1.5 + pl.x * 0.01) * 0.05;
  ctx.save();
  ctx.translate(pl.x, GROUND + 2);
  ctx.rotate(sway);
  ctx.scale(pl.h * g, pl.h * g);
  if (pl.type === 'flower') {
    ctx.strokeStyle = '#3f9a46';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -16);
    ctx.stroke();
    ctx.fillStyle = pl.c;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 4, -18 + Math.sin(a) * 4, 3.2, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = '#ffd84d';
    ctx.beginPath();
    ctx.arc(0, -18, 2.4, 0, TAU);
    ctx.fill();
  } else if (pl.type === 'tree' || pl.type === 'money') {
    ctx.fillStyle = '#6b4220';
    ctx.fillRect(-6, -70, 12, 70);
    const cc = pl.type === 'money' ? '#3fae55' : pl.c;
    ctx.fillStyle = cc;
    [
      [0, -96, 34],
      [-24, -78, 24],
      [24, -80, 26],
      [0, -70, 22],
    ].forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    });
    ctx.fillStyle = 'rgba(255,255,255,.15)';
    ctx.beginPath();
    ctx.arc(-8, -108, 12, 0, TAU);
    ctx.fill();
    if (pl.type === 'money') {
      ctx.fillStyle = '#ffc93c';
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(R() * 60 - 30, -70 - R() * 45, 5, 0, TAU);
        ctx.fill();
      }
    }
  } else {
    ctx.fillStyle = '#5a3a1c';
    ctx.fillRect(-5, -20, 10, 20);
    ctx.fillStyle = '#1f7a45';
    for (let i = 0; i < 3; i++) {
      const y = -18 - i * 30,
        w = 40 - i * 9;
      ctx.beginPath();
      ctx.moveTo(-w, y);
      ctx.lineTo(0, y - 44);
      ctx.lineTo(w, y);
      ctx.closePath();
      ctx.fill();
    }
    if (pl.type === 'xmas') {
      ctx.strokeStyle = '#ffd84d';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-30 + i * 8, -24 - i * 30);
        ctx.quadraticCurveTo(0, -14 - i * 30, 30 - i * 8, -34 - i * 30);
        ctx.stroke();
      }
      const cols = ['#ff4d4d', '#62f0dd', '#ffd84d', '#ff6fae', '#ffffff'];
      for (let i = 0; i < 12; i++) {
        const on = Math.sin(G.time * 4 + i * 1.7) > 0;
        ctx.fillStyle = on ? cols[i % 5] : '#333';
        ctx.beginPath();
        ctx.arc(R() * 56 - 28, -26 - R() * 80, 3.5, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = '#fff07a';
      ctx.save();
      ctx.translate(0, -112);
      ctx.rotate(G.time);
      starPath(ctx, 11, 5, 5);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      ctx.beginPath();
      ctx.moveTo(0, -62);
      ctx.lineTo(-12, -48);
      ctx.lineTo(0, -50);
      ctx.fill();
    }
  }
  ctx.restore();
}
const FRONTZ = new Set(['thorns', 'tornado', 'cloud', 'bomb', 'pfx']);
function drawZone(z) {
  const f = Math.min(1, z.l / 0.5, (z.ml - z.l) / 0.3);
  ctx.save();
  ctx.translate(z.x, z.y);
  ctx.globalAlpha = Math.max(0, f);
  if (z.t === 'slow') {
    ctx.fillStyle = 'rgba(232,192,122,.13)';
    ctx.strokeStyle = 'rgba(246,214,150,.8)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, z.r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * z.r * 0.82, Math.sin(a) * z.r * 0.82);
      ctx.lineTo(Math.cos(a) * z.r * 0.92, Math.sin(a) * z.r * 0.92);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(G.time * 0.8) * z.r * 0.7, Math.sin(G.time * 0.8) * z.r * 0.7);
    ctx.stroke();
  } else if (z.t === 'hole') {
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, z.r * 0.5);
    g.addColorStop(0, '#000');
    g.addColorStop(0.45, 'rgba(40,10,80,.9)');
    g.addColorStop(1, 'rgba(120,60,220,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, z.r * 0.5, 0, TAU);
    ctx.fill();
    ctx.rotate(G.time * 6);
    ctx.strokeStyle = 'rgba(199,168,255,.8)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(TAU / 4);
      ctx.beginPath();
      ctx.arc(0, 0, 30 + i * 10, 0, 1.6);
      ctx.stroke();
    }
  } else if (z.t === 'poison') {
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, z.r);
    g.addColorStop(0, 'rgba(140,255,90,.35)');
    g.addColorStop(1, 'rgba(80,200,60,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, z.r, 0, TAU);
    ctx.fill();
  } else if (z.t === 'scorch') {
    ctx.globalAlpha = Math.min(1, z.l / 1.5);
    ctx.fillStyle = 'rgba(20,12,10,.7)';
    ctx.beginPath();
    ctx.ellipse(0, 4, z.r, 10, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = z.dk ? '#c27bff' : '#ff9a2a';
    for (let i = 0; i < 6; i++) {
      const ex = Math.sin(i * 2.1) * z.r * 0.7;
      ctx.globalAlpha = Math.min(1, z.l / 1.5) * (0.5 + 0.5 * Math.sin(G.time * 8 + i));
      ctx.fillRect(ex, 0, 4, 4);
    }
  } else if (z.t === 'bomb') {
    ctx.globalAlpha = 1;
    const bl = z.l < 0.5 && Math.floor(z.l * 10) % 2,
      r = z.lv >= 3 ? 24 : z.mini ? 9 : 15;
    ctx.fillStyle = bl ? '#ff3b3b' : '#1a1420';
    ctx.beginPath();
    ctx.arc(0, -r, r, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 1.35, r * 0.25, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#8a6a3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(r * 0.4, -r * 1.8);
    ctx.quadraticCurveTo(r * 0.8, -r * 2.4, r * 0.5, -r * 2.5);
    ctx.stroke();
  } else if (z.t === 'cloud') {
    const w2 = z.r;
    ctx.fillStyle = z.storm ? '#4a4f66' : z.snow ? '#eef6ff' : '#d8e4f4';
    [
      [0, -10, w2 * 0.45],
      [-w2 * 0.45, 8, w2 * 0.32],
      [w2 * 0.45, 6, w2 * 0.34],
      [-w2 * 0.15, 14, w2 * 0.36],
      [w2 * 0.2, 16, w2 * 0.34],
    ].forEach(([cx, cy, r]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(r, 95), 0, TAU);
      ctx.fill();
    });
    ctx.fillStyle = z.storm ? '#33374a' : '#b9c8dc';
    ctx.fillRect(-w2 * 0.7, 22, w2 * 1.4, 12);
  } else if (z.t === 'tornado') {
    for (let i = 0; i < 9; i++) {
      const yy = -i * 22,
        rw = z.r * (0.3 + i * 0.12),
        off = Math.sin(G.time * 8 + i * 0.7) * 12;
      ctx.strokeStyle = z.fire
        ? i % 2
          ? 'rgba(255,140,40,.85)'
          : 'rgba(255,220,120,.75)'
        : i % 2
          ? 'rgba(200,235,230,.7)'
          : 'rgba(150,200,195,.7)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(off, yy, rw, rw * 0.25, 0, 0, TAU);
      ctx.stroke();
    }
  } else if (z.t === 'web') {
    ctx.strokeStyle = 'rgba(255,255,255,.8)';
    ctx.lineWidth = 1.5;
    ctx.scale(1, 0.25);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * z.r, Math.sin(a) * z.r);
      ctx.stroke();
    }
    for (let j = 1; j <= 3; j++) {
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) {
        const a = (i / 8) * TAU,
          rr = (z.r * j) / 3.3;
        i
          ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
          : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.stroke();
    }
  } else if (z.t === 'pfx') {
    ctx.rotate(G.time * 6);
    ctx.strokeStyle = '#c27bff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, z.r * (1.2 - (z.l / z.ml) * 0.4), z.r * 0.45, 0, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = '#62f0dd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, z.r * 0.7, z.r * 0.25, 0, 0, TAU);
    ctx.stroke();
  } else if (z.t === 'fire') {
    for (let i = 0; i < 7; i++) {
      const fx = -z.r + (i * z.r) / 3,
        h = 18 + 10 * Math.sin(G.time * 12 + i * 2);
      ctx.fillStyle = i % 2 ? '#ff9a2a' : '#ffd36b';
      ctx.beginPath();
      ctx.moveTo(fx - 10, 0);
      ctx.quadraticCurveTo(fx, -h * 2, fx + 10, 0);
      ctx.fill();
    }
  } else if (z.t === 'ice') {
    ctx.fillStyle = 'rgba(190,240,255,.55)';
    ctx.beginPath();
    ctx.ellipse(0, 2, z.r, 10, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-z.r * 0.6, 0);
    ctx.lineTo(-z.r * 0.2, 4);
    ctx.moveTo(z.r * 0.1, -2);
    ctx.lineTo(z.r * 0.5, 3);
    ctx.stroke();
  } else if (z.t === 'blizzard') {
    const g = ctx.createRadialGradient(0, 0, 10, 0, 0, z.r);
    g.addColorStop(0, 'rgba(230,248,255,.35)');
    g.addColorStop(1, 'rgba(200,235,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, z.r, z.r * 0.6, 0, 0, TAU);
    ctx.fill();
  } else if (z.t === 'pull') {
    ctx.rotate(-G.time * 8);
    ctx.strokeStyle = 'rgba(255,120,120,.7)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, z.r * (0.3 + i * 0.25) * (1 - ((G.time * 2) % 1) * 0.3), i, i + 1.5);
      ctx.stroke();
    }
  } else if (z.t === 'thorns') {
    const R = seeded(z.seed),
      gr = Math.min(1, (z.ml - z.l) * 3);
    ctx.strokeStyle = '#3a5a1a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const x0 = -z.r + R() * z.r * 2,
        h = (30 + R() * 40) * gr;
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      ctx.quadraticCurveTo(x0 + rnd(-1, 1) + (R() - 0.5) * 40, -h * 0.6, x0 + (R() - 0.5) * 30, -h);
      ctx.stroke();
    }
    ctx.fillStyle = '#c34dff';
    const R2 = seeded(z.seed + 1);
    for (let i = 0; i < 22; i++) {
      const x = -z.r + R2() * z.r * 2,
        y = -R2() * 60 * gr;
      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x + 3, y);
      ctx.lineTo(x - 3, y);
      ctx.fill();
    }
  }
  ctx.restore();
}
const LIGHT = new Set(['spark', 'fire', 'star', 'fly']);
function drawPart(p, m) {
  const f = p.l / p.ml;
  ctx.globalAlpha = Math.min(1, f * 1.5);
  switch (p.t) {
    case 'spark':
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s * f + 0.5, 0, TAU);
      ctx.fill();
      break;
    case 'fire': {
      const P =
        p.c === 'blue'
          ? ['#e8fbff', '#7fc8ff', '#3a6cff']
          : p.c === 'purple'
            ? ['#f3d2ff', '#b04dff', '#5a1a9a']
            : ['#fff3a0', '#ff9a2a', '#e0402a'];
      ctx.fillStyle = f > 0.6 ? P[0] : f > 0.3 ? P[1] : P[2];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s * (0.4 + f * 0.6), 0, TAU);
      ctx.fill();
      break;
    }
    case 'star':
      ctx.fillStyle = p.c;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      starPath(ctx, p.s * f + 1, p.s * f * 0.35 + 0.4, 4);
      ctx.fill();
      ctx.setTransform(m);
      break;
    case 'fly':
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(G.time * 3 + p.x));
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.4, 0, TAU);
      ctx.fill();
      ctx.globalAlpha *= 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, TAU);
      ctx.fill();
      break;
    case 'smoke':
      ctx.globalAlpha = f * 0.9;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s * (1.6 - f * 0.6), 0, TAU);
      ctx.fill();
      break;
    case 'snow':
      ctx.strokeStyle = p.c;
      ctx.lineWidth = 1.5;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI) / 3,
          cx = Math.cos(a) * p.s,
          sy = Math.sin(a) * p.s;
        ctx.moveTo(-cx, -sy);
        ctx.lineTo(cx, sy);
      }
      ctx.stroke();
      ctx.setTransform(m);
      break;
    case 'heart':
      ctx.fillStyle = p.c;
      ctx.translate(p.x, p.y);
      heartPath(ctx, p.s * 1.6);
      ctx.fill();
      ctx.setTransform(m);
      break;
    case 'chunk':
      ctx.fillStyle = p.c;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.setTransform(m);
      break;
    case 'leaf':
      ctx.fillStyle = p.c;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.s, p.s * 0.5, 0, 0, TAU);
      ctx.fill();
      ctx.setTransform(m);
      break;
    case 'straw':
      ctx.strokeStyle = p.c;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const sc = (Math.cos(p.rot) * p.s) / 2,
        ss = (Math.sin(p.rot) * p.s) / 2;
      ctx.moveTo(p.x - sc, p.y - ss);
      ctx.lineTo(p.x + sc, p.y + ss);
      ctx.stroke();
      break;
    case 'ring':
      ctx.strokeStyle = p.c;
      ctx.lineWidth = 6 * f;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.s * (1.2 - f), p.s * (1.2 - f) * 0.3, 0, 0, TAU);
      ctx.stroke();
      break;
    case 'seed':
    case 'drop':
    case 'dot':
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s, 0, TAU);
      ctx.fill();
      break;
    case 'streak':
      ctx.strokeStyle = p.c;
      ctx.lineWidth = p.s * 0.5 * f;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - Math.cos(p.a) * p.s * 4, p.y - Math.sin(p.a) * p.s * 4);
      ctx.stroke();
      break;
    case 'zz':
      ctx.globalAlpha = f;
      outlined(
        p.ch || 'z',
        p.x,
        p.y,
        p.c,
        '900 ' + ((p.s * (1.4 - f * 0.6)) | 0) + 'px Nunito, sans-serif',
        'center',
        3
      );
      break;
    case 'sring':
      ctx.strokeStyle = p.c;
      ctx.lineWidth = 4 * f;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s * (1 - f) + 6, 0, TAU);
      ctx.stroke();
      break;
  }
}
function drawParticles() {
  const m = ctx.getTransform();
  ctx.lineCap = 'round';
  for (const p of G.parts) if (!LIGHT.has(p.t)) drawPart(p, m);
  ctx.globalCompositeOperation = 'lighter';
  for (const p of G.parts) if (LIGHT.has(p.t)) drawPart(p, m);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}
function outlined(s, x, y, col, font, align = 'left', lw = 5) {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.lineWidth = lw;
  ctx.strokeStyle = 'rgba(10,6,30,.8)';
  ctx.strokeText(s, x, y);
  ctx.fillStyle = col;
  ctx.fillText(s, x, y);
}
function drawHUD() {
  if (G.mode === 'arena') {
    for (let i = 0; i < G.maxHearts; i++) {
      ctx.save();
      ctx.translate(46 + i * 40, 46);
      ctx.fillStyle = i < G.hearts ? '#ff5f8f' : 'rgba(255,255,255,.15)';
      heartPath(ctx, 44);
      ctx.fill();
      if (i < G.hearts) {
        ctx.fillStyle = 'rgba(255,255,255,.45)';
        ctx.beginPath();
        ctx.arc(-6, -6, 3.5, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    const lines = [
      G.wave ? 'Vague ' + G.wave + (G.waveActive ? ' en cours' : '') : 'Entraînement libre',
      'Monstres vaincus : ' + G.score,
      'Objets cassés : ' + G.broken,
    ];
    lines.forEach((s, i) =>
      outlined(s, 26, 100 + i * 30, i ? '#e8dcff' : '#f6c453', '800 24px Nunito, sans-serif')
    );
    if (WZ[0].haste > 0)
      outlined(
        'Plus vite ! ' + WZ[0].haste.toFixed(1) + ' s',
        26,
        190,
        '#ff8a8a',
        '800 22px Nunito, sans-serif'
      );
    ctx.save();
    ctx.translate(W - 84, 84);
    ctx.fillStyle = 'rgba(10,6,30,.5)';
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, TAU);
    ctx.fill();
    drawCircle(
      ctx,
      58 / (1 + 0.12 * Math.max(0, WZ[0].saw)),
      WZ[0].layers,
      WZ[0].saw,
      G.time,
      1,
      false,
      WZ[0].dark
    );
    ctx.restore();
  } else {
    WZ.forEach((w, i) => {
      const e = w.ent;
      if (!e) return;
      const L = i === 0,
        bw = 440,
        bx = L ? 30 : W - 30 - bw,
        ratio = Math.max(0, e.hp / e.max);
      outlined(
        w.name + (w.dark ? ' · mage noir' : ''),
        L ? 30 : W - 30,
        44,
        w.dark ? '#d9a6ff' : '#fff',
        '900 28px Nunito, sans-serif',
        L ? 'left' : 'right'
      );
      ctx.fillStyle = 'rgba(10,6,30,.7)';
      rrect(ctx, bx, 58, bw, 24, 12);
      ctx.fill();
      const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      g.addColorStop(0, w.dark ? '#5a1a9a' : shade(w.robe, -0.2));
      g.addColorStop(1, w.dark ? '#b04dff' : shade(w.robe, 0.25));
      ctx.fillStyle = g;
      const fw = bw * ratio;
      if (fw > 2) {
        rrect(ctx, L ? bx : bx + bw - fw, 58, fw, 24, 12);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255,255,255,.5)';
      ctx.lineWidth = 2;
      rrect(ctx, bx, 58, bw, 24, 12);
      ctx.stroke();
      outlined(
        Math.ceil(e.hp) + ' / ' + e.max,
        L ? bx + 12 : bx + bw - 12,
        77,
        '#fff',
        '800 17px Nunito, sans-serif',
        L ? 'left' : 'right',
        3
      );
      ctx.save();
      ctx.translate(L ? 84 : W - 84, 150);
      ctx.fillStyle = 'rgba(10,6,30,.5)';
      ctx.beginPath();
      ctx.arc(0, 0, 52, 0, TAU);
      ctx.fill();
      drawCircle(
        ctx,
        44 / (1 + 0.12 * Math.max(0, w.saw)),
        w.layers,
        w.saw,
        G.time,
        1,
        false,
        w.dark
      );
      ctx.restore();
      if (w.haste > 0)
        outlined(
          'Plus vite !',
          L ? 150 : W - 150,
          160,
          '#ff8a8a',
          '800 20px Nunito, sans-serif',
          L ? 'left' : 'right'
        );
    });
    outlined('DUEL', W / 2, 60, '#f6c453', '900 44px "Cinzel Decorative", serif', 'center', 7);
    outlined(
      DUEL_MAPS[G.duelMap % DUEL_MAPS.length].n + (G.budget ? ' · magie ' + G.budget : ''),
      W / 2,
      92,
      '#e8dcff',
      '800 20px Nunito, sans-serif',
      'center',
      4
    );
    if (G.duel.state === 'idle')
      outlined(
        'Préparez vos cercles, puis appuyez sur « Lancer le duel »',
        W / 2,
        H / 2 - 150,
        '#fff',
        '800 30px Nunito, sans-serif',
        'center',
        6
      );
  }
}
function render() {
  const sk = G.shake;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (sk > 0) ctx.translate(rnd(-sk, sk) * 0.6, rnd(-sk, sk) * 0.6);
  for (const s of TW) {
    ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(G.time * s.v + s.p));
    ctx.fillStyle = '#fff';
    ctx.fillRect(s.x, s.y, s.s, s.s);
  }
  ctx.globalAlpha = 1;
  for (const z of G.zones) if (!FRONTZ.has(z.t)) drawZone(z);
  for (const pl of G.plants) drawPlant(pl);
  const active = G.mode === 'duel' ? WZ : [WZ[0]];
  for (const w of active) {
    ctx.save();
    ctx.translate(w.x, GROUND + 4);
    ctx.scale(1, 0.22);
    drawCircle(
      ctx,
      72,
      w.layers,
      w.saw,
      G.time,
      G.cast.some(c => c.w === w) ? 0.9 : 0.4,
      false,
      w.dark
    );
    ctx.restore();
  }
  for (const q of G.props) drawProp(q);
  for (const c of G.pickups) {
    if (c.l < 2 && Math.floor(c.l * 8) % 2) continue;
    if (c.chest) {
      ctx.save();
      ctx.translate(c.x, c.y + 10);
      ctx.fillStyle = '#8a5a2b';
      rrect(ctx, -36, -40, 72, 40, 6);
      ctx.fill();
      ctx.fillStyle = '#6b4220';
      rrect(ctx, -38, -58, 76, 22, 10);
      ctx.fill();
      ctx.fillStyle = '#ffc93c';
      ctx.fillRect(-38, -40, 76, 5);
      ctx.fillRect(-5, -50, 10, 20);
      ctx.shadowColor = '#ffd76e';
      ctx.shadowBlur = Q().glow ? 20 : 0;
      ctx.fillRect(-36, -38, 72, 2);
      ctx.restore();
      if (Math.random() < 0.3)
        part('star', c.x + rnd(-40, 40), c.y - 30, 0, -30, 0.5, 6, '#fff2a8');
      continue;
    }
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(Math.abs(Math.cos(c.t * 4)) * 0.8 + 0.2, 1);
    ctx.fillStyle = c.cursed ? '#9dff3c' : '#ffc93c';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = c.cursed ? '#2a4a08' : '#b67f10';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = c.cursed ? '#2a0f40' : '#fff3b0';
    ctx.fillRect(-1.5, -5, 3, 10);
    ctx.restore();
    if (c.cursed && c.ground && Math.random() < 0.3)
      part('spark', c.x, c.y - 8, rnd(-30, 30), rnd(-60, -20), 0.3, 3, '#b8ff3c');
  }
  for (const e of G.enemies) drawEnemy(e);
  if (G.mode === 'arena') drawWizard(WZ[0], GROUND, null);
  for (const z of G.zones) if (FRONTZ.has(z.t)) drawZone(z);
  for (const p of G.projs) drawProj(p);
  drawParticles();
  for (const b of G.bolts)
    if (b.sky) {
      const a = Math.min(1, (b.l / b.ml) * 1.6) * (Math.random() < 0.25 ? 0.55 : 1);
      ctx.globalAlpha = a;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const path = pts => {
        ctx.beginPath();
        pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
      };
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = b.dk ? 'rgba(170,90,255,.35)' : 'rgba(140,170,255,.35)';
      ctx.lineWidth = 34;
      path(b.pts);
      ctx.stroke();
      ctx.strokeStyle = b.dk ? '#c27bff' : '#fff07a';
      ctx.lineWidth = 12;
      path(b.pts);
      ctx.stroke();
      ctx.lineWidth = 4;
      for (const p of b.br) {
        path(p);
        ctx.stroke();
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      path(b.pts);
      ctx.stroke();
      ctx.lineWidth = 1.5;
      for (const p of b.br) {
        path(p);
        ctx.stroke();
      }
      const e = b.pts[b.pts.length - 1],
        gr = ctx.createRadialGradient(e[0], e[1], 0, e[0], e[1], 120);
      gr.addColorStop(0, 'rgba(255,255,230,.9)');
      gr.addColorStop(1, 'rgba(255,255,200,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(e[0], e[1], 120, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  for (const b of G.bolts)
    if (!b.sky) {
      ctx.strokeStyle = b.dk ? '#e6c8ff' : '#fffbd0';
      ctx.shadowColor = b.dk ? '#b04dff' : '#fff59a';
      ctx.shadowBlur = Q().glow ? 14 : 0;
      ctx.lineWidth = 3;
      ctx.globalAlpha = Math.min(1, b.l * 5);
      ctx.beginPath();
      b.pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
      ctx.stroke();
      ctx.shadowBlur = Q().glow ? 0 : 0;
      ctx.globalAlpha = 1;
    }
  for (const c of G.cast) {
    const sc = easeBack(c.t / 0.15),
      al = 1 - Math.max(0, (c.t - 0.2) / 0.3);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.a);
    ctx.scale(0.38, 1);
    drawCircle(ctx, 42 * sc, c.w.layers, c.w.saw, G.time * 3, al, true, c.w.dark);
    ctx.restore();
  }
  for (const t of G.texts) {
    ctx.globalAlpha = Math.min(1, t.l * 2);
    outlined(t.s, t.x, t.y, t.c, `900 ${t.size}px Nunito, sans-serif`, 'center');
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  if (G.storm > 0) {
    ctx.fillStyle = `rgba(10,8,30,${0.35 * Math.min(1, G.storm)})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (G.timeStop > 0) {
    ctx.fillStyle = `rgba(255,215,150,${0.22 * Math.min(1, G.timeStop)})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (G.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.85, G.flash)})`;
    ctx.fillRect(0, 0, W, H);
  }
  drawHUD();
  if (G.banner) {
    const b = G.banner,
      a = Math.min(1, b.l * 1.5, (3 - b.l) * 4);
    ctx.globalAlpha = Math.max(0, a);
    outlined(b.t, W / 2, 230, '#f6c453', '900 54px "Cinzel Decorative", serif', 'center', 8);
    outlined(b.sub, W / 2, 278, '#fff', '800 30px Nunito, sans-serif', 'center', 6);
    ctx.globalAlpha = 1;
  }
}
