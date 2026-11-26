/* Scribble Wizards — duel.js
   Duel mode: setup, wizard AI, spell clashes. */
/* ---------- duel ---------- */
function setupDuel() {
  G.enemies = [];
  for (const w of WZ) {
    const e = mkMage(w);
    G.enemies.push(e);
    w.ent = e;
    w.cd = rnd(0.3, 0.8);
    w.haste = 0;
    w.hurt = 0;
    w.aim = w.side > 0 ? -0.2 : Math.PI + 0.2;
  }
}
function startDuel() {
  G.projs = [];
  G.zones = [];
  G.pickups = [];
  G.bolts = [];
  G.props = buildDuel();
  setupDuel();
  G.duel = { state: 'count', t: 3.2, last: 4 };
  updUI();
}
function duelEnd(loser) {
  if (G.duel.state !== 'fight') return;
  G.duel.state = 'end';
  const win = WZ[1 - loser.wz.i];
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
    oy = GROUND - 80,
    tx = foe.x,
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
  }
  if (D.state !== 'fight') return;
  for (const w of WZ) {
    const e = w.ent;
    if (!e || e.ko || e.freeze > 0 || e.stun > 0 || e.bubble > 0 || e.air || e.loveT > 0) continue;
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
}
