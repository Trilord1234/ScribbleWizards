/* Scribble Wizards — magic-circle.js
   Drawing of every symbol and of the magic circle (with sprite cache for performance). */
/* ---------- symbol drawings (child-drawing style) ---------- */
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
  }
  c.restore();
}

/* ---------- magic circle ---------- */
function drawCircle(c, R, ls, sw, t, alpha = 1, glow = true) {
  c.save();
  c.globalAlpha *= alpha;
  const gold = '#f6c453';
  const ring = r => {
    c.beginPath();
    c.arc(0, 0, r, 0, TAU);
    c.stroke();
  };
  if (glow) {
    c.shadowColor = gold;
    c.shadowBlur = R * 0.06;
  }
  c.strokeStyle = gold;
  c.lineWidth = Math.max(1.4, R * 0.016);
  ring(R);
  ring(R * 0.93);
  c.save();
  c.rotate(t * 0.12);
  c.fillStyle = gold;
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
  c.restore();
  if (sw) {
    c.save();
    c.rotate(-t * 1.1);
    c.fillStyle = SM.saw.c;
    if (glow) c.shadowColor = '#fff';
    const n = 30;
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU,
        b = ((i + 0.55) / n) * TAU,
        e = ((i + 1) / n) * TAU;
      c.lineTo(Math.cos(a) * R * 1.01, Math.sin(a) * R * 1.01);
      c.lineTo(Math.cos(b) * R * 1.13, Math.sin(b) * R * 1.13);
      c.lineTo(Math.cos(e) * R * 1.01, Math.sin(e) * R * 1.01);
    }
    c.closePath();
    c.globalAlpha *= 0.9;
    c.fill();
    c.restore();
  }
  const R0 = R * 0.89,
    n = ls.length,
    band = n ? Math.min(R0 * 0.24, (R0 * 0.8) / n) : 0;
  ls.forEach((k, i) => {
    const ro = R0 - i * band,
      ri = ro - band,
      rm = (ro + ri) / 2,
      s = band * 0.78,
      col = SM[k].c;
    c.strokeStyle = col;
    if (glow) {
      c.shadowColor = col;
      c.shadowBlur = R * 0.03;
    }
    c.lineWidth = Math.max(1, R * 0.008);
    ring(ri);
    const m = clamp(Math.floor((TAU * rm) / (s * 1.3)), 3, 14);
    c.save();
    c.rotate(t * (i % 2 ? -0.28 : 0.28) * (1 + i * 0.12));
    for (let j = 0; j < m; j++) {
      c.save();
      c.rotate((j / m) * TAU);
      c.translate(0, -rm);
      drawSym(c, k, s, col);
      c.restore();
    }
    c.restore();
  });
  const rc = n ? R0 - n * band : R0 * 0.6;
  c.save();
  c.rotate(-t * 0.5);
  c.strokeStyle = gold;
  c.lineWidth = Math.max(1.2, R * 0.012);
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
  c.restore();
  const g = c.createRadialGradient(0, 0, 0, 0, 0, rc * 0.6);
  g.addColorStop(0, 'rgba(255,245,200,.9)');
  g.addColorStop(1, 'rgba(246,196,83,0)');
  c.fillStyle = g;
  c.shadowBlur = 0;
  c.beginPath();
  c.arc(0, 0, rc * 0.6, 0, TAU);
  c.fill();
  c.restore();
}
