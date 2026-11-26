/* Scribble Wizards — projectiles.js
   Spell projectiles: movement, collisions, hits, impacts, stacking levels, synergies and zones. */
/* ---------- projectiles ---------- */
function projSpeed(spec, o = {}) {
  let s = (o.speed || 580) * Math.pow(1.5, spec.n.arrow || 0) * (o.spd || 1);
  if (spec.syn.has('ram')) s *= 1.3;
  return o.speed == null ? Math.min(s, 2300) : s;
}
function projGrav(spec) {
  let g = 0;
  if (spec.body === 'square') g += 650;
  if (spec.body === 'coin') g += 520;
  if (spec.body === 'fish') g += 300;
  return g + 1500 * (spec.n.gravity || 0);
}
function makeProj(spec, x, y, a, o = {}) {
  const c = k => spec.n[k] || 0,
    S = spec.syn,
    dk = spec.dark;
  const spd = projSpeed(spec, o);
  let r = (o.r || 11) * Math.pow(1.65, c('mountain'));
  if (spec.body === 'square') r *= Math.pow(1.15, c('square') - 1);
  if (spec.body === 'fish') r *= Math.pow(1.25, c('fish') - 1);
  if (o.pellet) r *= 0.62;
  r = Math.min(r, 95);
  const g = o.g != null ? o.g : projGrav(spec);
  let dmg =
    ((o.pellet ? 11 : 20) * (spec.body === 'square' ? 1 + c('square') : 1) +
      (spec.body === 'fish' ? 6 * (c('fish') - 1) : 0) +
      (spec.body === 'coin' ? 4 * (c('coin') - 1) : 0)) *
    Math.pow(1.35, c('mountain')) *
    (o.dm || 1);
  let pierce =
    8 * (spec.saw | 0) +
    2 * c('bite') +
    (S.has('ram') ? 4 : 0) +
    (c('ghost') > 1 ? 3 * (c('ghost') - 1) : 0);
  if (dk && spec.body === 'fish') {
    pierce += 3;
    dmg += 8;
  }
  let fish = FISH[(Math.random() * FISH.length) | 0];
  if (S.has('sawfish')) fish = SAWFISH;
  else if (dk) fish = PIRANHA;
  else if (c('fish') >= 3) fish = WHALE;
  if (S.has('puffer')) fish = FISH[3];
  if (LV(spec, 'arrow') >= 2) pierce += 2;
  return {
    spec,
    owner: o.owner || null,
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
    bounces: (o.bounces != null ? o.bounces : 3 * c('cushion')) + ((spec.saw | 0) >= 2 ? 2 : 0),
    pierce,
    boom: (spec.saw | 0) >= 3,
    roll: LV(spec, 'mountain') >= 2,
    hit: new Map(),
    wa: 0,
    fish,
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
const isFoe = (e, own) => !e.dead && !e.ko && !e.charmed && !e.poss && !(own && e.wz === own);
function nearestEnemy(x, y, R, own) {
  let b = null,
    bd = R * R;
  for (const e of G.enemies) {
    if (!isFoe(e, own)) continue;
    const d = (e.x - x) ** 2 + (e.y - e.h / 2 - y) ** 2;
    if (d < bd) {
      bd = d;
      b = e;
    }
  }
  return b;
}

function aimInfo(w) {
  const sx = w.x + 12 * w.side,
    sy = GROUND - 72;
  let a;
  if (G.mode === 'arena' && w === WZ[0]) {
    a = Math.atan2(G.aim.y - sy, G.aim.x - sx);
    if (G.aim.x < sx) a = a < 0 ? -1.45 : 1.2;
    a = clamp(a, -1.45, 1.2);
  } else a = w.aim;
  return { sx, sy, a };
}
function fire(w, ang) {
  const spec = compW(w),
    { sx, sy, a: a0 } = aimInfo(w),
    a = ang != null ? ang : a0,
    tx = sx + Math.cos(a) * 58,
    ty = sy + Math.sin(a) * 58;
  G.cast.push({ x: tx, y: ty, t: 0, a, w });
  for (const s of spec.syn)
    if (!discovered.has(s)) {
      discovered.add(s);
      store.set('sw_disc', [...discovered]);
      banner('Synergie découverte !', SYNM[s].n);
      sfx('win');
      renderBook();
      renderReading();
    }
  const nd = spec.n.dots || 0,
    o = { owner: w };
  if (nd) {
    const cnt = Math.min(5 + 3 * (nd - 1), 14),
      spread = 0.45 + 0.1 * nd;
    for (let i = 0; i < cnt; i++)
      G.projs.push(
        makeProj(
          spec,
          tx,
          ty,
          a + (i / (cnt - 1) - 0.5) * spread + rnd(-0.04, 0.04),
          Object.assign(
            {
              pellet: true,
              spd: rnd(0.85, 1.1),
              bounces: LV(spec, 'dots') >= 2 ? 1 + 3 * (spec.n.cushion || 0) : undefined,
            },
            o
          )
        )
      );
  } else if (spec.dark && spec.n.zigzag) {
    const nb = Math.min(2 + spec.n.zigzag, 7);
    for (let i = 0; i < nb; i++)
      G.projs.push(
        makeProj(
          spec,
          tx,
          ty,
          a + (i - (nb - 1) / 2) * 0.22,
          Object.assign({ r: 8, spd: rnd(0.9, 1.1) }, o)
        )
      );
  } else {
    const p = makeProj(spec, tx, ty, a, o);
    G.projs.push(p);
    if (spec.body === 'fish')
      txt(tx + 40 * w.side, ty - 30, p.fish.n + ' !', spec.dark ? '#ff8a8a' : '#9fe3ff', 22);
    if (LV(spec, 'triangle') >= 3)
      for (const d of [-0.22, 0.22]) G.projs.push(makeProj(spec, tx, ty, a + d, o));
    if (spec.body === 'fish' && LV(spec, 'fish') === 2)
      for (const d of [-0.09, 0.09])
        G.projs.push(
          makeProj(spec, tx, ty, a + d, Object.assign({ r: 6, spd: 0.95, frag: true }, o))
        );
  }
  if (nd && LV(spec, 'dots') >= 3)
    later(0.2, () => {
      const cnt = Math.min(5 + 3 * (nd - 1), 14),
        spread = 0.45 + 0.1 * nd,
        { a: aa } = aimInfo(w),
        an = ang != null ? w.aim : aa;
      for (let i = 0; i < cnt; i++)
        G.projs.push(
          makeProj(
            spec,
            tx,
            ty,
            an + (i / (cnt - 1) - 0.5) * spread + rnd(-0.05, 0.05),
            Object.assign({ pellet: true, spd: rnd(0.85, 1.1) }, o)
          )
        );
      sfx('cast');
    });
  if (spec.n.arrow) sfx('whoosh');
  if (spec.n.shield && (w.shieldCd || 0) <= 0) {
    const n = spec.n.shield,
      L = LV(spec, 'shield');
    w.shield = L >= 2 || n >= 2 ? 5 : 3;
    w.shieldCd = w.shield + (G.mode === 'duel' ? 4 : 2);
    w.shieldLv = L;
    w.shieldDark = spec.dark;
    w.shieldBounce = spec.syn.has('bouncyshield');
    w.shieldIce = spec.syn.has('igloo');
    txt(
      w.x,
      GROUND - 220,
      spec.dark ? "Bouclier d'épines !" : w.shieldIce ? 'Igloo !' : 'Bouclier !',
      '#9fe3ff',
      26
    );
    sfx('shield');
  }
  w.cd = w.haste > 0 ? 0.15 : 0.3;
  w.recoil = 1;
  sfx(spec.dark ? 'dcast' : 'cast');
  burst(tx, ty, spellCol(spec), 14, 220);
}

function trail(p, dt) {
  const k = p.spec,
    c = n => k.n[n] || 0,
    S = k.syn,
    x = p.x,
    y = p.y,
    r = p.r,
    dk = k.dark;
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
  if (dk && Math.random() < 0.5)
    part('smoke', x, y, rnd(-20, 20), rnd(-20, 20), 0.6, r * 0.8, 'rgba(40,10,60,.45)');
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
        dk ? 'purple' : S.has('icefire') ? 'blue' : 'orange'
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
      dk ? '#9dffd6' : '#e6fbff',
      { vr: rnd(-4, 4) }
    );
  if (c('arrow')) part('streak', x, y, 0, 0, 0.18, r, col, { a: Math.atan2(p.vy, p.vx) });
  if (c('ghost') && Math.random() < 0.5)
    part(
      'smoke',
      x,
      y,
      rnd(-20, 20),
      rnd(-30, -10),
      0.6,
      r * 0.7,
      dk ? 'rgba(150,255,150,.25)' : 'rgba(220,230,255,.25)'
    );
  if (k.body === 'fish' && Math.random() < 0.4)
    part('drop', x, y, rnd(-80, 80), rnd(-120, 0), 1, 3, dk ? '#ff6b6b' : '#7fd6ff', { g: 900 });
  if (k.body === 'coin' || c('star'))
    part(
      'star',
      x + rnd(-r, r),
      y + rnd(-r, r),
      0,
      0,
      0.5,
      rnd(4, 8),
      dk
        ? '#b8ff3c'
        : c('star')
          ? ['#fff07a', '#ff6fae', '#62f0dd'][(Math.random() * 3) | 0]
          : '#fff2a8'
    );
  if (S.has('rocket'))
    part('smoke', x, y, rnd(-30, 30), rnd(-30, 30), 0.9, r * 0.8, 'rgba(170,170,190,.35)');
  if (c('bolt') && Math.random() < 0.3)
    part(
      'spark',
      x + rnd(-r, r) * 1.5,
      y + rnd(-r, r) * 1.5,
      0,
      0,
      0.12,
      3,
      dk ? '#c27bff' : '#fff59a'
    );
  if (c('note') && Math.random() < 0.15)
    part('zz', x, y, rnd(-30, 30), rnd(-60, -20), 0.9, 18, '#ff9de2', { ch: '♪' });
  if (c('portal') && Math.random() < 0.5)
    part('spark', x + rnd(-r, r), y + rnd(-r, r), 0, 0, 0.4, 3, '#c27bff');
  if (c('shield') && Math.random() < 0.3)
    part('spark', x, y, rnd(-40, 40), rnd(-40, 40), 0.4, 3, '#9fe3ff');
  if (c('bomb') && Math.random() < 0.6)
    part('spark', x, y - r, rnd(-40, 40), rnd(-80, -20), 0.3, 3, '#ffd36b');
  if (c('cloud') && Math.random() < 0.3)
    part('drop', x, y, rnd(-20, 20), rnd(80, 160), 0.6, 2, '#9fd8ff', { g: 600 });
  if (c('tornado') && Math.random() < 0.3)
    part('smoke', x, y, rnd(-60, 60), rnd(-60, 60), 0.5, r * 0.6, 'rgba(200,235,230,.3)');
  if (c('web') && Math.random() < 0.3)
    part('straw', x, y, 0, 0, 0.5, r * 1.4, 'rgba(255,255,255,.7)', { vr: rnd(-3, 3) });
  if (c('potion') && Math.random() < 0.3)
    part(
      'dot',
      x,
      y,
      rnd(-30, 30),
      rnd(-60, -20),
      0.6,
      3,
      ['#7cf27c', '#ff9de2', '#8fe3ff'][(Math.random() * 3) | 0]
    );
  if (c('tree') && !dk) {
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
    const e = nearestEnemy(p.x, p.y, 900, p.owner);
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
            dark: k.dark,
          },
          p.x,
          p.y + p.r,
          Math.PI / 2,
          { r: 8, speed: 80, g: 900, life: 4, owner: p.owner }
        )
      );
    }
  }
  if (LV(k, 'zigzag') >= 2 && !p.split && !p.frag && p.t > 0.4) {
    p.split = true;
    const n = LV(k, 'zigzag') >= 3 ? 2 : 1;
    for (let i = 0; i < n; i++)
      G.projs.push(
        makeProj(k, p.x, p.y, Math.atan2(p.vy, p.vx) + rnd(-0.9, 0.9), {
          owner: p.owner,
          frag: true,
          r: p.r * 0.85,
        })
      );
    burst(p.x, p.y, '#ff9de2', 10, 200);
    sfx('pop');
  }
  if (p.boom && p.t > 0.75 && p.owner) {
    if (!p.back) {
      p.back = true;
      p.hit.clear();
      p.pierce = 99;
      p.g = 0;
    }
    const ow = p.owner,
      dx = ow.x - p.x,
      dy = GROUND - 90 - p.y,
      d = Math.hypot(dx, dy) || 1,
      sp = Math.max(500, Math.hypot(p.vx, p.vy));
    p.vx += ((dx / d) * sp - p.vx) * Math.min(1, 4 * dt);
    p.vy += ((dy / d) * sp - p.vy) * Math.min(1, 4 * dt);
    if (d < 60) {
      p.dead = true;
      txt(ow.x, GROUND - 200, 'Rattrapée !', '#e9edf3', 22);
      sfx('click');
      return;
    }
  }
  if (p.rolling) {
    p.vy = 0;
    p.by = GROUND - p.r;
    p.sq = 0;
    if (Math.random() < 0.4)
      part(
        'smoke',
        p.x,
        GROUND - 4,
        rnd(-40, 40),
        rnd(-40, -10),
        0.6,
        rnd(8, 14),
        'rgba(200,190,170,.5)'
      );
  }
  if (LV(k, 'arrow') >= 3) {
    p.drop += dt;
    if (p.drop > 0.1) {
      p.drop = 0;
      part('sring', p.x, p.y, 0, 0, 0.4, p.r * 3, '#bfe9ff');
    }
  }
  if (c('portal') && !p.ported && p.t > 0.3) {
    p.ported = true;
    const L = LV(k, 'portal') || 1,
      tg = nearestFoes(p.x, p.y, L >= 3 ? 4 : L >= 2 ? 2 : 1, p.owner);
    if (tg.length) {
      const ks = Object.assign({}, k, { n: Object.assign({}, k.n, { portal: 0 }) });
      G.zones.push({ t: 'pfx', x: p.x, y: p.y, r: 40, l: 0.6, ml: 0.6 });
      tg.forEach(e => {
        const tx = clamp(e.x + rnd(-20, 20), 40, W - 40);
        G.zones.push({ t: 'pfx', x: tx, y: 140, r: 50, l: 0.7, ml: 0.7 });
        const np = makeProj(ks, tx, 150, Math.PI / 2, { owner: p.owner });
        np.r = p.r;
        np.dmg = p.dmg;
        G.projs.push(np);
      });
      p.dead = true;
      sfx('portal');
      return;
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
      part('heart', p.x, p.y, rnd(-30, 30), rnd(-60, -20), 0.8, 10, k.dark ? '#8a1d4a' : '#ff6fae');
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
  if (!p.rolling && y + r >= GROUND && p.vy > -60) {
    p.by -= y + r - GROUND;
    if (p.roll) {
      p.rolling = true;
      p.vy = 0;
      p.g = 0;
      p.vx = Math.sign(p.vx || 1) * Math.max(Math.abs(p.vx), 380);
      p.life = p.t + 2.4;
      p.pierce += 99;
      sfx('rumble');
      txt(x, GROUND - 60, 'Ça roule !', '#d9cfa0', 24);
      return true;
    }
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
    if (LV(k, 'bite') >= 2) {
      hitProp(q, p.dmg * 2.2, p, x, y);
      txt(x, y - 20, 'CROC !', '#ffd84d');
      sfx('croc');
      continue;
    }
    hitProp(q, p.dmg * (1 + 0.4 * (k.saw | 0)), p, x, y);
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
    if (!isFoe(e, p.owner)) continue;
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
    for (let i = 0; i < 3; i++)
      addCoin(x, y - 10, rnd(-200, 200), rnd(-500, -250), p.spec.dark, p.owner);
    sfx('coin');
  }
  if (S.has('snowball')) {
    p.r = Math.min(p.r * 1.25, 95);
    p.dmg *= 1.2;
    burst(x, y, '#fff', 14, 200, 'snow', 5);
  }
  if (p.spec.n.tree && !p.spec.dark && y >= GROUND - 2) addPlant(x, 'flower');
}
function steal(p, amt, x, y) {
  const w = p.owner;
  if (!w) return;
  for (let i = 0; i < 6; i++)
    part(
      'spark',
      x,
      y,
      (w.x - x) * rnd(1, 1.6),
      (GROUND - 90 - y) * rnd(1, 1.6),
      0.6,
      4,
      '#ff3b6b'
    );
  if (G.mode === 'duel' && w.ent) {
    const h = Math.min(w.ent.max - w.ent.hp, amt * 0.4);
    if (h > 0) {
      w.ent.hp += h;
      txt(w.x, GROUND - 200, '+' + Math.round(h), '#ff6b9a', 24);
    }
  } else {
    G.steal += amt;
    if (G.steal >= 90) {
      G.steal = 0;
      if (G.hearts < G.maxHearts) {
        G.hearts++;
        txt(w.x, GROUND - 200, '+1 ♥', '#ff6b9a', 30);
      }
    }
  }
}

function hitEnemy(e, p, x, y) {
  const k = p.spec,
    S = k.syn,
    c = n => k.n[n] || 0,
    dk = k.dark,
    mage = e.kind === 'mage';
  if (mage && e.wz.shield > 0) {
    const w = e.wz;
    txt(e.x, e.y - e.h - 30, 'BLOQUÉ !', '#9fe3ff', 28);
    sfx('shield');
    burst(x, y, '#9fe3ff', 14, 260);
    const atk = p.owner && p.owner.ent;
    if (atk && !atk.ko) {
      if (w.shieldLv >= 3 || w.shieldDark) dmgEnemy(atk, p.dmg * 0.5, atk.x);
      if (w.shieldIce) atk.freeze = Math.max(atk.freeze || 0, 0.8);
    }
    return;
  }
  if (p.love) {
    charm(e);
    return;
  }
  let d = p.dmg;
  if (c('bite')) {
    d += 12 * c('bite');
    txt(x, y - 30, 'CROC !', dk ? '#e8e2d0' : '#ffd84d');
    sfx('croc');
  }
  if (k.saw) {
    d *= 1.3;
    burst(x, y, '#ffe9a8', 10, 320);
  }
  dmgEnemy(e, d, x);
  if (dk && (c('heart') || c('bite')))
    steal(p, d * (0.6 + 0.4 * (c('heart') + c('bite') - 1)), x, y);
  if (!mage && e.kind !== 'golem' && !EK[e.kind].fly) {
    e.vx +=
      Math.sign(p.vx || 1) *
      120 *
      (k.body === 'square' ? 1.5 + c('square') : 1) *
      (S.has('ram') ? 3 : 1) *
      Math.pow(1.3, c('mountain'));
  }
  if (c('flame')) {
    addBurn(e, c('flame'), dk, S.has('icefire'));
  }
  if (c('snow')) {
    const cap = mage ? 4 : 8,
      was = e.freeze > 0 ? e.freeze : 0;
    e.freeze = Math.min(cap, was + 1.4 + c('snow') * 0.6);
    if (was > 0)
      txt(e.x, e.y - e.h - 36, 'Gel +' + (e.freeze - was).toFixed(1) + ' s', '#bff0ff', 20);
    e.brittle = dk;
    sfx('freeze');
    burst(x, y, dk ? '#9dffd6' : '#dff8ff', 10, 200, 'snow', 5);
  }
  if (c('ghost') && dk) {
    if (mage) {
      e.stun = Math.max(e.stun || 0, 1.5);
      txt(e.x, e.y - e.h - 20, 'Paralysé !', '#9dff9d', 26);
    } else if (e.kind !== 'golem') {
      e.poss = 7 * c('ghost');
      e.burn = 0;
      txt(e.x, e.y - e.h - 20, 'Possédé !', '#9dff9d', 26);
      sfx('evil');
    }
  }
  if (c('bubble')) {
    if (dk) {
      if (!p.zoned) {
        p.zoned = true;
        poison(x, y, p.owner, c('bubble'));
      }
    } else if (e.kind !== 'golem') {
      e.bubble = Math.min(mage ? 4 : 9, (e.bubble > 0 ? e.bubble : 0) + 2 + c('bubble'));
      e.air = false;
      sfx('pop');
    }
  }
  if (c('hourglass') && !p.zoned) {
    p.zoned = true;
    if (dk) haste(p.owner, c('hourglass'));
    else
      G.zones.push({
        t: 'slow',
        x,
        y,
        r: 150 * (1 + 0.35 * (c('hourglass') - 1)),
        l: 5,
        ml: 5,
        own: p.owner,
        pow: c('hourglass'),
      });
  }
  if (c('bolt')) chain(e, c('bolt') + (dk ? 1 : 0), p.owner, dk, 14 + 6 * (c('bolt') - 1));
  const lv = n => LV(k, n);
  if (c('note') && !e.dead && !e.ko) {
    if (dk) {
      if (mage) e.stun = Math.max(e.stun || 0, 1);
      else if (e.kind !== 'golem') {
        e.poss = 3 * c('note');
        txt(e.x, e.y - e.h - 20, 'Chant maudit !', '#c34dff', 24);
        sfx('evil');
      }
    } else {
      dance(e, mage ? 1.2 : 2);
      sfx('note');
      if (S.has('serenade')) charm(e);
      if (lv('note') === 2 || S.has('rock'))
        for (const o of G.enemies)
          if (o !== e && isFoe(o, p.owner) && Math.hypot(o.x - e.x, o.y - e.y) < 190) {
            dance(o, o.kind === 'mage' ? 1 : 2);
            if (S.has('rock')) {
              G.bolts.push({ pts: jag(e.x, e.y - e.h / 2, o.x, o.y - o.h / 2), l: 0.3 });
              dmgEnemy(o, 12, o.x);
            }
          }
      if (lv('note') >= 3 && !p.concert) {
        p.concert = true;
        for (const o of G.enemies) if (isFoe(o, p.owner)) dance(o, o.kind === 'mage' ? 1.2 : 2.5);
        txt(W / 2, H / 2 - 120, 'CONCERT !', '#ff9de2', 48);
        sfx('fanfare');
      }
      if (S.has('rock')) {
        sfx('zap');
        dmgEnemy(e, 10, e.x);
        txt(e.x, e.y - e.h - 44, "Rock'n'roll !", '#fff59a', 26);
      }
    }
  }
  if (lv('web') >= 3 && !e.dead && !e.ko && e.kind !== 'golem') {
    e.cocoon = mage ? 1.5 : 4;
    e.stun = Math.max(e.stun || 0, e.cocoon);
    txt(e.x, e.y - e.h - 20, 'Cocon !', '#ffffff', 26);
    sfx('web');
  }
  if (lv('heart') === 2 && !e.dead) {
    e.stun = Math.max(e.stun || 0, 0.8);
    for (let i = 0; i < 4; i++)
      part('heart', x, y, rnd(-80, 80), rnd(-120, -30), 0.8, 9, '#ff6fae');
  }
  if (lv('heart') >= 3 && !e.dead && !e.ko) charm(e);
  if (lv('bite') >= 3 && !e.dead && !e.ko) {
    if (!mage && e.kind !== 'golem') {
      txt(e.x, e.y - e.h - 20, 'GLOUPS !', '#ffd84d', 36);
      sfx('gulp');
      dmgEnemy(e, e.hp + 1, e.x, true);
    } else dmgEnemy(e, 40, e.x);
  }
  if (lv('ghost') >= 3 && !e.dead && !e.ko) {
    if (mage) e.stun = Math.max(e.stun || 0, 1);
    else if (e.kind !== 'golem') {
      e.fear = 3;
      txt(e.x, e.y - e.h - 20, 'Hiiii !', '#dfe7ff', 26);
    }
  }
  if (lv('cushion') === 2 && !e.dead) {
    e.stun = Math.max(e.stun || 0, 0.5);
    for (let i = 0; i < 8; i++)
      part('leaf', x, y, rnd(-150, 150), rnd(-200, -50), 1.5, 6, '#ffffff', {
        g: 120,
        vr: rnd(-6, 6),
      });
  }
  if (lv('cushion') >= 3 && !e.dead && !e.ko) {
    e.stun = Math.max(e.stun || 0, mage ? 1.5 : 3);
    e.sleep = e.stun;
    txt(e.x, e.y - e.h - 20, 'Zzz…', '#c8d8ff', 28);
    sfx('snore');
  }
  if (lv('bubble') >= 3 && !p.aqua) {
    p.aqua = true;
    for (const o of G.enemies)
      if (isFoe(o, p.owner) && o.kind !== 'golem' && Math.hypot(o.x - x, o.y - y) < 170) {
        o.bubble = Math.max(o.bubble || 0, o.kind === 'mage' ? 2.5 : 3);
        o.air = false;
      }
    txt(x, y - 50, 'Aquarium !', '#a6f6ff', 30);
    sfx('pop');
  }
  if (lv('hourglass') >= 3 && !p.stopped) {
    p.stopped = true;
    timeStop(p.owner);
  }
  if (k.body === 'fish') {
    sfx('splash');
    for (let i = 0; i < 10; i++)
      part('drop', x, y, rnd(-200, 200), rnd(-350, -80), 1, rnd(3, 6), dk ? '#ff6b6b' : '#7fd6ff', {
        g: 1000,
      });
    txt(x, y - 50, dk ? 'CHOMP' : 'SPLOTCH', dk ? '#ff8a8a' : '#7fd6ff', 22);
  }
  burst(x, y, spellCol(k), 8, 240);
  sfx('hit');
}
function timeStop(own) {
  G.timeStop = 2.5;
  for (const o of G.enemies)
    if (isFoe(o, own)) o.stun = Math.max(o.stun || 0, o.kind === 'mage' ? 1.6 : 2.5);
  txt(W / 2, H / 2 - 120, "Le temps s'arrête !", '#ffe2a8', 44);
  sfx('timestop');
}
function haste(w, n = 1) {
  if (!w) return;
  w.haste = Math.min(20, Math.max(w.haste, 0) + 5 * n);
  txt(w.x, GROUND - 210, 'Plus vite ! ' + Math.ceil(w.haste) + ' s', '#ff8a8a', 26);
  sfx('evil');
}
function addBurn(e, n, dk, blue, quiet) {
  const was = e.burn > 0 ? e.burnS || 1 : 0;
  if (!was && !quiet) sfx('fireup');
  e.burnS = Math.min(10, was + n);
  e.burn = Math.max(e.burn || 0, dk ? 6 : 3.2);
  e.blue = blue;
  e.curse = dk;
  if (e.burnS > 1 && !quiet)
    txt(e.x, (e.y || GROUND) - (e.h || 60) - 36, 'Feu x' + e.burnS, dk ? '#e0a6ff' : '#ffb36b', 22);
}
function poison(x, y, own, n = 1) {
  G.zones.push({
    t: 'poison',
    x,
    y: Math.min(y, GROUND - 40),
    r: 110 * (1 + 0.35 * (n - 1)),
    l: 4,
    ml: 4,
    own,
    pow: n,
  });
  for (let i = 0; i < 20; i++)
    part(
      'smoke',
      x + rnd(-50, 50),
      y + rnd(-30, 30),
      rnd(-60, 60),
      rnd(-60, 20),
      1.2,
      rnd(16, 28),
      'rgba(120,255,90,.35)',
      { drag: 1.5 }
    );
  sfx('pop');
}
function dmgEnemy(e, d, x, silent) {
  if (e.dead || e.ko) return;
  if (e.kind === 'mage' && e.wz.shield > 0) d *= 0.15;
  if (e.freeze > 0 && e.brittle) {
    d *= 2;
    if (!silent && Math.random() < 0.5) txt(e.x, e.y - e.h - 40, 'CRAC !', '#9dffd6', 22);
  }
  e.hp -= d;
  if (!silent) {
    e.flash = 0.12;
    txt(e.x + rnd(-10, 10), e.y - e.h - 14, String(Math.round(d)), '#fff', 20);
  }
  if (e.kind === 'mage') e.wz.hurt = Math.max(e.wz.hurt, 0.35);
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
  if (e.kind === 'mage') {
    e.hp = 0;
    e.ko = true;
    e.koT = 0;
    e.burn = 0;
    e.freeze = 0;
    e.bubble = 0;
    e.stun = 0;
    duelEnd(e);
    return;
  }
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
  if (e.kind === 'mage') {
    e.loveT = 2.5;
    txt(e.x, e.y - e.h - 10, '♥ Amoureux ♥', '#ff6fae', 28);
    for (let i = 0; i < 8; i++)
      part('heart', e.x, e.y - e.h / 2, rnd(-120, 120), rnd(-200, -60), 1, 12, '#ff6fae');
    sfx('pop');
    return;
  }
  if (e.charmed || (e.kind === 'golem' && e.hp > e.max * 0.5)) {
    if (e.kind === 'golem') dmgEnemy(e, 15, e.x);
    return;
  }
  e.charmed = true;
  e.poss = 0;
  e.burn = 0;
  e.freeze = 0;
  e.bubble = 0;
  txt(e.x, e.y - e.h - 10, '♥', '#ff6fae', 40);
  for (let i = 0; i < 8; i++)
    part('heart', e.x, e.y - e.h / 2, rnd(-120, 120), rnd(-200, -60), 1, 12, '#ff6fae');
  sfx('pop');
}
function chain(e0, n, own, dk, bd0 = 14) {
  let cur = e0;
  const done = new Set([e0]);
  sfx('zap');
  for (let i = 0; i < 2 + n; i++) {
    let best = null,
      bd = 280 * 280;
    for (const e of G.enemies) {
      if (done.has(e) || !isFoe(e, own)) continue;
      const d = (e.x - cur.x) ** 2 + (e.y - cur.y) ** 2;
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    const x1 = cur.x,
      y1 = cur.y - cur.h / 2;
    if (!best) {
      G.bolts.push({ pts: jag(x1, y1, x1 + rnd(-60, 60), GROUND), l: 0.25, dk });
      break;
    }
    G.bolts.push({ pts: jag(x1, y1, best.x, best.y - best.h / 2), l: 0.3, dk });
    done.add(best);
    dmgEnemy(best, bd0, best.x);
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
function aoe(x, y, R, d, kb, own, props = true) {
  for (const e of G.enemies) {
    if (!isFoe(e, own)) continue;
    const dx = e.x - x,
      dy = e.y - e.h / 2 - y;
    if (Math.hypot(dx, dy) < R + e.rad) {
      dmgEnemy(e, d, e.x);
      if (kb && e.kind !== 'golem' && e.kind !== 'mage' && !EK[e.kind].fly) {
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
    col = spellCol(k),
    dk = k.dark,
    own = p.owner;
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
    if (dk) {
      fs.n.magnet = (fs.n.magnet || 0) + 1;
      if (!S.has('caviar')) fs.shape = 'spider';
    }
    const chick = !dk && LV(k, 'egg') >= 2 && !S.has('caviar');
    if (chick) fs.shape = 'chick';
    const n = Math.min(6 + 2 * (c('egg') - 1), 12);
    for (let i = 0; i < n; i++)
      G.projs.push(
        makeProj(fs, x, y - p.r - 8, -Math.PI / 2 + rnd(-1.3, 1.3), {
          r: S.has('caviar') ? 9 : dk || chick ? 8 : 6,
          speed: rnd(320, 560),
          g: 900,
          frag: true,
          life: dk || chick ? 4 : 2.5,
          dm: 0.6,
          owner: own,
          bounces: dk || chick ? 3 : undefined,
        })
      );
    for (let i = 0; i < 10; i++)
      part(
        'chunk',
        x,
        y,
        rnd(-200, 200),
        rnd(-350, -100),
        1,
        0,
        dk ? (i % 3 ? '#3a2a4a' : '#9dff6a') : i % 3 ? '#fff4dc' : '#ffcf3a',
        { g: 1300, w: rnd(5, 10), h: rnd(4, 8), vr: rnd(-10, 10) }
      );
    txt(x, y - 30, 'CRAC !', dk ? '#d9d2ff' : '#fff1cf', 26);
    sfx('break');
  }
  if (S.has('blackhole'))
    G.zones.push({ t: 'hole', x, y: Math.min(y, GROUND - 60), r: 220, l: 3.5, ml: 3.5, own });
  if (c('star')) {
    if (dk) {
      G.zones.push({
        t: 'hole',
        x,
        y: Math.min(y, GROUND - 40),
        r: 190 * (1 + 0.25 * (c('star') - 1)),
        l: 1.3,
        ml: 1.3,
        own,
        boom: c('star'),
      });
      txt(x, y - 40, 'SHHHLURP', '#c39bff', 30);
      sfx('evil');
    } else {
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
          if (isFoe(e, own) && Math.hypot(e.x - x, e.y - e.h / 2 - y) < R + 60) charm(e);
      } else aoe(x, y, R, 18 * c('star'), 0, own);
      sfx('boom');
      txt(x, y - 40, 'PAF !', '#fff07a', 34);
    }
  }
  if (c('gravity') && why === 'ground') {
    const R = 90 + 40 * c('gravity');
    part('ring', x, GROUND, 0, 0, 0.5, R, dk ? '#7a3cff' : '#a68bff');
    aoe(x, GROUND - 20, R, 22, 500, own);
    G.shake = Math.max(G.shake, 10 + 4 * c('gravity'));
    txt(x, GROUND - 60, 'BOUM !', '#cdb8ff', 40);
    sfx('boom');
    chips(x, GROUND, '#5a7b3a', 12);
    if (dk && !S.has('blackhole'))
      G.zones.push({
        t: 'hole',
        x,
        y: GROUND - 60,
        r: 180,
        l: 2 * c('gravity'),
        ml: 2 * c('gravity'),
        own,
      });
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
      if (isFoe(e, own) && Math.hypot(e.x - x, e.y - y) < 190) {
        e.stun = 2.5;
        dmgEnemy(e, 10, e.x);
      }
    txt(x, y - 40, 'PSCHHH !', '#e8f4ff', 32);
    sfx('boom');
  }
  if (S.has('rocket')) {
    aoe(x, y, 120, 30, 350, own);
    for (let i = 0; i < 24; i++)
      part(
        'fire',
        x,
        y,
        rnd(-300, 300),
        rnd(-300, 200),
        rnd(0.4, 0.8),
        rnd(10, 22),
        dk ? 'purple' : 'orange',
        { drag: 2 }
      );
    G.shake = Math.max(G.shake, 12);
    txt(x, y - 40, 'BADABOUM !', '#ffb36b', 34);
    sfx('boom');
  }
  if (c('wall') && !p.frag) {
    const n = c('wall'),
      S2 = new Set(S);
    if (LV(k, 'wall') >= 3) S2.add('rampart');
    for (let i = 0; i < n; i++)
      spawnWall(x + (i - (n - 1) / 2) * (LV(k, 'wall') >= 3 ? 95 : 75), S2, dk);
  }
  if (S.has('pyramid') && !p.frag) spawnPyramid(x);
  if (c('tree')) {
    const n = c('tree');
    if (dk) thorns(x, own, n);
    if (!dk || S.has('xmas') || S.has('money')) {
      const ty = S.has('xmas') ? 'xmas' : S.has('money') ? 'money' : null;
      if (n >= 3 && !p.frag) {
        spawnBigTree(x);
      } else if (n >= 3) addPlant(x, ty || 'tree', 1.9);
      else
        for (let i = 0; i < n; i++)
          addPlant(x + (i - (n - 1) / 2) * 70, ty || (Math.random() < 0.35 ? 'pine' : 'tree'));
    }
  }
  if (k.body === 'coin' && !p.love)
    for (let i = 0; i < c('coin'); i++)
      addCoin(
        x,
        Math.min(y, GROUND - 12),
        rnd(-60, 60) + (i ? rnd(-120, 120) : 0),
        -260 - (i ? rnd(0, 200) : 0),
        dk,
        own
      );
  if (c('bubble') && dk && !p.zoned) poison(x, y, own, c('bubble'));
  if (c('hourglass') && dk && !p.zoned) haste(own, c('hourglass'));
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
        dk ? 'purple' : S.has('icefire') ? 'blue' : 'orange'
      );
  applyStackLevels(p, x, y, why);
  extraEnd(p, x, y, why);
  if (c('snow')) burst(x, y, dk ? '#9dffd6' : '#e6fbff', 12, 200, 'snow', 5);
  if (why !== 'air' && !c('egg')) sfx('hit');
}
function applyStackLevels(p, x, y, why) {
  const k = p.spec,
    S = k.syn,
    lv = n => LV(k, n),
    own = p.owner,
    big = !p.frag;
  if (lv('square') >= 2) {
    aoe(x, y, 85, 15, 320, own);
    part('ring', x, Math.min(y, GROUND), 0, 0, 0.45, 90, '#c3c9d3');
    txt(x, y - 40, 'BOUM', '#e0e4ea', 30);
    sfx('boom');
    if (lv('square') >= 3 && big) spawnWall(x, new Set(), false);
  }
  if (lv('triangle') >= 2 && big)
    for (const d of [-1, 0, 1])
      G.projs.push(
        makeProj(k, x, Math.min(y, GROUND - 20), -Math.PI / 2 + d * 0.8, {
          owner: own,
          frag: true,
          r: 7,
          speed: 480,
          g: 600,
          life: 2,
        })
      );
  if (lv('mountain') >= 3) {
    aoe(x, y, 150, 40, 450, own);
    for (let i = 0; i < 24; i++)
      part('fire', x, y, rnd(-300, 300), rnd(-350, 0), rnd(0.4, 0.9), rnd(10, 22), 'orange', {
        drag: 2,
      });
    chips(x, GROUND, '#5a4a3a', 20, true);
    G.shake = Math.max(G.shake, 18);
    txt(x, y - 60, 'MÉTÉORE !', '#ffb36b', 40);
    sfx('boom');
    sfx('rumble');
  }
  if (lv('gravity') >= 2 && why === 'ground' && big) {
    const rock = {
      n: { flame: 1 },
      syn: new Set(),
      layers: ['flame'],
      body: 'orb',
      shape: 'rock',
      saw: 0,
      dark: false,
    };
    for (let i = 0; i < 3 + lv('gravity'); i++)
      later(i * 0.18, () =>
        G.projs.push(
          makeProj(rock, x + rnd(-260, 260), -40, Math.PI / 2 + rnd(-0.2, 0.2), {
            speed: 250,
            g: 1400,
            r: 12,
            owner: own,
            frag: true,
            life: 3,
          })
        )
      );
  }
  if (lv('gravity') >= 3 && why === 'ground') {
    for (const e of G.enemies)
      if (
        isFoe(e, own) &&
        !e.air &&
        e.y >= GROUND - 2 &&
        Math.abs(e.x - x) < 540 &&
        !(e.kind !== 'mage' && EK[e.kind].fly)
      ) {
        e.stun = Math.max(e.stun || 0, 1.5);
        dmgEnemy(e, 15, e.x);
      }
    for (let i = 0; i < 30; i++)
      part('chunk', x + rnd(-500, 500), GROUND, rnd(-60, 60), rnd(-400, -150), 1, 0, '#5a7b3a', {
        g: 1300,
        w: rnd(5, 12),
        h: rnd(4, 8),
        vr: rnd(-8, 8),
      });
    G.shake = Math.max(G.shake, 24);
    txt(x, GROUND - 120, 'SÉISME !', '#d9cfa0', 44);
    sfx('rumble');
  }
  if (lv('flame') >= 2) G.zones.push({ t: 'fire', x, y: GROUND, r: 70, l: 3.5, ml: 3.5, own });
  if (lv('flame') >= 3) {
    for (const e of G.enemies)
      if (isFoe(e, own) && Math.hypot(e.x - x, e.y - e.h / 2 - y) < 140) {
        dmgEnemy(e, 25, e.x);
        addBurn(e, 2, false, false, true);
      }
    for (let i = 0; i < 40; i++)
      part('fire', x, y, rnd(-360, 360), rnd(-360, 200), rnd(0.4, 0.9), rnd(12, 26), 'orange', {
        drag: 2,
      });
    G.shake = Math.max(G.shake, 14);
    txt(x, y - 50, 'FWOOOSH !', '#ffb36b', 38);
    sfx('boom');
  }
  if (lv('snow') === 2) G.zones.push({ t: 'ice', x, y: GROUND, r: 120, l: 5, ml: 5, own });
  if (lv('snow') >= 3) {
    G.zones.push({ t: 'blizzard', x, y: GROUND - 130, r: 270, l: 5, ml: 5, own });
    for (const e of G.enemies)
      if (isFoe(e, own) && Math.abs(e.x - x) < 270)
        e.freeze = Math.max(e.freeze || 0, e.kind === 'mage' ? 1.2 : 1.8);
    txt(x, GROUND - 280, 'BLIZZARD !', '#dff8ff', 40);
    sfx('freeze');
    sfx('whoosh');
  }
  if (lv('arrow') >= 3) {
    aoe(x, y, 140, 10, 600, own);
    part('sring', x, y, 0, 0, 0.6, 200, '#ffffff');
    G.shake = Math.max(G.shake, 10);
    txt(x, y - 40, 'BANG !', '#bfe9ff', 40);
    sfx('boom');
  }
  if (k.body === 'fish' && lv('fish') >= 3) {
    aoe(x, GROUND - 30, 200, 15, 520, own);
    for (let i = 0; i < 40; i++)
      part(
        'drop',
        x + rnd(-80, 80),
        GROUND - 10,
        rnd(-350, 350),
        rnd(-600, -200),
        1.4,
        rnd(4, 8),
        '#7fd6ff',
        { g: 1100 }
      );
    txt(x, GROUND - 150, 'VAGUE !', '#7fd6ff', 40);
    sfx('splash');
  }
  if (lv('egg') >= 3)
    for (let i = 0; i < 4; i++)
      addCoin(x, Math.min(y, GROUND - 12), rnd(-220, 220), rnd(-500, -250));
  if (lv('coin') >= 2 && k.body === 'coin' && big) {
    for (let i = 0; i < 5; i++) later(i * 0.12, () => addCoin(x + rnd(-250, 250), -20, 0, 0));
    if (lv('coin') >= 3) addChest(x);
  }
  if (lv('star') >= 2 && big)
    later(0.35, () => {
      for (let i = 0; i < 40; i++) {
        const a = Math.random() * TAU,
          v = rnd(200, 480);
        part(
          'spark',
          x,
          y - 30,
          Math.cos(a) * v,
          Math.sin(a) * v,
          rnd(0.6, 1.1),
          rnd(3, 6),
          ['#62f0dd', '#ff6fae', '#fff07a'][i % 3],
          { g: 200, drag: 1.5 }
        );
      }
      aoe(x, y, 120, 14, 0, own);
      sfx('boom');
    });
  if (lv('star') >= 3) {
    G.flash = 0.7;
    for (const e of G.enemies) if (isFoe(e, own)) dmgEnemy(e, 15, e.x);
    txt(W / 2, H / 2 - 120, 'SUPERNOVA !', '#ffffff', 50);
    sfx('boom');
  }
  if (lv('bolt') >= 3) {
    const tg = G.enemies
      .filter(e => isFoe(e, own))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    tg.forEach((e, i) =>
      later(i * 0.15, () => {
        if (e.dead || e.ko) return;
        G.bolts.push({
          pts: jag(e.x + rnd(-40, 40), -20, e.x, e.y - e.h / 2),
          l: 0.35,
          dk: k.dark,
        });
        dmgEnemy(e, 25, e.x);
        e.stun = Math.max(e.stun || 0, 0.8);
        G.flash = 0.25;
        sfx('thunder');
      })
    );
    if (tg.length) txt(x, y - 50, 'ORAGE !', '#fff59a', 36);
  }
  if (lv('magnet') >= 2)
    G.zones.push({
      t: 'pull',
      x,
      y: Math.min(y, GROUND - 40),
      r: lv('magnet') >= 3 ? 340 : 200,
      l: lv('magnet') >= 3 ? 1.6 : 1,
      ml: lv('magnet') >= 3 ? 1.6 : 1,
      own,
    });
  if (lv('bubble') >= 3 && !p.aqua) {
    p.aqua = true;
    for (const o of G.enemies)
      if (isFoe(o, own) && o.kind !== 'golem' && Math.hypot(o.x - x, o.y - y) < 170) {
        o.bubble = Math.max(o.bubble || 0, 3);
        o.air = false;
      }
  }
  if (lv('hourglass') >= 3 && !p.stopped) {
    p.stopped = true;
    timeStop(own);
  }
}
const SHARKSPEC = {
  n: { fish: 1 },
  syn: new Set(),
  layers: ['fish'],
  body: 'fish',
  shape: 'orb',
  saw: 0,
  dark: false,
};
const SPIDERSPEC = {
  n: { magnet: 1 },
  syn: new Set(),
  layers: [],
  body: 'orb',
  shape: 'spider',
  saw: 0,
  dark: false,
};
function nearestFoes(x, y, n, own) {
  return G.enemies
    .filter(e => isFoe(e, own))
    .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))
    .slice(0, n);
}
function dance(e, t) {
  e.dance = Math.max(e.dance || 0, t);
  e.stun = Math.max(e.stun || 0, t);
  for (let i = 0; i < 3; i++)
    part(
      'zz',
      e.x + rnd(-20, 20),
      e.y - e.h - 10,
      rnd(-40, 40),
      rnd(-80, -30),
      1.2,
      20,
      ['#ff9de2', '#fff07a', '#62f0dd'][i],
      { ch: '♪' }
    );
}
function extraEnd(p, x, y, why) {
  const k = p.spec,
    S = k.syn,
    c = n => k.n[n] || 0,
    lv = n => LV(k, n),
    own = p.owner,
    dk = k.dark;
  if (c('bomb'))
    G.zones.push({
      t: 'bomb',
      x: clamp(x, 20, W - 20),
      y: Math.min(y, GROUND),
      vy: 0,
      l: S.has('puffer') ? 0.05 : S.has('surprise') ? 0.35 : 1.4,
      ml: 1.4,
      own,
      lv: c('bomb'),
      love: S.has('lovebomb'),
      tick: 0,
    });
  if (c('cloud') && !p.frag) {
    const L = lv('cloud') || 1;
    G.zones.push({
      t: 'cloud',
      x,
      y: 250,
      r: L >= 3 ? 250 : L >= 2 ? 170 : 115,
      l: L >= 2 ? 8 : 5,
      ml: L >= 2 ? 8 : 5,
      own,
      snow: S.has('snowstorm'),
      storm: S.has('thundercloud'),
      garden: S.has('garden'),
      st: 1,
      gt: 0,
    });
    sfx('rain');
    if (L >= 3) {
      aoe(x, GROUND - 30, 320, 10, 650, own);
      for (let i = 0; i < 50; i++)
        part(
          'drop',
          x + rnd(-200, 200),
          GROUND - 10,
          rnd(-400, 400),
          rnd(-600, -200),
          1.4,
          rnd(4, 8),
          '#7fd6ff',
          { g: 1100 }
        );
      txt(x, GROUND - 160, 'DÉLUGE !', '#7fd6ff', 40);
      sfx('splash');
    }
  }
  if (c('tornado') && !p.frag) {
    const L = lv('tornado') || 1,
      mk = dir => {
        const f = nearestEnemy(x, y, 3000, own);
        G.zones.push({
          t: 'tornado',
          x: clamp(x, 40, W - 40),
          y: GROUND,
          r: L >= 2 ? 85 : 60,
          l: 5,
          ml: 5,
          own,
          vx: dir || (f ? Math.sign(f.x - x) || 1 : 1) * 90,
          fire: S.has('firenado'),
          shark: S.has('sharknado'),
          pt: 0,
          sk: 0.6,
        });
      };
    if (L >= 3) {
      mk(-90);
      mk(90);
    } else mk(0);
    sfx('wind');
    txt(
      x,
      GROUND - 170,
      S.has('sharknado')
        ? 'Tornade à requins !'
        : S.has('firenado')
          ? 'Tornade de feu !'
          : 'Tornade !',
      '#bfeee6',
      30
    );
  }
  if (c('web')) {
    const L = lv('web') || 1;
    G.zones.push({
      t: 'web',
      x: clamp(x, 40, W - 40),
      y: GROUND,
      r: L >= 2 ? 140 : 90,
      l: 6,
      ml: 6,
      own,
      nid: S.has('spidernest'),
      spT: 0.4,
    });
    sfx('web');
  }
  if (c('potion')) {
    if (dk) poison(x, y, own, c('potion'));
    else {
      const n = lv('potion'),
        fx = ['freeze', 'burn', 'bubble', 'sleep', 'dance'],
        pick = n >= 3 ? fx : fx.sort(() => Math.random() - 0.5).slice(0, n >= 2 ? 2 : 1),
        cols = {
          freeze: '#8fe3ff',
          burn: '#ff8a3d',
          bubble: '#a6f6ff',
          sleep: '#c8d8ff',
          dance: '#ff9de2',
        },
        names = { freeze: 'gel', burn: 'feu', bubble: 'bulle', sleep: 'dodo', dance: 'danse' };
      for (const e of G.enemies) {
        if (!isFoe(e, own) || Math.hypot(e.x - x, e.y - e.h / 2 - y) > 115) continue;
        const mg = e.kind === 'mage';
        for (const f of pick) {
          if (f === 'freeze') e.freeze = Math.max(e.freeze || 0, mg ? 1 : 2);
          if (f === 'burn') addBurn(e, 1, false, false, true);
          if (f === 'bubble' && e.kind !== 'golem') {
            e.bubble = Math.max(e.bubble || 0, mg ? 1.5 : 2.5);
            e.air = false;
          }
          if (f === 'sleep') {
            e.stun = Math.max(e.stun || 0, mg ? 1 : 2.5);
            e.sleep = e.stun;
          }
          if (f === 'dance') dance(e, mg ? 1 : 2);
        }
      }
      for (let i = 0; i < 20; i++)
        part(
          'drop',
          x,
          Math.min(y, GROUND - 5),
          rnd(-220, 220),
          rnd(-380, -80),
          1,
          rnd(3, 6),
          cols[pick[i % pick.length]],
          { g: 1000 }
        );
      txt(
        x,
        Math.min(y, GROUND) - 50,
        'Potion : ' + pick.map(f => names[f]).join(' + ') + ' !',
        '#9dff9d',
        24
      );
      sfx('potion');
      if (own) {
        if (G.mode === 'duel' && own.ent) {
          if (!own.ent.ko) {
            own.ent.hp = Math.min(own.ent.max, own.ent.hp + 8 * c('potion'));
            txt(own.x, GROUND - 200, '+' + 8 * c('potion'), '#9dff9d', 24);
          }
        } else {
          G.potion = (G.potion || 0) + c('potion');
          if (G.potion >= 4) {
            G.potion = 0;
            if (G.hearts < G.maxHearts) {
              G.hearts++;
              txt(own.x, GROUND - 200, '+1 ♥', '#9dff9d', 30);
            }
          }
        }
      }
    }
  }
}
function explodeBomb(z) {
  const big = z.lv >= 3,
    R = z.mini ? 70 : big ? 230 : 130,
    d = z.mini ? 15 : big ? 80 : 45,
    y = z.y - 15;
  if (z.love) {
    for (const e of G.enemies)
      if (isFoe(e, z.own) && Math.hypot(e.x - z.x, e.y - e.h / 2 - y) < R + 40) charm(e);
    for (let i = 0; i < (z.mini ? 8 : 30); i++)
      part('heart', z.x, y, rnd(-300, 300), rnd(-400, -50), 1.2, 12, '#ff6fae', { g: 400 });
    txt(z.x, y - 70, 'BOUM… ♥', '#ff6fae', z.mini ? 22 : 38);
  } else {
    aoe(z.x, y, R, d, big ? 600 : 420, z.own);
    for (let i = 0; i < (z.mini ? 10 : 30); i++)
      part(
        'fire',
        z.x,
        y,
        rnd(-1, 1) * R * 2.2,
        rnd(-1.6, 0.4) * R * 2,
        rnd(0.4, 0.8),
        rnd(10, big ? 34 : 22),
        'orange',
        { drag: 2.5 }
      );
    for (let i = 0; i < (z.mini ? 4 : 12); i++)
      part(
        'smoke',
        z.x + rnd(-R, R) * 0.4,
        y,
        rnd(-80, 80),
        rnd(-120, -20),
        1.2,
        rnd(16, 34),
        'rgba(90,80,90,.5)'
      );
    chips(z.x, GROUND, '#5a4a3a', z.mini ? 6 : 14, true);
    txt(
      z.x,
      y - 70,
      big ? 'MÉGA KABOUM !' : z.mini ? 'boum' : 'KABOUM !',
      '#ff8a3d',
      z.mini ? 22 : big ? 50 : 40
    );
  }
  part('sring', z.x, y, 0, 0, 0.45, R, '#ffd36b');
  G.shake = Math.max(G.shake, z.mini ? 4 : big ? 22 : 14);
  sfx('boom');
  if (z.lv === 2 && !z.mini)
    for (let i = 0; i < 5; i++)
      G.zones.push({
        t: 'bomb',
        x: clamp(z.x + rnd(-220, 220), 20, W - 20),
        y: z.y - 40,
        vy: rnd(-600, -250),
        l: rnd(0.6, 1),
        ml: 1,
        own: z.own,
        lv: 0,
        mini: true,
        love: z.love,
        tick: 0,
      });
}
function upZone(z, dt) {
  if (z.t === 'bomb') {
    z.vy += 1500 * dt;
    z.y = Math.min(GROUND, z.y + z.vy * dt);
    if (z.y >= GROUND) z.vy = 0;
    z.tick -= dt;
    if (z.tick <= 0) {
      z.tick = z.l < 0.5 ? 0.1 : 0.3;
      if (!z.mini) sfx('tick');
    }
    if (Math.random() < 0.5)
      part(
        'spark',
        z.x + 8,
        z.y - (z.lv >= 3 ? 50 : z.mini ? 20 : 34),
        rnd(-40, 40),
        rnd(-90, -20),
        0.3,
        3,
        '#ffd36b'
      );
  } else if (z.t === 'cloud') {
    const f = nearestEnemy(z.x, GROUND - 50, 1600, z.own);
    if (f) z.x += clamp(f.x - z.x, -70 * dt, 70 * dt);
    for (let i = 0; i < (qLvl === 'rapide' ? 1 : 3); i++)
      part(
        z.snow ? 'snow' : 'drop',
        z.x + rnd(-z.r, z.r) * 0.9,
        z.y + 30,
        z.snow ? rnd(-20, 20) : 0,
        z.snow ? rnd(60, 120) : rnd(500, 700),
        z.snow ? 2 : 0.9,
        z.snow ? 4 : 2.5,
        z.snow ? '#ffffff' : '#9fd8ff',
        z.snow ? { vr: rnd(-4, 4) } : null
      );
    if (z.storm) {
      z.st -= dt;
      if (z.st <= 0) {
        z.st = 1;
        const cs = G.enemies.filter(e => isFoe(e, z.own) && Math.abs(e.x - z.x) < z.r);
        if (cs.length) {
          const e = cs[(Math.random() * cs.length) | 0];
          G.bolts.push({ pts: jag(e.x + rnd(-20, 20), z.y + 30, e.x, e.y - e.h / 2), l: 0.3 });
          dmgEnemy(e, 20, e.x);
          e.stun = Math.max(e.stun || 0, 0.5);
          G.flash = Math.max(G.flash, 0.15);
          sfx('thunder');
        }
      }
    }
    if (z.garden) {
      z.gt -= dt;
      if (z.gt <= 0) {
        z.gt = 0.5;
        addPlant(z.x + rnd(-z.r, z.r), Math.random() < 0.15 ? 'tree' : 'flower');
      }
    }
  } else if (z.t === 'tornado') {
    const f = nearestEnemy(z.x, GROUND - 50, 2000, z.own);
    if (f) z.vx += (Math.sign(f.x - z.x) * 90 - z.vx) * dt;
    z.x = clamp(z.x + z.vx * dt, 30, W - 30);
    if (Math.random() < 0.6)
      part(
        z.fire ? 'fire' : 'smoke',
        z.x + rnd(-z.r, z.r) * 0.5,
        GROUND - rnd(0, 180),
        rnd(-80, 80),
        rnd(-120, -40),
        0.6,
        rnd(8, 16),
        z.fire ? 'orange' : 'rgba(200,230,225,.35)'
      );
    z.pt -= dt;
    if (z.pt <= 0) {
      z.pt = 0.5;
      for (const q of G.props)
        if (!q.dead && q.kind !== 'tramp' && Math.abs(q.x + q.w / 2 - z.x) < z.r + q.w / 2)
          hitProp(q, 12, null, q.x + q.w / 2, q.y + q.h / 2);
    }
    if (z.shark) {
      z.sk -= dt;
      if (z.sk <= 0) {
        z.sk = 0.6;
        const f2 = nearestEnemy(z.x, GROUND - 150, 1600, z.own),
          a = f2 ? Math.atan2(f2.y - f2.h / 2 - (GROUND - 170), f2.x - z.x) : -Math.PI / 2,
          sp = makeProj(SHARKSPEC, z.x, GROUND - 170, a, {
            owner: z.own,
            speed: 520,
            g: 200,
            life: 3,
          });
        sp.fish = FISH[2];
        G.projs.push(sp);
        sfx('splash');
      }
    }
  } else if (z.t === 'web' && z.nid) {
    z.spT -= dt;
    if (z.spT <= 0) {
      z.spT = 1.4;
      for (let i = 0; i < 2; i++)
        G.projs.push(
          makeProj(SPIDERSPEC, z.x + rnd(-40, 40), GROUND - 20, -Math.PI / 2 + rnd(-0.8, 0.8), {
            speed: 380,
            g: 900,
            r: 8,
            bounces: 3,
            life: 4,
            owner: z.own,
            frag: true,
          })
        );
    }
  }
}
function addChest(x) {
  G.pickups.push({
    x: clamp(x, 250, W - 60),
    y: -60,
    vx: 0,
    vy: 0,
    t: 0,
    l: 9,
    ground: false,
    dead: false,
    chest: true,
  });
  txt(x, GROUND - 200, 'Un coffre !', '#ffc93c', 34);
  sfx('chest');
}
function thorns(x, own, n = 1) {
  G.zones.push({
    t: 'thorns',
    x: clamp(x, 80, W - 80),
    y: GROUND,
    r: 90 * (1 + 0.5 * (n - 1)),
    l: 7,
    ml: 7,
    own,
    seed: (Math.random() * 1e9) | 0,
  });
  chips(x, GROUND, '#3a5a1a', 10);
  txt(x, GROUND - 60, 'Ronces !', '#9ddf5a', 26);
  sfx('croc');
}
