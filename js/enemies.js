/* Scribble Wizards — enemies.js
   Monsters, waves and wizard status effects. */
/* ---------- enemies ---------- */
const EK = {
  slime: { n: 'Gloubi', hp: 30, spd: 55, w: 44, h: 38, rad: 22, pow: 6, col: '#6fe36b' },
  goblin: { n: 'Grognon', hp: 55, spd: 62, w: 40, h: 66, rad: 26, pow: 10, col: '#8fbf4a' },
  bat: {
    n: 'Chauve-souris',
    hp: 22,
    spd: 95,
    w: 50,
    h: 30,
    rad: 20,
    pow: 4,
    fly: 1,
    col: '#7b5bb8',
  },
  golem: { n: 'Golem', hp: 420, spd: 24, w: 110, h: 160, rad: 62, pow: 45, col: '#8a8f9c' },
  mage: { n: 'Sorcier', hp: 150, spd: 0, w: 60, h: 170, rad: 46, pow: 0, col: '#c39bff' },
};
function spawnEnemy(kind) {
  const D = EK[kind],
    m = 1 + 0.12 * (G.wave - 1);
  G.enemies.push({
    kind,
    x: W + 40,
    y: D.fly ? rnd(380, 560) : GROUND,
    vx: 0,
    vy: 0,
    hp: D.hp * m,
    max: D.hp * m,
    w: D.w,
    h: D.h,
    rad: D.rad,
    t: Math.random() * 5,
    dir: -1,
    flash: 0,
    burn: 0,
    freeze: 0,
    stun: 0,
    bubble: 0,
    happy: 0,
    poss: 0,
    grabCd: 0,
    spreadT: 1,
    charmed: false,
    air: false,
    atk: 0,
    swing: 0,
    stage: 0,
    cruise: rnd(360, 560),
    seed: (Math.random() * 1e9) | 0,
    dead: false,
  });
}
function mkMage(w) {
  const D = EK.mage;
  return {
    kind: 'mage',
    wz: w,
    x: w.x,
    y: GROUND,
    vx: 0,
    vy: 0,
    hp: D.hp,
    max: D.hp,
    w: D.w,
    h: D.h,
    rad: D.rad,
    t: 0,
    dir: w.side,
    flash: 0,
    burn: 0,
    freeze: 0,
    stun: 0,
    bubble: 0,
    loveT: 0,
    poss: 0,
    charmed: false,
    air: false,
    ko: false,
    koT: 0,
    seed: 1,
    dead: false,
  };
}
function startWave() {
  if (G.waveActive || G.over) return;
  G.wave++;
  const n = G.wave,
    q = [],
    total = 3 + n * 2;
  for (let i = 0; i < total; i++) {
    const r = Math.random();
    q.push(n >= 2 && r < 0.25 ? 'bat' : r < 0.62 ? 'slime' : 'goblin');
  }
  if (n % 3 === 0) q.push('golem');
  if (n >= 6 && n % 2 === 0) q.push('golem');
  G.spawnQ = q;
  G.spawnT = 1;
  G.waveActive = true;
  banner('Vague ' + n, 'Les monstres arrivent !');
  updUI();
}
function nearestCoin(e) {
  let best = null,
    bd = 480;
  for (const c of G.pickups) {
    if (c.dead) continue;
    const d = Math.abs(c.x - e.x);
    if (d < bd) {
      bd = d;
      best = c;
    }
  }
  if (!best)
    for (const p of G.projs)
      if (!p.dead && p.spec.body === 'coin' && Math.abs(p.x - e.x) < 360)
        return { x: p.x, fly: true };
  return best;
}
function hurtWizard() {
  G.hearts--;
  WZ[0].hurt = 1.2;
  G.shake = 16;
  sfx('hurt');
  txt(WZ[0].x + 20, GROUND - 180, 'Aïe !', '#ff8a8a', 36);
  if (G.hearts <= 0) {
    G.over = true;
    $('#overlay').hidden = false;
  }
}
function zoneFx(e, dt, isMage) {
  let sf = 1;
  for (const z of G.zones) {
    if (isMage && z.own === e.wz) continue;
    const d = Math.hypot(e.x - z.x, e.y - e.h / 2 - z.y);
    if (z.t === 'slow' && d < z.r) sf = 0.25;
    if (z.t === 'hole' && d < z.r) {
      if (!isMage && e.kind !== 'golem') {
        e.x += ((z.x - e.x) / (d + 1)) * 260 * dt;
        if (EK[e.kind].fly) e.cruise += (z.y - e.cruise) * dt;
      }
      if (d < 90) dmgEnemy(e, 14 * dt, null, true);
    }
    if (z.t === 'poison' && d < z.r + e.rad * 0.5) {
      dmgEnemy(e, 10 * dt, null, true);
      if (Math.random() < 0.1)
        part('dot', e.x + rnd(-15, 15), e.y - e.h, 0, -40, 0.6, 3, '#8dff6a');
    }
    if (z.t === 'thorns' && Math.abs(e.x - z.x) < z.r && e.y > GROUND - 40) {
      sf = Math.min(sf, 0.45);
      dmgEnemy(e, 8 * dt, null, true);
    }
  }
  return sf;
}
function upMage(e, dt) {
  const w = e.wz;
  e.t += dt;
  e.flash = Math.max(0, e.flash - dt);
  if (e.ko) {
    e.koT += dt;
    return;
  }
  if (e.burn > 0) {
    e.burn -= dt;
    dmgEnemy(e, 6 * dt, null, true);
    if (Math.random() < 0.6)
      part(
        'fire',
        e.x + rnd(-25, 25),
        e.y - rnd(0, e.h),
        rnd(-20, 20),
        rnd(-120, -40),
        0.5,
        rnd(8, 14),
        e.curse ? 'purple' : e.blue ? 'blue' : 'orange'
      );
    if (e.ko) return;
  }
  e.slow = zoneFx(e, dt, true);
  if (e.ko) return;
  if (e.loveT > 0) {
    e.loveT -= dt;
    if (Math.random() < 0.1) part('heart', e.x, e.y - e.h, rnd(-20, 20), -60, 0.8, 10, '#ff6fae');
  }
  if (e.bubble > 0) {
    e.bubble -= dt;
    e.y += (GROUND - 230 - e.y) * 2 * dt;
    if (e.bubble <= 0) {
      burst(e.x, e.y - e.h / 2, '#a6f6ff', 16, 220);
      sfx('pop');
      e.air = true;
      e.vy = 0;
    }
  } else if (e.air) {
    e.vy += 1600 * dt;
    e.y += e.vy * dt;
    if (e.y >= GROUND) {
      e.y = GROUND;
      e.air = false;
      dmgEnemy(e, 20, e.x);
      txt(e.x, e.y - e.h - 20, 'PLOF', '#fff', 26);
    }
  }
  if (e.freeze > 0) e.freeze -= dt;
  if (e.stun > 0) e.stun -= dt;
}
function upEnemy(e, dt) {
  if (e.kind === 'mage') {
    upMage(e, dt);
    return;
  }
  const D = EK[e.kind];
  e.t += dt;
  e.flash = Math.max(0, e.flash - dt);
  e.swing = Math.max(0, e.swing - dt * 3);
  e.grabCd = Math.max(0, e.grabCd - dt);
  if (e.burn > 0) {
    e.burn -= dt;
    dmgEnemy(e, 7 * dt, null, true);
    if (Math.random() < 0.6)
      part(
        'fire',
        e.x + rnd(-e.w / 2, e.w / 2),
        e.y - rnd(0, e.h),
        rnd(-20, 20),
        rnd(-120, -40),
        0.5,
        rnd(8, 14),
        e.curse ? 'purple' : e.blue ? 'blue' : 'orange'
      );
    if (e.curse) {
      e.spreadT -= dt;
      if (e.spreadT <= 0) {
        e.spreadT = 1;
        for (const o of G.enemies)
          if (
            o !== e &&
            !o.dead &&
            !(o.burn > 0) &&
            Math.abs(o.x - e.x) < 100 &&
            Math.abs(o.y - e.y) < 120
          ) {
            o.burn = 6;
            o.curse = true;
            for (let i = 0; i < 6; i++)
              part(
                'fire',
                (e.x + o.x) / 2,
                e.y - e.h / 2,
                rnd(-60, 60),
                rnd(-60, 0),
                0.4,
                8,
                'purple'
              );
            break;
          }
      }
    }
    if (e.dead) return;
  }
  const sf = zoneFx(e, dt, false);
  if (e.dead) return;
  if (e.bubble > 0) {
    e.bubble -= dt;
    const ty = D.fly ? e.cruise - 120 : GROUND - 250;
    e.y += (ty - e.y) * 2 * dt;
    e.x += Math.sin(e.t * 2) * 20 * dt;
    if (e.bubble <= 0) {
      burst(e.x, e.y - e.h / 2, '#a6f6ff', 16, 220);
      sfx('pop');
      txt(e.x, e.y - e.h - 20, 'PLOP', '#a6f6ff', 26);
      if (!D.fly) {
        e.air = true;
        e.vy = 0;
        e.vx = 0;
        e.dropDmg = true;
      }
    }
    return;
  }
  if (e.air) {
    e.vy += 1600 * dt * sf;
    e.x += e.vx * dt * sf;
    e.y += e.vy * dt * sf;
    if (e.y >= GROUND) {
      e.y = GROUND;
      e.air = false;
      e.vx = 0;
      if (e.dropDmg) {
        e.dropDmg = false;
        dmgEnemy(e, 20, e.x);
        txt(e.x, e.y - e.h - 20, 'PLOF', '#fff', 26);
      }
      for (let i = 0; i < 5; i++)
        part(
          'smoke',
          e.x + rnd(-20, 20),
          GROUND - 4,
          rnd(-80, 80),
          rnd(-40, -5),
          0.6,
          rnd(8, 14),
          'rgba(200,190,170,.5)'
        );
    }
    e.x = clamp(e.x, WZ[0].x + 40, W + 80);
    return;
  }
  if (e.freeze > 0) {
    e.freeze -= dt;
    if (e.freeze <= 0) e.brittle = false;
    return;
  }
  if (e.stun > 0) {
    e.stun -= dt;
    return;
  }
  if (e.happy > 0) {
    e.happy -= dt;
    return;
  }
  if (Math.abs(e.vx) > 1) {
    e.x += e.vx * dt;
    e.vx *= Math.pow(0.004, dt);
  }
  const spd = D.spd * sf * (e.burn > 0 ? 1.6 : 1);
  if (e.charmed) {
    e.dir = 1;
    e.x += spd * 1.3 * dt;
    if (D.fly) e.y += (e.cruise - e.y) * dt;
    if (Math.random() < 0.05) part('heart', e.x, e.y - e.h, rnd(-20, 20), -60, 0.8, 10, '#ff6fae');
    if (e.x > W + 60) {
      e.dead = true;
      G.score++;
    }
    return;
  }
  if (e.poss > 0) {
    e.poss -= dt;
    if (Math.random() < 0.2)
      part('smoke', e.x, e.y - e.h / 2, rnd(-20, 20), -40, 0.6, 10, 'rgba(150,255,150,.3)');
    if (e.poss <= 0) {
      kill(e);
      return;
    }
    let t = null,
      bd = 1e9;
    for (const o of G.enemies) {
      if (o === e || o.dead || o.poss || o.charmed) continue;
      const d = Math.abs(o.x - e.x);
      if (d < bd) {
        bd = d;
        t = o;
      }
    }
    if (t) {
      e.dir = t.x < e.x ? -1 : 1;
      if (bd > (e.w + t.w) / 2 + 6) e.x += e.dir * spd * 1.4 * dt;
      else {
        e.atk += dt;
        if (e.atk > 0.6) {
          e.atk = 0;
          e.swing = 1;
          dmgEnemy(t, D.pow * 2 + 12, t.x);
          burst(t.x, t.y - t.h / 2, '#9dff9d', 8, 200);
        }
      }
      if (D.fly) e.y += (t.y - e.y) * dt;
    } else {
      e.dir = 1;
      e.x += spd * dt;
      if (e.x > W + 60) {
        e.dead = true;
        G.score++;
      }
    }
    return;
  }
  let tx = WZ[0].x;
  const coin = nearestCoin(e);
  if (coin) tx = coin.x;
  const dir = tx < e.x ? -1 : 1;
  e.dir = dir;
  if (Math.abs(tx - e.x) > 6) e.x += dir * spd * dt;
  if (coin && !coin.fly && coin.ground && Math.abs(coin.x - e.x) < 26 && !D.fly) {
    if (coin.cursed) explodeCoin(coin);
    else {
      coin.dead = true;
      e.happy = 1.4;
      txt(e.x, e.y - e.h - 14, 'Ooh, une pièce !', '#ffc93c', 22);
      sfx('coin');
    }
    if (e.dead) return;
  }
  if (D.fly) {
    const ty = e.x < WZ[0].x + 320 ? GROUND - 70 : e.cruise;
    e.y += (ty + Math.sin(e.t * 3) * 26 - e.y) * Math.min(1, 3 * dt);
  } else
    for (const q of G.props) {
      if (q.dead || q.y > e.y - 2 || q.y + q.h < e.y - e.h) continue;
      if (e.x + e.w / 2 <= q.x || e.x - e.w / 2 >= q.x + q.w) continue;
      if (q.kind === 'tramp') {
        e.air = true;
        e.vy = -780;
        e.vx = 430;
        txt(e.x, e.y - e.h - 10, 'BOING !', '#ff9ad0', 28);
        sfx('boing');
        q.flash = 0.2;
        break;
      }
      e.x = e.x > q.x + q.w / 2 ? q.x + q.w + e.w / 2 : q.x - e.w / 2;
      if (q.kind === 'tomb' && e.grabCd <= 0 && e.kind !== 'golem') {
        e.stun = 1.6;
        e.grabCd = 4;
        q.handT = 0.9;
        q.handX = e.x;
        txt(e.x, e.y - e.h - 14, 'Une main !', '#9dff9d', 24);
        sfx('evil');
        dmgEnemy(e, 8, e.x);
        break;
      }
      e.atk += dt * sf;
      if (e.atk > 0.7) {
        e.atk = 0;
        e.swing = 1;
        hitProp(q, D.pow, null, e.x > q.x ? q.x + q.w : q.x, e.y - e.h * 0.6);
      }
      break;
    }
  if (e.x - e.w / 2 < WZ[0].x + 30) {
    e.dead = true;
    burst(e.x, e.y - e.h / 2, D.col, 16, 260);
    hurtWizard();
  }
}
