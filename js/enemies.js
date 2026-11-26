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
    pow: 0,
    fly: 1,
    col: '#7b5bb8',
  },
  golem: { n: 'Golem', hp: 420, spd: 24, w: 110, h: 160, rad: 62, pow: 45, col: '#8a8f9c' },
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
  updWaveBtn();
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
  WIZ.hurt = 1.2;
  G.shake = 16;
  sfx('hurt');
  txt(WIZ.x + 20, GROUND - 180, 'Aïe !', '#ff8a8a', 36);
  if (G.hearts <= 0) {
    G.over = true;
    $('#overlay').hidden = false;
  }
}

function upEnemy(e, dt) {
  const D = EK[e.kind];
  e.t += dt;
  e.flash = Math.max(0, e.flash - dt);
  e.swing = Math.max(0, e.swing - dt * 3);
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
        e.blue ? 'blue' : 'orange'
      );
    if (e.dead) return;
  }
  let sf = 1;
  for (const z of G.zones) {
    const d = Math.hypot(e.x - z.x, e.y - e.h / 2 - z.y);
    if (z.t === 'slow' && d < z.r) sf = 0.25;
    if (z.t === 'hole' && d < z.r && e.kind !== 'golem') {
      e.x += ((z.x - e.x) / (d + 1)) * 260 * dt;
      if (D.fly) e.cruise += (z.y - e.cruise) * dt;
      if (d < 70) dmgEnemy(e, 14 * dt, null, true);
      if (Math.random() < 0.2)
        part('spark', e.x, e.y - e.h / 2, (z.x - e.x) * 2, (z.y - e.y) * 2, 0.3, 3, '#b48cff');
    }
  }
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
    e.x = clamp(e.x, WIZ.x + 40, W + 80);
    return;
  }
  if (e.freeze > 0) {
    e.freeze -= dt;
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
  let tx = WIZ.x;
  const coin = nearestCoin(e);
  if (coin) tx = coin.x;
  const dir = tx < e.x ? -1 : 1;
  e.dir = dir;
  if (Math.abs(tx - e.x) > 6) e.x += dir * spd * dt;
  if (coin && !coin.fly && coin.ground && Math.abs(coin.x - e.x) < 26 && !D.fly) {
    coin.dead = true;
    e.happy = 1.4;
    txt(e.x, e.y - e.h - 14, 'Ooh, une pièce !', '#ffc93c', 22);
    sfx('coin');
  }
  if (D.fly) {
    const ty = e.x < WIZ.x + 320 ? GROUND - 70 : e.cruise;
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
      e.atk += dt * sf;
      if (e.atk > 0.7) {
        e.atk = 0;
        e.swing = 1;
        hitProp(q, D.pow, null, e.x > q.x ? q.x + q.w : q.x, e.y - e.h * 0.6);
      }
      break;
    }
  if (e.x - e.w / 2 < WIZ.x + 30) {
    e.dead = true;
    burst(e.x, e.y - e.h / 2, D.col, 16, 260);
    hurtWizard();
  }
}
