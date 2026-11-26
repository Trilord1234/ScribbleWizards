/* Scribble Wizards — update.js
   Main simulation step. */
/* ---------- update ---------- */
function update(dt) {
  G.time += dt;
  const w0 = WZ[0];
  if (G.mode === 'arena') {
    w0.cd -= dt;
    w0.haste = Math.max(0, w0.haste - dt);
    if (G.firing && w0.cd <= 0 && !G.over) fire(w0);
    w0.recoil = Math.max(0, w0.recoil - dt * 5);
    w0.hurt = Math.max(0, w0.hurt - dt);
    w0.shield = Math.max(0, (w0.shield || 0) - dt);
    w0.shieldCd = (w0.shieldCd || 0) - dt;
  } else upDuel(dt);
  for (const l of G.later) l.t -= dt;
  const due = G.later.filter(l => l.t <= 0);
  G.later = G.later.filter(l => l.t > 0);
  due.forEach(l => {
    try {
      l.fn();
    } catch (e) {
      console.error(e);
    }
  });
  G.timeStop = Math.max(0, G.timeStop - dt);
  G.storm = Math.max(0, (G.storm || 0) - dt * 0.6);
  G.flash = Math.max(0, G.flash - dt * 1.5);
  for (const c of G.cast) c.t += dt;
  G.cast = G.cast.filter(c => c.t < 0.5);
  for (const p of G.projs) if (!p.dead) upProj(p, dt);
  G.projs = G.projs.filter(p => !p.dead);
  const ps = G.props.filter(q => !q.dead).sort((a, b) => b.y - a.y);
  for (const q of ps) {
    q.flash = Math.max(0, q.flash - dt);
    q.frost = Math.max(0, q.frost - dt);
    q.handT = Math.max(0, q.handT - dt);
    if (q.rise < 1) q.rise = Math.min(1, q.rise + dt * 2.2);
    if (q.burn > 0) {
      q.burn -= dt;
      q.hp -= 5 * (q.burnS || 1) * dt;
      if (Math.random() < 0.5)
        part(
          'fire',
          q.x + rnd(0, q.w),
          q.y + rnd(0, q.h * 0.6),
          rnd(-20, 20),
          rnd(-120, -40),
          0.5,
          rnd(8, 14),
          q.curse ? 'purple' : 'orange'
        );
      if (q.hp <= 0) breakProp(q);
    }
    if (!q.stack || q.dead) continue;
    let sup = q.y + q.h >= GROUND - 0.5;
    if (!sup)
      for (const r of ps) {
        if (r === q || r.dead || r.kind === 'tramp') continue;
        if (
          Math.min(q.x + q.w, r.x + r.w) - Math.max(q.x, r.x) > 6 &&
          Math.abs(r.y - (q.y + q.h)) < 2
        ) {
          sup = true;
          break;
        }
      }
    if (sup) {
      q.vy = 0;
      continue;
    }
    q.vy += 1800 * dt;
    const ny = q.y + q.vy * dt;
    let land = GROUND - q.h;
    for (const r of ps) {
      if (r === q || r.dead || r.kind === 'tramp') continue;
      if (Math.min(q.x + q.w, r.x + r.w) - Math.max(q.x, r.x) > 6 && r.y >= q.y + q.h - 1)
        land = Math.min(land, r.y - q.h);
    }
    if (ny >= land) {
      if (q.vy > 450) hitProp(q, 8, null, q.x + q.w / 2, land + q.h);
      q.y = land;
      q.vy = 0;
    } else q.y = ny;
  }
  G.props = G.props.filter(q => !q.dead);
  if (G.mode === 'arena' && G.waveActive && !G.over) {
    G.spawnT -= dt;
    if (G.spawnQ.length && G.spawnT <= 0) {
      spawnEnemy(G.spawnQ.shift());
      G.spawnT = Math.max(0.6, 1.5 - G.wave * 0.08);
    }
    if (!G.spawnQ.length && !G.enemies.length) {
      G.waveActive = false;
      if (G.hearts < G.maxHearts) G.hearts++;
      banner('Vague ' + G.wave + ' réussie !', 'Bravo ! Prépare ton prochain cercle.');
      sfx('win');
      updUI();
    }
  }
  for (const e of G.enemies) if (!e.dead) upEnemy(e, dt);
  G.enemies = G.enemies.filter(e => !e.dead);
  for (const c of G.pickups) {
    c.t += dt;
    c.l -= dt;
    if (!c.ground) {
      c.vy += 1200 * dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      if (c.y >= GROUND - 10) {
        if (c.chest && c.vy > 300) {
          G.shake = Math.max(G.shake, 8);
          sfx('thud');
        }
        c.y = GROUND - 10;
        if (Math.abs(c.vy) < 120) {
          c.ground = true;
          c.vy = 0;
        } else {
          c.vy *= -0.35;
          c.vx *= 0.6;
        }
      }
    } else if (c.cursed) {
      c.fuse -= dt;
      if (c.fuse <= 0) explodeCoin(c);
    }
    if (c.l <= 0) c.dead = true;
  }
  G.pickups = G.pickups.filter(c => !c.dead);
  for (const pl of G.plants) {
    pl.g = Math.min(1, pl.g + dt / 1.2);
    if (pl.type === 'money' && pl.g >= 1) {
      pl.coinT -= dt;
      if (pl.coinT <= 0) {
        pl.coinT = rnd(4, 7);
        addCoin(pl.x + rnd(-30, 30), GROUND - 110 * pl.h, rnd(-40, 40), 0);
      }
    }
  }
  for (const z of G.zones) {
    z.l -= dt;
    upZone(z, dt);
    if (z.t === 'blizzard')
      for (let i = 0; i < 3; i++)
        part(
          'snow',
          z.x + rnd(-z.r, z.r),
          z.y - 160 + rnd(0, 60),
          rnd(-160, -60),
          rnd(80, 200),
          1.4,
          rnd(3, 6),
          '#ffffff',
          { vr: rnd(-4, 4) }
        );
    if (z.t === 'fire' && Math.random() < 0.5)
      part(
        'fire',
        z.x + rnd(-z.r, z.r),
        GROUND - 5,
        rnd(-10, 10),
        rnd(-120, -40),
        0.5,
        rnd(6, 12),
        'orange'
      );
    if (z.t === 'hole' && Math.random() < 0.7) {
      const a = Math.random() * TAU;
      part(
        'spark',
        z.x + Math.cos(a) * z.r * 0.7,
        z.y + Math.sin(a) * z.r * 0.7,
        -Math.cos(a) * 220,
        -Math.sin(a) * 220,
        0.6,
        3,
        '#c7a8ff'
      );
    }
    if (z.t === 'poison' && Math.random() < 0.4)
      part(
        'smoke',
        z.x + rnd(-z.r, z.r) * 0.7,
        z.y + rnd(-z.r, z.r) * 0.4,
        rnd(-20, 20),
        rnd(-30, 0),
        1,
        rnd(14, 24),
        'rgba(120,255,90,.25)'
      );
    if (z.l <= 0 && z.t === 'bomb') explodeBomb(z);
    if (z.l <= 0 && z.boom) {
      aoe(z.x, z.y, 150, 30 * z.boom, 350, z.own);
      for (let i = 0; i < 40; i++)
        part(
          'spark',
          z.x,
          z.y,
          rnd(-420, 420),
          rnd(-420, 300),
          rnd(0.4, 0.9),
          rnd(3, 6),
          i % 2 ? '#c39bff' : '#8dff6a',
          { drag: 2 }
        );
      G.shake = 12;
      txt(z.x, z.y - 40, 'BADABOUM !', '#c39bff', 36);
      sfx('boom');
    }
  }
  G.zones = G.zones.filter(z => z.l > 0);
  for (const b of G.bolts) b.l -= dt;
  G.bolts = G.bolts.filter(b => b.l > 0);
  for (const p of G.parts) {
    p.l -= dt;
    p.vy += p.g * dt;
    if (p.drag) {
      const f = Math.max(0, 1 - p.drag * dt);
      p.vx *= f;
      p.vy *= f;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    if (p.g > 0 && p.y > GROUND) {
      if (p.t === 'seed') {
        p.l = 0;
        if (Math.random() < 0.55) addPlant(p.x, 'flower');
      } else {
        p.y = GROUND;
        p.vy *= -0.3;
        p.vx *= 0.6;
        p.vr *= 0.5;
      }
    }
  }
  G.parts = G.parts.filter(p => p.l > 0);
  for (const t of G.texts) {
    t.l -= dt;
    t.y -= 40 * dt;
  }
  G.texts = G.texts.filter(t => t.l > 0);
  if (G.banner) {
    G.banner.l -= dt;
    if (G.banner.l <= 0) G.banner = null;
  }
  G.shake = Math.max(0, G.shake - dt * 30);
  const anyDark = G.mode === 'duel' ? WZ.some(w => w.dark) : WZ[0].dark;
  G.blood += ((anyDark ? 1 : 0) - G.blood) * Math.min(1, dt * 2);
  if (Math.random() < dt * 2.5)
    part(
      'fly',
      rnd(200, W),
      rnd(480, 760),
      rnd(-15, 15),
      rnd(-10, 10),
      rnd(3, 6),
      3,
      G.blood > 0.5 ? '#ff6b8a' : '#e4ff8a'
    );
}
