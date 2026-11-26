/* Scribble Wizards — magic-circle.js
   Drawing of every symbol and of the magic circle (with sprite cache for performance). */
/* ---------- symbol drawings ---------- */
function drawSym(c, k, s, col) {
  c.save();
  c.strokeStyle = col;
  c.fillStyle = col;
  c.lineWidth = Math.max(1.3, s * 0.085);
  c.lineCap = 'round';
  c.lineJoin = 'round';
  const L = (pts, close) => {
    c.beginPath();
    pts.forEach((p, i) => (i ? c.lineTo(p[0] * s, p[1] * s) : c.moveTo(p[0] * s, p[1] * s)));
    if (close) c.closePath();
    c.stroke();
  };
  const C = (x, y, r, f) => {
    c.beginPath();
    c.arc(x * s, y * s, r * s, 0, TAU);
    f ? c.fill() : c.stroke();
  };
  switch (k) {
    case 'heart':
      heartPath(c, s);
      c.stroke();
      break;
    case 'square':
      c.strokeRect(-0.32 * s, -0.32 * s, 0.64 * s, 0.64 * s);
      break;
    case 'triangle':
      L(
        [
          [0, -0.38],
          [0.38, 0.3],
          [-0.38, 0.3],
        ],
        1
      );
      break;
    case 'saw':
      C(0, 0, 0.18);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU,
          b = a + TAU / 8;
        L([
          [Math.cos(a) * 0.26, Math.sin(a) * 0.26],
          [Math.cos(a + 0.2) * 0.45, Math.sin(a + 0.2) * 0.45],
          [Math.cos(b) * 0.26, Math.sin(b) * 0.26],
        ]);
      }
      break;
    case 'mountain':
      L(
        [
          [-0.44, 0.3],
          [-0.16, -0.2],
          [0.02, 0.06],
          [0.2, -0.36],
          [0.44, 0.3],
        ],
        1
      );
      L([
        [0.11, -0.2],
        [0.2, -0.12],
        [0.28, -0.22],
      ]);
      break;
    case 'gravity':
      L([
        [-0.42, -0.32],
        [-0.42, 0.32],
      ]);
      L([
        [-0.28, -0.32],
        [-0.28, 0.32],
      ]);
      L([
        [0.28, -0.32],
        [0.28, 0.32],
      ]);
      L([
        [0.42, -0.32],
        [0.42, 0.32],
      ]);
      C(0, 0, 0.08, 1);
      break;
    case 'flame':
      c.beginPath();
      c.moveTo(0, -0.42 * s);
      c.bezierCurveTo(0.32 * s, -0.12 * s, 0.36 * s, 0.12 * s, 0.24 * s, 0.26 * s);
      c.quadraticCurveTo(0, 0.46 * s, -0.24 * s, 0.26 * s);
      c.bezierCurveTo(-0.36 * s, 0.08 * s, -0.2 * s, -0.06 * s, -0.1 * s, -0.16 * s);
      c.quadraticCurveTo(-0.04 * s, -0.02 * s, 0, -0.42 * s);
      c.stroke();
      c.beginPath();
      c.moveTo(0, 0.02 * s);
      c.quadraticCurveTo(0.15 * s, 0.15 * s, 0.04 * s, 0.3 * s);
      c.quadraticCurveTo(-0.13 * s, 0.2 * s, 0, 0.02 * s);
      c.stroke();
      break;
    case 'snow':
      for (let i = 0; i < 3; i++) {
        c.save();
        c.rotate((i * Math.PI) / 3);
        L([
          [0, -0.4],
          [0, 0.4],
        ]);
        L([
          [-0.1, -0.3],
          [0, -0.2],
          [0.1, -0.3],
        ]);
        L([
          [-0.1, 0.3],
          [0, 0.2],
          [0.1, 0.3],
        ]);
        c.restore();
      }
      break;
    case 'bite':
      c.beginPath();
      c.arc(0, 0, 0.36 * s, 0.65, TAU - 0.65);
      c.lineTo(0.02 * s, 0);
      c.closePath();
      c.stroke();
      L([
        [0.13, -0.1],
        [0.17, -0.02],
        [0.22, -0.16],
      ]);
      L([
        [0.13, 0.1],
        [0.17, 0.02],
        [0.22, 0.16],
      ]);
      C(-0.02, -0.17, 0.045, 1);
      break;
    case 'ghost':
      c.beginPath();
      c.moveTo(-0.3 * s, 0.34 * s);
      c.lineTo(-0.3 * s, -0.04 * s);
      c.arc(0, -0.04 * s, 0.3 * s, Math.PI, 0);
      c.lineTo(0.3 * s, 0.34 * s);
      for (let i = 0; i < 3; i++) {
        const x = 0.3 - i * 0.2;
        c.quadraticCurveTo((x - 0.05) * s, 0.2 * s, (x - 0.1) * s, 0.34 * s);
        c.quadraticCurveTo((x - 0.15) * s, 0.2 * s, (x - 0.2) * s, 0.34 * s);
      }
      c.stroke();
      C(-0.1, -0.06, 0.05, 1);
      C(0.1, -0.06, 0.05, 1);
      break;
    case 'zigzag':
      L([
        [-0.44, 0.12],
        [-0.26, -0.2],
        [-0.08, 0.2],
        [0.1, -0.2],
        [0.24, 0.06],
      ]);
      C(0.32, 0.0, 0.1);
      break;
    case 'dots':
      [
        [0, 0],
        [-0.22, -0.14],
        [0.22, -0.14],
        [-0.18, 0.2],
        [0.18, 0.2],
        [0, -0.32],
        [0, 0.32],
      ].forEach(p => C(p[0], p[1], 0.07, 1));
      break;
    case 'arrow':
      L([
        [-0.4, 0],
        [0.36, 0],
      ]);
      L([
        [0.14, -0.2],
        [0.38, 0],
        [0.14, 0.2],
      ]);
      L([
        [-0.4, 0],
        [-0.5, -0.14],
      ]);
      L([
        [-0.4, 0],
        [-0.5, 0.14],
      ]);
      break;
    case 'fish':
      c.beginPath();
      c.ellipse(-0.06 * s, 0, 0.28 * s, 0.18 * s, 0, 0, TAU);
      c.stroke();
      L(
        [
          [0.2, 0],
          [0.42, -0.18],
          [0.42, 0.18],
        ],
        1
      );
      C(-0.2, -0.04, 0.035, 1);
      break;
    case 'egg':
      c.beginPath();
      c.moveTo(0, -0.38 * s);
      c.bezierCurveTo(0.3 * s, -0.36 * s, 0.32 * s, 0.36 * s, 0, 0.36 * s);
      c.bezierCurveTo(-0.32 * s, 0.36 * s, -0.3 * s, -0.36 * s, 0, -0.38 * s);
      c.stroke();
      break;
    case 'cushion':
      c.beginPath();
      c.moveTo(-0.36 * s, -0.3 * s);
      c.quadraticCurveTo(0, -0.18 * s, 0.36 * s, -0.3 * s);
      c.quadraticCurveTo(0.24 * s, 0, 0.36 * s, 0.3 * s);
      c.quadraticCurveTo(0, 0.18 * s, -0.36 * s, 0.3 * s);
      c.quadraticCurveTo(-0.24 * s, 0, -0.36 * s, -0.3 * s);
      c.stroke();
      C(0, 0, 0.05, 1);
      break;
    case 'tree':
      L([
        [0, 0.4],
        [0, 0.06],
      ]);
      C(0, -0.14, 0.23);
      L([
        [0, 0.2],
        [0.12, 0.08],
      ]);
      break;
    case 'coin':
      C(0, 0, 0.36);
      C(0, 0, 0.25);
      L([
        [0, -0.13],
        [0, 0.13],
      ]);
      break;
    case 'wall':
      c.strokeRect(-0.38 * s, -0.3 * s, 0.76 * s, 0.6 * s);
      L([
        [-0.38, -0.1],
        [0.38, -0.1],
      ]);
      L([
        [-0.38, 0.1],
        [0.38, 0.1],
      ]);
      L([
        [0, -0.3],
        [0, -0.1],
      ]);
      L([
        [-0.2, -0.1],
        [-0.2, 0.1],
      ]);
      L([
        [0.2, -0.1],
        [0.2, 0.1],
      ]);
      L([
        [0, 0.1],
        [0, 0.3],
      ]);
      break;
    case 'star':
      c.save();
      c.scale(s, s);
      c.lineWidth /= s;
      starPath(c, 0.42, 0.18, 5);
      c.stroke();
      c.restore();
      break;
    case 'bolt':
      L(
        [
          [0.1, -0.42],
          [-0.2, 0.04],
          [0.02, 0.04],
          [-0.1, 0.42],
          [0.24, -0.08],
          [0.02, -0.08],
        ],
        1
      );
      break;
    case 'magnet':
      c.beginPath();
      c.moveTo(-0.26 * s, -0.34 * s);
      c.lineTo(-0.26 * s, 0);
      c.arc(0, 0, 0.26 * s, Math.PI, 0, true);
      c.lineTo(0.26 * s, -0.34 * s);
      c.stroke();
      L([
        [-0.38, -0.2],
        [-0.14, -0.2],
      ]);
      L([
        [0.14, -0.2],
        [0.38, -0.2],
      ]);
      break;
    case 'bubble':
      C(0, 0, 0.34);
      c.beginPath();
      c.arc(0, 0, 0.22 * s, 3.5, 4.6);
      c.stroke();
      break;
    case 'hourglass':
      L(
        [
          [-0.26, -0.36],
          [0.26, -0.36],
          [-0.26, 0.36],
          [0.26, 0.36],
        ],
        1
      );
      C(0, 0.24, 0.06, 1);
      break;
    case 'bomb':
      C(0, 0.08, 0.27);
      L([
        [0.16, -0.14],
        [0.27, -0.3],
      ]);
      L([
        [0.3, -0.42],
        [0.3, -0.34],
      ]);
      L([
        [0.38, -0.34],
        [0.32, -0.32],
      ]);
      break;
    case 'portal':
      c.beginPath();
      c.ellipse(0, 0, 0.38 * s, 0.3 * s, 0, 0, TAU);
      c.stroke();
      c.beginPath();
      c.arc(0, 0, 0.18 * s, 0, 4.2);
      c.stroke();
      c.beginPath();
      c.arc(0.02 * s, 0, 0.07 * s, 0, TAU);
      c.fill();
      break;
    case 'shield':
      c.beginPath();
      c.moveTo(0, -0.38 * s);
      c.quadraticCurveTo(0.22 * s, -0.3 * s, 0.33 * s, -0.3 * s);
      c.lineTo(0.31 * s, 0.02 * s);
      c.quadraticCurveTo(0.26 * s, 0.28 * s, 0, 0.4 * s);
      c.quadraticCurveTo(-0.26 * s, 0.28 * s, -0.31 * s, 0.02 * s);
      c.lineTo(-0.33 * s, -0.3 * s);
      c.quadraticCurveTo(-0.22 * s, -0.3 * s, 0, -0.38 * s);
      c.closePath();
      c.stroke();
      L([
        [0, -0.26],
        [0, 0.28],
      ]);
      break;
    case 'note':
      c.beginPath();
      c.ellipse(-0.12 * s, 0.24 * s, 0.13 * s, 0.1 * s, -0.4, 0, TAU);
      c.fill();
      L([
        [0, 0.22],
        [0, -0.36],
      ]);
      L([
        [0, -0.36],
        [0.24, -0.24],
        [0.26, -0.06],
      ]);
      break;
    case 'cloud':
      c.beginPath();
      c.moveTo(-0.36 * s, 0.1 * s);
      c.arc(-0.2 * s, 0.02 * s, 0.16 * s, Math.PI * 0.8, Math.PI * 1.6);
      c.arc(0.04 * s, -0.1 * s, 0.2 * s, Math.PI * 1.1, Math.PI * 1.9);
      c.arc(0.24 * s, 0.02 * s, 0.15 * s, Math.PI * 1.4, Math.PI * 0.3);
      c.closePath();
      c.stroke();
      L([
        [-0.18, 0.24],
        [-0.22, 0.36],
      ]);
      L([
        [0, 0.24],
        [-0.04, 0.36],
      ]);
      L([
        [0.18, 0.24],
        [0.14, 0.36],
      ]);
      break;
    case 'tornado':
      L([
        [-0.38, -0.3],
        [0.38, -0.3],
      ]);
      L([
        [-0.28, -0.14],
        [0.26, -0.14],
      ]);
      L([
        [-0.16, 0.02],
        [0.2, 0.02],
      ]);
      L([
        [-0.06, 0.18],
        [0.12, 0.18],
      ]);
      L([
        [0, 0.34],
        [0.06, 0.34],
      ]);
      break;
    case 'web':
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        L([
          [0, 0],
          [Math.cos(a) * 0.4, Math.sin(a) * 0.4],
        ]);
      }
      for (const rr of [0.16, 0.3]) {
        c.beginPath();
        for (let i = 0; i <= 6; i++) {
          const a = (i / 6) * TAU;
          i
            ? c.lineTo(Math.cos(a) * rr * s, Math.sin(a) * rr * s)
            : c.moveTo(Math.cos(a) * rr * s, Math.sin(a) * rr * s);
        }
        c.stroke();
      }
      break;
    case 'potion':
      C(0, 0.14, 0.24);
      L([
        [-0.08, -0.08],
        [-0.08, -0.3],
      ]);
      L([
        [0.08, -0.08],
        [0.08, -0.3],
      ]);
      L([
        [-0.13, -0.34],
        [0.13, -0.34],
      ]);
      c.beginPath();
      c.arc(0, 0.14 * s, 0.16 * s, 0, Math.PI);
      c.fill();
      break;
  }
  c.restore();
}

/* ---------- magic circle ---------- */
const CC = new Map();
function circleSprites(ls, sw, dk, glow, px) {
  const key = ls.join(',') + '|' + (sw | 0) + '|' + (dk ? 1 : 0) + '|' + (glow ? 1 : 0) + '|' + px;
  let e = CC.get(key);
  if (e) {
    CC.delete(key);
    CC.set(key, e);
    return e;
  }
  const ext = 1.2 + 0.1 * Math.max(0, (sw | 0) - 1),
    R = px / 2 / ext,
    parts = [];
  const mk = (spd, fn) => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = px;
    const c = cv.getContext('2d');
    c.translate(px / 2, px / 2);
    c.lineCap = 'round';
    fn(c);
    parts.push({ cv, spd });
  };
  const gold = dk ? '#c27bff' : '#f6c453',
    ring = (c, r) => {
      c.beginPath();
      c.arc(0, 0, r, 0, TAU);
      c.stroke();
    };
  mk(0, c => {
    if (glow) {
      c.shadowColor = gold;
      c.shadowBlur = R * 0.06;
    }
    c.strokeStyle = gold;
    c.lineWidth = Math.max(1.4, R * 0.016);
    ring(c, R);
    ring(c, R * 0.93);
  });
  mk(dk ? -0.12 : 0.12, c => {
    c.fillStyle = dk ? '#8dff6a' : gold;
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * TAU;
      c.save();
      c.rotate(a);
      c.translate(0, -R * 0.965);
      if (i % 5 === 0) {
        c.beginPath();
        c.arc(0, 0, R * 0.012 + 0.6, 0, TAU);
        c.fill();
      } else {
        c.fillRect(-0.6, -R * 0.012, 1.2, R * 0.024);
      }
      c.restore();
    }
  });
  for (let q = 0; q < (sw | 0); q++)
    mk((q % 2 ? 1 : -1) * 1.1, c => {
      const r0 = R * (1.01 + q * 0.1);
      c.fillStyle = symCol('saw', dk);
      if (glow) {
        c.shadowColor = '#fff';
        c.shadowBlur = R * 0.03;
      }
      const n = 30 + q * 6;
      c.beginPath();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU,
          b = ((i + 0.55) / n) * TAU,
          e2 = ((i + 1) / n) * TAU;
        c.lineTo(Math.cos(a) * r0, Math.sin(a) * r0);
        c.lineTo(Math.cos(b) * (r0 + R * 0.12), Math.sin(b) * (r0 + R * 0.12));
        c.lineTo(Math.cos(e2) * r0, Math.sin(e2) * r0);
      }
      c.closePath();
      c.globalAlpha = 0.9 - q * 0.15;
      c.fill();
    });
  const R0 = R * 0.89,
    n = ls.length,
    band = n ? Math.min(R0 * 0.24, (R0 * 0.8) / n) : 0;
  ls.forEach((k, i) => {
    mk((i % 2 ? -0.28 : 0.28) * (1 + i * 0.12), c => {
      const ro = R0 - i * band,
        ri = ro - band,
        rm = (ro + ri) / 2,
        s = band * 0.78,
        col = symCol(k, dk);
      c.strokeStyle = col;
      if (glow) {
        c.shadowColor = col;
        c.shadowBlur = R * 0.03;
      }
      c.lineWidth = Math.max(1, R * 0.008);
      ring(c, ri);
      const m = clamp(Math.floor((TAU * rm) / (s * 1.3)), 3, 14);
      for (let j = 0; j < m; j++) {
        c.save();
        c.rotate((j / m) * TAU);
        c.translate(0, -rm);
        drawSym(c, k, s, col);
        c.restore();
      }
    });
  });
  const rc = n ? R0 - n * band : R0 * 0.6;
  mk(-0.5, c => {
    c.strokeStyle = gold;
    c.lineWidth = Math.max(1.2, R * 0.012);
    if (glow) {
      c.shadowColor = gold;
      c.shadowBlur = R * 0.03;
    }
    if (dk) {
      c.beginPath();
      for (let j = 0; j < 5; j++) {
        const a = ((j * 2) / 5) * TAU - Math.PI / 2;
        j
          ? c.lineTo(Math.cos(a) * rc * 0.8, Math.sin(a) * rc * 0.8)
          : c.moveTo(Math.cos(a) * rc * 0.8, Math.sin(a) * rc * 0.8);
      }
      c.closePath();
      c.stroke();
    } else
      for (let i = 0; i < 2; i++) {
        c.beginPath();
        for (let j = 0; j < 3; j++) {
          const a = (j / 3) * TAU + (i * Math.PI) / 3 - Math.PI / 2;
          j
            ? c.lineTo(Math.cos(a) * rc * 0.8, Math.sin(a) * rc * 0.8)
            : c.moveTo(Math.cos(a) * rc * 0.8, Math.sin(a) * rc * 0.8);
        }
        c.closePath();
        c.stroke();
      }
  });
  mk(0, c => {
    const g = c.createRadialGradient(0, 0, 0, 0, 0, rc * 0.6);
    g.addColorStop(0, dk ? 'rgba(200,255,170,.9)' : 'rgba(255,245,200,.9)');
    g.addColorStop(1, dk ? 'rgba(140,60,255,0)' : 'rgba(246,196,83,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 0, rc * 0.6, 0, TAU);
    c.fill();
  });
  e = { parts, R, px };
  CC.set(key, e);
  while (CC.size > 36) CC.delete(CC.keys().next().value);
  return e;
}
function drawCircle(c, R, ls, sw, t, alpha = 1, glow = true, dk = false) {
  const m = c.getTransform(),
    sf = Math.max(Math.hypot(m.a, m.b), Math.hypot(m.c, m.d)) || 1,
    need = 2 * R * 1.35 * sf;
  let px = need <= 100 ? 96 : need <= 200 ? 192 : need <= 400 ? 384 : need <= 800 ? 768 : 1024;
  if (qLvl === 'rapide') px = Math.min(px, 384);
  const e = circleSprites(ls, sw, dk, glow && Q().glow, px),
    k = R / e.R,
    h = (e.px / 2) * k,
    sz = e.px * k;
  c.save();
  c.globalAlpha *= alpha;
  for (const p of e.parts) {
    if (p.spd) {
      c.save();
      c.rotate(t * p.spd);
      c.drawImage(p.cv, -h, -h, sz, sz);
      c.restore();
    } else c.drawImage(p.cv, -h, -h, sz, sz);
  }
  c.restore();
}
