/* Scribble Wizards — projectiles.js
   Spell projectiles: movement, collisions, hits, impacts, stacking levels, synergies and zones. */
/* ---------- projectiles ---------- */
function makeProj(spec, x, y, a, o = {}) {
  const c = k => spec.n[k] || 0,
    S = spec.syn;
  let spd = (o.speed || 580) * Math.pow(1.5, c('arrow')) * (o.spd || 1);
  if (S.has('ram')) spd *= 1.3;
  if (o.speed == null) spd = Math.min(spd, 2300);
  let r = (o.r || 11) * Math.pow(1.65, c('mountain'));
  if (o.pellet) r *= 0.62;
  r = Math.min(r, 80);
  let g = 0;
  if (o.g != null) g = o.g;
  else {
    if (spec.body === 'square') g += 650;
    if (spec.body === 'coin') g += 520;
    if (spec.body === 'fish') g += 300;
    g += 1500 * c('gravity');
  }
  const dmg =
    (o.pellet ? 11 : 20) *
    (spec.body === 'square' ? 2 : 1) *
    Math.pow(1.35, c('mountain')) *
    (o.dm || 1);
  return {
    spec,
    x,
    y,
    bx: x,
    by: y,
    vx: Math.cos(a) * spd,
    vy: Math.sin(a) * spd,
    a0: a,
    r,
    g,
    dmg,
    t: 0,
    life: o.life || 7,
    bounces: 3 * c('cushion'),
    pierce: (spec.saw ? 8 : 0) + 2 * c('bite') + (S.has('ram') ? 4 : 0),
    hit: new Map(),
    wa: 0,
    fish: S.has('sawfish') ? SAWFISH : FISH[(Math.random() * FISH.length) | 0],
    drop: 0,
    dead: false,
    pellet: !!o.pellet,
    frag: !!o.frag,
    love: S.has('love') && !!o.pellet,
    bodies: [[x, y]],
    sq: 0,
    zoned: false,
    emit: 0,
  };
}
const TRI = [
  [0, -1],
  [0.866, 0.5],
  [-0.866, 0.5],
];
function triPt(u) {
  const f0 = u * 3,
    s = Math.floor(f0) % 3,
    f = f0 - Math.floor(f0),
    a = TRI[s],
    b = TRI[(s + 1) % 3];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}
function rot(p, da) {
  const c = Math.cos(da),
    s = Math.sin(da),
    vx = p.vx;
  p.vx = vx * c - p.vy * s;
  p.vy = vx * s + p.vy * c;
}
function reflectN(p, nx, ny) {
  const d = p.vx * nx + p.vy * ny;
  if (d < 0) {
    p.vx -= 2 * d * nx;
    p.vy -= 2 * d * ny;
  }
  p.vx *= 0.9;
  p.vy *= 0.9;
}
function circRect(x, y, r, q) {
  const t = propTop(q),
    cx = clamp(x, q.x, q.x + q.w),
    cy = clamp(y, t, q.y + q.h);
  return (x - cx) ** 2 + (y - cy) ** 2 < r * r;
}
function nearestEnemy(x, y, R) {
  let b = null,
    bd = R * R;
  for (const e of G.enemies) {
    if (e.dead || e.charmed) continue;
    const d = (e.x - x) ** 2 + (e.y - e.h / 2 - y) ** 2;
    if (d < bd) {
      bd = d;
      b = e;
    }
  }
  return b;
}

function aimInfo() {
  const sx = WIZ.x + 12,
    sy = GROUND - 72;
  let a = Math.atan2(G.aim.y - sy, G.aim.x - sx);
  if (G.aim.x < sx) a = a < 0 ? -1.45 : 1.2;
  a = clamp(a, -1.45, 1.2);
  return { sx, sy, a };
}
function fire() {
  if (G.over) return;
  const spec = compile(layers, saw),
    { sx, sy, a } = aimInfo(),
    tx = sx + Math.cos(a) * 58,
    ty = sy + Math.sin(a) * 58;
  G.cast = { x: tx, y: ty, t: 0, a };
  for (const s of spec.syn)
    if (!discovered.has(s)) {
      discovered.add(s);
      store.set('sw_disc', [...discovered]);
      banner('Synergie découverte !', SYNM[s].n);
      sfx('win');
      renderBook();
      renderReading();
    }
  const nd = spec.n.dots || 0;
  if (nd) {
    const cnt = Math.min(5 + 3 * (nd - 1), 14),
      spread = 0.45 + 0.1 * nd;
    for (let i = 0; i < cnt; i++)
      G.projs.push(
        makeProj(spec, tx, ty, a + (i / (cnt - 1) - 0.5) * spread + rnd(-0.04, 0.04), {
          pellet: true,
          spd: rnd(0.85, 1.1),
        })
      );
  } else G.projs.push(makeProj(spec, tx, ty, a));
  if (spec.body === 'fish' && !nd)
    txt(
      tx + 40,
      ty - 30,
      (spec.syn.has('sawfish') ? SAWFISH : G.projs[G.projs.length - 1].fish).n + ' !',
      '#9fe3ff',
      22
    );
  G.cd = 0.3;
  WIZ.recoil = 1;
  sfx('cast');
  burst(tx, ty, spellCol(spec), 14, 220);
}

function trail(p, dt) {
  const k = p.spec,
    c = n => k.n[n] || 0,
    S = k.syn,
    x = p.x,
    y = p.y,
    r = p.r;
  p.emit += dt;
  if (p.emit < 0.016) return;
  p.emit = 0;
  const col = spellCol(k);
  part(
    'spark',
    x + rnd(-r, r) * 0.5,
    y + rnd(-r, r) * 0.5,
    rnd(-30, 30),
    rnd(-30, 30),
    0.35,
    r * 0.35,
    col,
    { drag: 2 }
  );
  if (c('flame')) {
    for (let i = 0; i < 2; i++)
      part(
        'fire',
        x + rnd(-r, r) * 0.6,
        y + rnd(-r, r) * 0.6,
        -p.vx * 0.05 + rnd(-40, 40),
        -p.vy * 0.05 - rnd(30, 90),
        rnd(0.3, 0.6),
        r * rnd(0.6, 1),
        S.has('icefire') ? 'blue' : 'orange'
      );
  }
  if (c('snow'))
    part(
      'snow',
      x + rnd(-r, r),
      y + rnd(-r, r),
      rnd(-40, 40),
      rnd(10, 60),
      rnd(0.6, 1.1),
      rnd(3, 6),
      '#e6fbff',
      { vr: rnd(-4, 4) }
    );
  if (c('arrow')) part('streak', x, y, 0, 0, 0.18, r, col, { a: Math.atan2(p.vy, p.vx) });
  if (c('ghost') && Math.random() < 0.5)
    part('smoke', x, y, rnd(-20, 20), rnd(-30, -10), 0.6, r * 0.7, 'rgba(220,230,255,.25)');
  if (k.body === 'fish' && Math.random() < 0.4)
    part('drop', x, y, rnd(-80, 80), rnd(-120, 0), 1, 3, '#7fd6ff', { g: 900 });
  if (k.body === 'coin' || c('star'))
    part(
      'star',
      x + rnd(-r, r),
      y + rnd(-r, r),
      0,
      0,
      0.5,
      rnd(4, 8),
      c('star') ? ['#fff07a', '#ff6fae', '#62f0dd'][(Math.random() * 3) | 0] : '#fff2a8'
    );
  if (S.has('rocket'))
    part('smoke', x, y, rnd(-30, 30), rnd(-30, 30), 0.9, r * 0.8, 'rgba(170,170,190,.35)');
  if (c('bolt') && Math.random() < 0.3)
    part('spark', x + rnd(-r, r) * 1.5, y + rnd(-r, r) * 1.5, 0, 0, 0.12, 3, '#fff59a');
  if (c('tree')) {
    p.drop += 0.016;
    if (p.drop > 0.14) {
      p.drop = 0;
      part('seed', x, y, rnd(-40, 40), rnd(-40, 40), 3, 3, '#8b5a2b', { g: 900 });
    }
  }
}

function upProj(p, dt) {
  const k = p.spec,
    c = n => k.n[n] || 0,
    S = k.syn;
  p.t += dt;
  p.sq = Math.max(0, p.sq - dt * 4);
  if (p.g) p.vy += p.g * dt;
  if (c('zigzag')) {
    p.wa += rnd(-1, 1) * 40 * dt * c('zigzag');
    p.wa *= 0.96;
    p.wa = clamp(p.wa, -5, 5);
    rot(p, p.wa * dt);
  }
  if (c('magnet')) {
    const e = nearestEnemy(p.x, p.y, 800);
    if (e) {
      const want = Math.atan2(e.y - e.h / 2 - p.y, e.x - p.x),
        cur = Math.atan2(p.vy, p.vx);
      let d = want - cur;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      rot(p, clamp(d, -1, 1) * 3.5 * c('magnet') * dt);
    }
  }
  if (S.has('egglay')) {
    p.drop += dt;
    if (p.drop > 0.3) {
      p.drop = 0;
      G.projs.push(
        makeProj(
          {
            n: { egg: 1 },
            syn: new Set(['caviar']),
            layers: ['egg'],
            body: 'orb',
            shape: 'egg',
            saw: false,
          },
          p.x,
          p.y + p.r,
          Math.PI / 2,
          { r: 8, speed: 80, g: 900, life: 4 }
        )
      );
    }
  }
  p.bx += p.vx * dt;
  p.by += p.vy * dt;
  let ox = 0,
    oy = 0;
  if (c('triangle')) {
    const A = 40 * c('triangle'),
      u = (p.t * 1.4) % 1,
      q = triPt(u),
      q0 = triPt(0),
      ca = Math.cos(p.a0),
      sa = Math.sin(p.a0),
      tx = (q[0] - q0[0]) * A,
      ty = (q[1] - q0[1]) * A;
    ox = tx * ca - ty * sa;
    oy = tx * sa + ty * ca;
  }
  p.x = p.bx + ox;
  p.y = p.by + oy;
  const nb = Math.min(8, 2 ** c('heart'));
  p.bodies.length = 0;
  if (nb > 1) {
    const R = p.r * 1.5 + 12;
    for (let i = 0; i < nb; i++) {
      const a = p.t * 5 + (i / nb) * TAU;
      p.bodies.push([p.x + Math.cos(a) * R, p.y + Math.sin(a) * R]);
    }
    if (Math.random() < 0.2)
      part('heart', p.x, p.y, rnd(-30, 30), rnd(-60, -20), 0.8, 10, '#ff6fae');
  } else p.bodies.push([p.x, p.y]);
  trail(p, dt);
  for (const b of p.bodies) {
    if (collide(p, b)) break;
    if (p.dead) return;
  }
  if (p.dead) return;
  if (p.t > p.life) end(p, p.x, p.y, 'air');
  if (p.x > W + 250 || p.x < -250 || p.y > H + 200 || p.y < -900) p.dead = true;
}

function collide(p, b) {
  const x = b[0],
    y = b[1],
    r = p.r,
    k = p.spec,
    S = k.syn,
    ghost = (k.n.ghost || 0) > 0;
  if (y + r >= GROUND && p.vy > -60) {
    p.by -= y + r - GROUND;
    if (p.bounces > 0) {
      p.bounces--;
      p.vy = -Math.abs(p.vy) * 0.82 - 140;
      p.vx *= 0.95;
      bounceFx(p, x, GROUND);
      return true;
    }
    end(p, x, GROUND, 'ground');
    return true;
  }
  for (const q of G.props) {
    if (q.dead || !circRect(x, y, r, q)) continue;
    if (q.kind === 'tramp') {
      if (p.vy > 0) {
        p.vy = -Math.abs(p.vy) - 650;
        sfx('boing');
        txt(x, y - 30, 'BOING', '#ff9ad0', 24);
      }
      continue;
    }
    if (ghost) {
      if (S.has('ghosteater') && !p.hit.has(q)) {
        p.hit.set(q, 1);
        hitProp(q, 40, p, x, y);
        txt(x, y - 20, 'CROC !', '#ffd84d');
        sfx('croc');
      }
      continue;
    }
    if (p.hit.has(q)) continue;
    p.hit.set(q, 1);
    hitProp(q, p.dmg * (k.saw ? 1.4 : 1), p, x, y);
    if (p.pierce > 0) {
      p.pierce--;
      continue;
    }
    if (p.bounces > 0) {
      p.bounces--;
      const t = propTop(q),
        cx = clamp(x, q.x, q.x + q.w),
        cy = clamp(y, t, q.y + q.h);
      let nx = x - cx,
        ny = y - cy,
        d = Math.hypot(nx, ny);
      if (d < 0.01) {
        nx = -Math.sign(p.vx || 1);
        ny = 0;
        d = 1;
      }
      nx /= d;
      ny /= d;
      reflectN(p, nx, ny);
      p.bx += nx * (r - d + 2);
      p.by += ny * (r - d + 2);
      p.hit.delete(q);
      bounceFx(p, x, y);
      return true;
    }
    end(p, x, y, 'prop');
    return true;
  }
  for (const e of G.enemies) {
    if (e.dead || e.charmed) continue;
    const dx = x - e.x,
      dy = y - (e.y - e.h / 2),
      rr = r + e.rad;
    if (dx * dx + dy * dy > rr * rr || p.hit.has(e)) continue;
    p.hit.set(e, 1);
    hitEnemy(e, p, x, y);
    if (p.pierce > 0) {
      p.pierce--;
      continue;
    }
    if (p.bounces > 0) {
      p.bounces--;
      const d = Math.hypot(dx, dy) || 1;
      reflectN(p, dx / d, dy / d);
      bounceFx(p, x, y);
      return true;
    }
    end(p, x, y, 'enemy');
    return true;
  }
  return false;
}

function bounceFx(p, x, y) {
  const S = p.spec.syn;
  p.sq = 1;
  sfx('boing');
  if (Math.random() < 0.5) txt(x, y - 30, 'BOING', '#ffa7c4', 22);
  burst(x, y, '#ffa7c4', 6, 160);
  if (S.has('jackpot')) {
    for (let i = 0; i < 3; i++) addCoin(x, y - 10, rnd(-200, 200), rnd(-500, -250));
    sfx('coin');
  }
  if (S.has('snowball')) {
    p.r = Math.min(p.r * 1.25, 95);
    p.dmg *= 1.2;
    burst(x, y, '#fff', 14, 200, 'snow', 5);
  }
  if (p.spec.n.tree && y >= GROUND - 2) addPlant(x, 'flower');
}

function hitEnemy(e, p, x, y) {
  const k = p.spec,
    S = k.syn,
    c = n => k.n[n] || 0;
  if (p.love) {
    charm(e);
    return;
  }
  let d = p.dmg;
  if (c('bite')) {
    d += 12 * c('bite');
    txt(x, y - 30, 'CROC !', '#ffd84d');
    sfx('croc');
    e.bitten = (e.bitten || 0) + 1;
  }
  if (k.saw) {
    d *= 1.3;
    burst(x, y, '#ffe9a8', 10, 320);
  }
  dmgEnemy(e, d, x);
  if (e.kind !== 'golem' && !EK[e.kind].fly) {
    e.vx +=
      Math.sign(p.vx || 1) *
      120 *
      (k.body === 'square' ? 2.5 : 1) *
      (S.has('ram') ? 3 : 1) *
      Math.pow(1.3, c('mountain'));
  }
  if (c('flame')) {
    e.burn = 3.2;
    e.blue = S.has('icefire');
  }
  if (c('snow')) {
    e.freeze = 2 + c('snow') * 0.6;
    sfx('freeze');
    burst(x, y, '#dff8ff', 10, 200, 'snow', 5);
  }
  if (c('bubble') && e.kind !== 'golem') {
    e.bubble = 3;
    e.air = false;
    sfx('pop');
  }
  if (c('hourglass') && !p.zoned) {
    p.zoned = true;
    G.zones.push({ t: 'slow', x, y, r: 150, l: 5, ml: 5 });
  }
  if (c('bolt')) chain(e, c('bolt'));
  if (k.body === 'fish') {
    for (let i = 0; i < 10; i++)
      part('drop', x, y, rnd(-200, 200), rnd(-350, -80), 1, rnd(3, 6), '#7fd6ff', { g: 1000 });
    txt(x, y - 50, 'SPLOTCH', '#7fd6ff', 22);
  }
  burst(x, y, spellCol(k), 8, 240);
  sfx('hit');
}
function dmgEnemy(e, d, x, silent) {
  if (e.dead) return;
  e.hp -= d;
  if (!silent) {
    e.flash = 0.12;
    txt(e.x + rnd(-10, 10), e.y - e.h - 14, String(Math.round(d)), '#fff', 20);
  }
  if (e.kind === 'golem') {
    const st = Math.min(3, Math.floor((1 - Math.max(0, e.hp) / e.max) * 4));
    if (st > e.stage) {
      e.stage = st;
      chips(e.x + (st === 1 ? -50 : st === 2 ? 50 : 0), e.y - 110, '#8a8f9c', 14, true);
      txt(e.x, e.y - e.h - 30, 'CRAC !', '#cfd6e6', 36);
      G.shake = 10;
      sfx('break');
    }
  }
  if (e.hp <= 0) kill(e);
}
function kill(e) {
  e.dead = true;
  G.score++;
  const D = EK[e.kind];
  burst(e.x, e.y - e.h / 2, D.col, 22, 340, 'spark', 6);
  for (let i = 0; i < 8; i++)
    part(
      'smoke',
      e.x + rnd(-20, 20),
      e.y - e.h / 2 + rnd(-20, 20),
      rnd(-60, 60),
      rnd(-80, -10),
      0.8,
      rnd(14, 24),
      'rgba(230,225,255,.5)'
    );
  for (let i = 0; i < 5; i++)
    part('star', e.x, e.y - e.h, rnd(-160, 160), rnd(-260, -80), 0.9, 9, '#fff07a', { g: 600 });
  if (e.kind === 'golem') chips(e.x, e.y - 70, '#8a8f9c', 30, true);
  if (e.kind === 'goblin' && Math.random() < 0.35) addCoin(e.x, e.y - 40, rnd(-80, 80), -300);
  txt(e.x, e.y - e.h - 10, 'POUF !', '#fff', 30);
  sfx('pop');
}
function charm(e) {
  if (e.charmed || (e.kind === 'golem' && e.hp > e.max * 0.5)) {
    if (e.kind === 'golem') dmgEnemy(e, 15, e.x);
    return;
  }
  e.charmed = true;
  e.burn = 0;
  e.freeze = 0;
  e.bubble = 0;
  txt(e.x, e.y - e.h - 10, '♥', '#ff6fae', 40);
  for (let i = 0; i < 8; i++)
    part('heart', e.x, e.y - e.h / 2, rnd(-120, 120), rnd(-200, -60), 1, 12, '#ff6fae');
  sfx('pop');
}
function chain(e0, n) {
  let cur = e0;
  const done = new Set([e0]);
  sfx('zap');
  for (let i = 0; i < 2 + n; i++) {
    let best = null,
      bd = 280 * 280;
    for (const e of G.enemies) {
      if (e.dead || done.has(e)) continue;
      const d = (e.x - cur.x) ** 2 + (e.y - cur.y) ** 2;
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    const x1 = cur.x,
      y1 = cur.y - cur.h / 2;
    if (!best) {
      G.bolts.push({ pts: jag(x1, y1, x1 + rnd(-60, 60), GROUND), l: 0.25 });
      break;
    }
    G.bolts.push({ pts: jag(x1, y1, best.x, best.y - best.h / 2), l: 0.3 });
    done.add(best);
    dmgEnemy(best, 14, best.x);
    best.stun = Math.max(best.stun || 0, 0.6);
    cur = best;
  }
}
function jag(x1, y1, x2, y2) {
  const pts = [[x1, y1]],
    n = 8;
  for (let i = 1; i < n; i++) {
    const f = i / n;
    pts.push([x1 + (x2 - x1) * f + rnd(-14, 14), y1 + (y2 - y1) * f + rnd(-14, 14)]);
  }
  pts.push([x2, y2]);
  return pts;
}
function aoe(x, y, R, d, kb = 0, props = true) {
  for (const e of G.enemies) {
    if (e.dead || e.charmed) continue;
    const dx = e.x - x,
      dy = e.y - e.h / 2 - y;
    if (Math.hypot(dx, dy) < R + e.rad) {
      dmgEnemy(e, d, e.x);
      if (kb && e.kind !== 'golem' && !EK[e.kind].fly) {
        e.air = true;
        e.vy = -kb * 0.8;
        e.vx = Math.sign(dx || 1) * kb * 0.6;
      }
    }
  }
  if (props)
    for (const q of G.props) {
      if (q.dead || q.kind === 'tramp') continue;
      const cx = clamp(x, q.x, q.x + q.w),
        cy = clamp(y, q.y, q.y + q.h);
      if (Math.hypot(cx - x, cy - y) < R) hitProp(q, d * 0.8, null, cx, cy);
    }
}

function end(p, x, y, why) {
  if (p.dead) return;
  p.dead = true;
  const k = p.spec,
    S = k.syn,
    c = n => k.n[n] || 0,
    col = spellCol(k);
  burst(x, y, col, 10, 220);
  if (c('egg')) {
    const fs = Object.assign({}, k, {
      n: Object.assign({}, k.n, { egg: 0, dots: 0, wall: 0, heart: 0, triangle: 0 }),
      syn: new Set(
        [...S].filter(
          s => !['blackhole', 'egglay', 'caviar', 'pyramid', 'rampart', 'tramp'].includes(s)
        )
      ),
      body: S.has('caviar') ? 'fish' : k.body,
      layers: k.layers.filter(l => l !== 'egg'),
    });
    fs.shape =
      fs.layers.filter(l => ['cushion', 'ghost', 'bite', 'star'].includes(l)).pop() || 'orb';
    const n = Math.min(6 + 2 * (c('egg') - 1), 12);
    for (let i = 0; i < n; i++)
      G.projs.push(
        makeProj(fs, x, y - p.r - 8, -Math.PI / 2 + rnd(-1.3, 1.3), {
          r: S.has('caviar') ? 9 : 6,
          speed: rnd(320, 560),
          g: 900,
          frag: true,
          life: 2.5,
          dm: 0.6,
        })
      );
    for (let i = 0; i < 10; i++)
      part('chunk', x, y, rnd(-200, 200), rnd(-350, -100), 1, 0, i % 3 ? '#fff4dc' : '#ffcf3a', {
        g: 1300,
        w: rnd(5, 10),
        h: rnd(4, 8),
        vr: rnd(-10, 10),
      });
    txt(x, y - 30, 'CRAC !', '#fff1cf', 26);
    sfx('break');
  }
  if (S.has('blackhole'))
    G.zones.push({ t: 'hole', x, y: Math.min(y, GROUND - 60), r: 220, l: 3.5, ml: 3.5 });
  if (c('star')) {
    const R = 90 + 25 * c('star');
    for (let i = 0; i < 50; i++) {
      const a = Math.random() * TAU,
        v = rnd(150, 420);
      part(
        'spark',
        x,
        y,
        Math.cos(a) * v,
        Math.sin(a) * v,
        rnd(0.6, 1.1),
        rnd(3, 6),
        S.has('starlove')
          ? '#ff6fae'
          : ['#fff07a', '#ff6fae', '#62f0dd', '#b48cff', '#ff8a3d'][i % 5],
        { g: 200, drag: 1.5 }
      );
    }
    if (S.has('starlove')) {
      for (const e of G.enemies)
        if (!e.dead && Math.hypot(e.x - x, e.y - e.h / 2 - y) < R + 60) charm(e);
    } else aoe(x, y, R, 18);
    sfx('boom');
    txt(x, y - 40, 'PAF !', '#fff07a', 34);
  }
  if (c('gravity') && why === 'ground') {
    const R = 90 + 40 * c('gravity');
    part('ring', x, GROUND, 0, 0, 0.5, R, '#a68bff');
    aoe(x, GROUND - 20, R, 22, 500);
    G.shake = Math.max(G.shake, 10 + 4 * c('gravity'));
    txt(x, GROUND - 60, 'BOUM !', '#cdb8ff', 40);
    sfx('boom');
    chips(x, GROUND, '#5a7b3a', 12);
  }
  if (S.has('steam')) {
    for (let i = 0; i < 30; i++)
      part(
        'smoke',
        x + rnd(-60, 60),
        y + rnd(-40, 40),
        rnd(-120, 120),
        rnd(-120, 10),
        rnd(1, 1.8),
        rnd(20, 40),
        'rgba(240,245,255,.55)',
        { drag: 1 }
      );
    for (const e of G.enemies)
      if (!e.dead && Math.hypot(e.x - x, e.y - y) < 190) {
        e.stun = 2.5;
        dmgEnemy(e, 10, e.x);
      }
    txt(x, y - 40, 'PSCHHH !', '#e8f4ff', 32);
    sfx('boom');
  }
  if (S.has('rocket')) {
    aoe(x, y, 120, 30, 350);
    for (let i = 0; i < 24; i++)
      part('fire', x, y, rnd(-300, 300), rnd(-300, 200), rnd(0.4, 0.8), rnd(10, 22), 'orange', {
        drag: 2,
      });
    G.shake = Math.max(G.shake, 12);
    txt(x, y - 40, 'BADABOUM !', '#ffb36b', 34);
    sfx('boom');
  }
  if (c('wall') && !p.frag) spawnWall(x, S);
  if (S.has('pyramid') && !p.frag) spawnPyramid(x);
  if (c('tree'))
    addPlant(
      x,
      S.has('xmas') ? 'xmas' : S.has('money') ? 'money' : Math.random() < 0.35 ? 'pine' : 'tree'
    );
  if (k.body === 'coin' && !p.love) addCoin(x, Math.min(y, GROUND - 12), rnd(-60, 60), -260);
  if (c('flame'))
    for (let i = 0; i < 10; i++)
      part(
        'fire',
        x,
        y,
        rnd(-150, 150),
        rnd(-220, -40),
        rnd(0.3, 0.7),
        rnd(8, 16),
        S.has('icefire') ? 'blue' : 'orange'
      );
  if (c('snow')) burst(x, y, '#e6fbff', 12, 200, 'snow', 5);
  if (why !== 'air' && !c('egg')) sfx('hit');
}
