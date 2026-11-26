/* Scribble Wizards — duel.js
   Duel mode: setup, wizard AI, spell clashes. */
/* ---------- duel ---------- */
function setupDuel() {
  G.enemies = [];
  for (const w of WZ) {
    w.x = w.i ? W - 150 : 150;
    w.vx = 0;
    w.wx = w.x;
    w.wt = 0;
    w.shield = 0;
    w.shieldCd = 0;
    const e = mkMage(w);
    e.jy = 0;
    e.jvy = 0;
    G.enemies.push(e);
    w.ent = e;
    w.cd = rnd(0.3, 0.8);
    w.haste = 0;
    w.hurt = 0;
    w.aim = w.side > 0 ? -0.2 : Math.PI + 0.2;
  }
}
function startDuel() {
  if (G.budget) {
    const bad = WZ.find(w => spellCost(w) > G.budget);
    if (bad) {
      banner(
        bad.name + ' a un sort trop cher !',
        'Budget : ' + G.budget + ' de magie. Retire des dessins.'
      );
      sfx('remove');
      openBook(bad.i);
      return;
    }
  }
  G.later = [];
  G.projs = [];
  G.zones = [];
  G.pickups = [];
  G.bolts = [];
  pickMap();
  G.props = buildDuel();
  setupDuel();
  G.duel = { state: 'count', t: 3.2, last: 4 };
  banner(DUEL_MAPS[G.duelMap].n, G.budget ? 'Budget : ' + G.budget + ' de magie' : 'Magie libre');
  updUI();
}
function duelEnd(loser) {
  if (G.duel.state !== 'fight') return;
  G.duel.state = 'end';
  const win = WZ[1 - loser.wz.i];
  sfx('ko');
  later(0.5, () => sfx('fanfare'));
  banner(
    win.name + ' gagne !',
    (win.dark ? 'La magie noire' : 'La magie blanche') + " l'emporte. Revanche ?"
  );
  sfx('win');
  G.shake = 12;
  for (let i = 0; i < 120; i++)
    part(
      'chunk',
      rnd(0, W),
      rnd(-100, 0),
      rnd(-60, 60),
      rnd(50, 200),
      rnd(2, 4),
      0,
      ['#ffd84d', '#ff6fae', '#62f0dd', '#b48cff', '#7cf2c8'][i % 5],
      { g: 200, w: rnd(6, 12), h: rnd(4, 8), vr: rnd(-8, 8) }
    );
  updUI();
}
function lineBlocked(x1, y1, x2, y2) {
  for (const q of G.props) {
    if (q.dead || q.kind === 'tramp') continue;
    for (let f = 0.1; f < 0.95; f += 0.05) {
      const x = x1 + (x2 - x1) * f,
        y = y1 + (y2 - y1) * f;
      if (x > q.x && x < q.x + q.w && y > q.y && y < q.y + q.h) return true;
    }
  }
  return false;
}
function aiAim(w, foe) {
  const spec = compW(w),
    ox = w.x + 12 * w.side + 58 * w.side * 0.8,
    oy = (w.ent ? w.ent.y : GROUND) - 80,
    v0 = projSpeed(spec),
    tx = foe.x + (((foe.wz.vx || 0) * Math.abs(foe.x - ox)) / v0) * 0.6,
    ty = foe.y - 75;
  const X = Math.abs(tx - ox),
    Yup = oy - ty,
    v = projSpeed(spec),
    g = projGrav(spec);
  const blocked = lineBlocked(ox, oy, tx, ty) && !spec.n.ghost && !spec.saw;
  let th;
  if (g < 1) th = Math.atan2(Yup, X) + (blocked && Math.random() < 0.4 ? rnd(0.15, 0.35) : 0);
  else {
    const v2 = v * v,
      disc = v2 * v2 - g * (g * X * X + 2 * Yup * v2);
    if (disc < 0) th = Math.PI / 4;
    else {
      const lob = blocked ? Math.random() < 0.75 : Math.random() < 0.15;
      th = Math.atan((v2 + (lob ? 1 : -1) * Math.sqrt(disc)) / (g * X));
    }
  }
  th += rnd(-0.05, 0.05) * (spec.n.zigzag ? 2 : 1);
  th = clamp(th, -1.1, 1.45);
  return w.side > 0 ? -th : Math.PI + th;
}
function aiMove(w, e, dt) {
  const lo = w.i ? W - 380 : 90,
    hi = w.i ? W - 90 : 380;
  let threat = null,
    tmin = 1e9;
  for (const p of G.projs) {
    if (p.dead || p.owner === w) continue;
    p.seen = p.seen || [0, 0];
    if (!p.seen[w.i]) p.seen[w.i] = Math.random() < 0.62 ? 1 : 2;
    if (p.seen[w.i] !== 1) continue;
    const dx = e.x - p.x;
    if (Math.abs(p.vx) < 40 || Math.sign(dx) !== Math.sign(p.vx)) continue;
    const tt = Math.abs(dx) / Math.abs(p.vx);
    if (tt > 0.85) continue;
    const py = p.y + p.vy * tt + 0.5 * p.g * tt * tt;
    if (Math.abs(py - (e.y - 80)) < 115 && tt < tmin) {
      tmin = tt;
      threat = { p, py, tt };
    }
  }
  if (threat && !w.dodgeT) {
    const { p, py } = threat;
    if (w.cd < 0.5 && Math.random() < 0.3) {
      w.aim = Math.atan2(p.y - (e.y - 72), p.x - (w.x + 12 * w.side));
      if (w.side < 0 && Math.cos(w.aim) > 0) w.aim = Math.PI - w.aim;
      fire(w, w.aim);
      w.cd = rnd(1, 1.4);
      txt(w.x, GROUND - 230, 'Contre-sort !', '#9fe3ff', 22);
    } else if (py > e.y - 110 && p.g < 300 && !e.jy) {
      e.jvy = -780;
      sfx('whoosh');
    } else {
      w.dodgeT = 0.45;
      w.dodgeDir = w.x - lo < 60 ? 1 : hi - w.x < 60 ? -1 : Math.random() < 0.5 ? -1 : 1;
    }
  }
  let vx = 0;
  if (w.dodgeT > 0) {
    w.dodgeT -= dt;
    vx = w.dodgeDir * 260;
    if (w.dodgeT <= 0) w.dodgeT = 0;
  } else {
    w.wt -= dt;
    if (w.wt <= 0) {
      w.wt = rnd(1.2, 2.8);
      w.wx = rnd(lo, hi);
    }
    const d = w.wx - w.x;
    if (Math.abs(d) > 6) vx = Math.sign(d) * 75;
  }
  w.vx = vx;
  w.x = clamp(w.x + vx * dt, lo, hi);
  e.x = w.x;
}
function clashes() {
  const A = G.projs.filter(p => !p.dead && p.owner === WZ[0]),
    B = G.projs.filter(p => !p.dead && p.owner === WZ[1]);
  if (!A.length || !B.length) return;
  for (const p of A) {
    if (p.dead) continue;
    for (const q of B) {
      if (q.dead) continue;
      const rr = p.r + q.r + 6;
      if (Math.abs(p.x - q.x) > rr || Math.abs(p.y - q.y) > rr) continue;
      if ((p.x - q.x) ** 2 + (p.y - q.y) ** 2 < rr * rr) {
        clash(p, q);
        if (p.dead) break;
      }
    }
  }
}
function clash(p, q) {
  const a = p.dmg * (p.spec.saw ? 1.5 : 1),
    b = q.dmg * (q.spec.saw ? 1.5 : 1),
    x = (p.x + q.x) / 2,
    y = (p.y + q.y) / 2;
  if (a >= b) {
    q.dead = true;
    p.dmg -= b * 0.6;
    if (p.dmg < 4) p.dead = true;
  } else {
    p.dead = true;
    q.dmg -= a * 0.6;
    if (q.dmg < 4) q.dead = true;
  }
  burst(x, y, spellCol(p.spec), 10, 320);
  burst(x, y, spellCol(q.spec), 10, 320);
  part('sring', x, y, 0, 0, 0.35, 55, '#ffffff');
  if (Math.random() < 0.5 || (p.dead && q.dead)) txt(x, y - 30, 'CLASH !', '#ffffff', 26);
  sfx('clash');
  G.shake = Math.max(G.shake, 3);
}
function upDuel(dt) {
  const D = G.duel;
  if (D.state === 'count') {
    D.t -= dt;
    const n = Math.ceil(D.t);
    if (n !== D.last && n > 0) {
      D.last = n;
      txt(W / 2, H / 2 - 60, String(n), '#f6c453', 90);
      sfx('tick');
    }
    if (D.t <= 0) {
      D.state = 'fight';
      txt(W / 2, H / 2 - 60, 'Combattez !', '#f6c453', 70);
      sfx('win');
    }
    return;
  }
  for (const w of WZ) {
    w.hurt = Math.max(0, w.hurt - dt);
    w.recoil = Math.max(0, w.recoil - dt * 5);
    w.haste = Math.max(0, w.haste - dt);
    w.shield = Math.max(0, (w.shield || 0) - dt);
    w.shieldCd = (w.shieldCd || 0) - dt;
  }
  if (D.state !== 'fight') return;
  for (const w of WZ) {
    const e = w.ent;
    if (!e || e.ko || e.freeze > 0 || e.stun > 0 || e.bubble > 0 || e.air || e.loveT > 0) {
      if (w) w.vx = 0;
      continue;
    }
    aiMove(w, e, dt);
    let rate = w.haste > 0 ? 2 : 1;
    rate *= clamp(e.slow * 1.6, 0.15, 1);
    w.cd -= dt * rate;
    if (w.cd <= 0) {
      const foe = WZ[1 - w.i].ent;
      w.aim = aiAim(w, foe);
      fire(w, w.aim);
      w.cd = rnd(1, 1.5);
    }
  }
  if (D.state === 'fight') clashes();
}
