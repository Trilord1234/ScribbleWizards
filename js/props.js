/* Scribble Wizards — props.js
   Breakable props (walls, crates, trees...), coins and plants. */
/* ---------- props ---------- */
function newProp(kind, x, w, h, hp, o = {}) {
  return Object.assign(
    {
      kind,
      x,
      y: GROUND - h,
      w,
      h,
      hp,
      max: hp,
      seed: (Math.random() * 1e9) | 0,
      vy: 0,
      stack: false,
      flash: 0,
      burn: 0,
      frost: 0,
      rise: 0,
      stage: 0,
      handT: 0,
      spawned: true,
    },
    o
  );
}
function spawnWall(x, S, dk) {
  x = G.mode === 'duel' ? clamp(x, 300, W - 300) : clamp(x, 280, W - 90);
  let q;
  if (S.has('tramp')) q = newProp('tramp', x - 50, 100, 24, 999);
  else if (S.has('rampart')) q = newProp('rampart', x - 40, 80, 210, 320);
  else if (dk) q = newProp('tomb', x - 28, 56, 96, 200);
  else q = newProp('concrete', x - 25, 50, 120, 140);
  G.props.push(q);
  for (let i = 0; i < 16; i++)
    part(
      'smoke',
      x + rnd(-q.w / 2, q.w / 2),
      GROUND - 5,
      rnd(-120, 120),
      rnd(-120, -20),
      1,
      rnd(12, 22),
      dk ? 'rgba(120,90,150,.5)' : 'rgba(200,190,170,.5)',
      { drag: 2 }
    );
  chips(x, GROUND, '#6b5a3a', 10);
  G.shake = Math.max(G.shake, 6);
  sfx(dk ? 'evil' : 'wall');
  const sp = G.props.filter(p => p.spawned && !p.dead);
  if (sp.length > 9) {
    sp[0].dead = true;
    chips(sp[0].x + sp[0].w / 2, sp[0].y + sp[0].h / 2, PROPCOL[sp[0].kind], 16, true);
  }
}
function spawnPyramid(x) {
  x = G.mode === 'duel' ? clamp(x, 320, W - 320) : clamp(x, 300, W - 120);
  G.props.push(newProp('pyramid', x - 80, 160, 110, 260));
  for (let i = 0; i < 20; i++)
    part(
      'smoke',
      x + rnd(-80, 80),
      GROUND - 5,
      rnd(-150, 150),
      rnd(-150, -20),
      1.2,
      rnd(14, 26),
      'rgba(230,200,140,.5)',
      { drag: 2 }
    );
  G.shake = 10;
  sfx('wall');
  txt(x, GROUND - 150, 'PYRAMIDE !', '#f2d48a', 32);
}
function hitProp(q, d, p, x, y) {
  if (q.dead || q.kind === 'tramp') return;
  q.hp -= d;
  q.flash = 0.15;
  chips(x, y, PROPCOL[q.kind], 4 + Math.min(10, (d / 5) | 0));
  if (p) {
    const k = p.spec;
    if (k.n.flame && WOOD.has(q.kind)) {
      q.burn = 3;
      q.curse = k.dark;
    }
    if (k.n.snow) q.frost = 3;
  }
  const st = Math.min(3, Math.floor((1 - Math.max(0, q.hp) / q.max) * 3.999));
  if (st > q.stage) {
    q.stage = st;
    stageFx(q);
  }
  if (q.hp <= 0) breakProp(q);
  else sfx('thud');
}
function stageFx(q) {
  const cx = q.x + q.w / 2;
  if (q.kind === 'scarecrow') {
    if (q.stage === 1) {
      part('chunk', cx, q.y, rnd(-150, 150), -420, 2, 0, '#6b3d1f', {
        g: 1300,
        w: 44,
        h: 16,
        vr: rnd(-8, 8),
      });
      txt(cx, q.y - 20, 'Le chapeau !', '#ffe9a8', 22);
    }
    if (q.stage === 2) {
      part('chunk', cx - 30, q.y + 50, -160, -300, 2, 0, '#e6c35a', {
        g: 1300,
        w: 34,
        h: 10,
        vr: rnd(-8, 8),
      });
      txt(cx, q.y - 20, 'Un bras en moins !', '#ffe9a8', 22);
    }
    for (let i = 0; i < 10; i++)
      part('straw', cx, q.y + 40, rnd(-200, 200), rnd(-300, -50), 1.4, 10, '#e6c35a', {
        g: 1100,
        vr: rnd(-10, 10),
      });
  } else chips(cx, q.y + q.h * 0.3, PROPCOL[q.kind], 8, true);
}
function breakProp(q) {
  q.dead = true;
  G.broken++;
  const cx = q.x + q.w / 2,
    cy = q.y + q.h / 2;
  chips(cx, cy, PROPCOL[q.kind], 18 + (((q.w * q.h) / 600) | 0), true);
  if (q.kind === 'scarecrow')
    for (let i = 0; i < 24; i++)
      part('straw', cx, cy, rnd(-300, 300), rnd(-400, -50), 1.6, 12, '#e6c35a', {
        g: 1100,
        vr: rnd(-10, 10),
      });
  if (q.kind === 'vase' && Math.random() < 0.6) addCoin(cx, cy, rnd(-60, 60), -300);
  for (let i = 0; i < 6; i++)
    part(
      'smoke',
      cx + rnd(-q.w / 2, q.w / 2),
      cy,
      rnd(-60, 60),
      rnd(-80, -10),
      0.8,
      rnd(12, 22),
      'rgba(210,200,190,.45)'
    );
  G.shake = Math.max(G.shake, 4);
  sfx('break');
}

/* ---------- pickups & plants ---------- */
function addCoin(x, y, vx, vy, cursed, own) {
  if (G.pickups.length < 40)
    G.pickups.push({
      x,
      y,
      vx,
      vy,
      t: Math.random() * 5,
      l: 14,
      ground: false,
      dead: false,
      cursed: !!cursed,
      own: own || null,
      fuse: G.mode === 'duel' ? 1.5 : 5,
    });
}
function explodeCoin(c) {
  c.dead = true;
  aoe(c.x, GROUND - 20, 110, 40, 350, c.own);
  for (let i = 0; i < 30; i++)
    part(
      i % 2 ? 'spark' : 'fire',
      c.x,
      GROUND - 15,
      rnd(-300, 300),
      rnd(-350, 50),
      rnd(0.4, 0.9),
      rnd(5, 14),
      i % 2 ? '#b8ff3c' : 'purple',
      { drag: 2 }
    );
  G.shake = Math.max(G.shake, 10);
  txt(c.x, GROUND - 80, 'PIÈGE !', '#b8ff3c', 34);
  sfx('boom');
}
const LEAF = ['#4fbf5a', '#3aa85a', '#6fd36a', '#ffb3d1', '#f29a3a'];
function addPlant(x, type) {
  const pl = {
    x,
    type,
    g: 0,
    seed: (Math.random() * 1e9) | 0,
    h: rnd(0.8, 1.25),
    c:
      type === 'tree'
        ? LEAF[(Math.random() * LEAF.length) | 0]
        : ['#ff6fae', '#ffd84d', '#8fe3ff', '#ffffff', '#c39bff'][(Math.random() * 5) | 0],
    coinT: rnd(2, 5),
  };
  G.plants.push(pl);
  const fl = G.plants.filter(p => p.type === 'flower'),
    tr = G.plants.filter(p => p.type !== 'flower');
  if (fl.length > 50) G.plants.splice(G.plants.indexOf(fl[0]), 1);
  if (tr.length > 16) G.plants.splice(G.plants.indexOf(tr[0]), 1);
  if (type !== 'flower') {
    for (let i = 0; i < 8; i++)
      part('leaf', x, GROUND - 20, rnd(-120, 120), rnd(-200, -60), 1.2, 6, pl.c, {
        g: 300,
        vr: rnd(-6, 6),
      });
    chips(x, GROUND, '#5a3f22', 6);
  }
}
