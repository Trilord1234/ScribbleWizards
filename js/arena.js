/* Scribble Wizards — arena.js
   Arena and duel map layouts. */
/* ---------- arenas ---------- */
const PROPCOL = {
  brick: '#b5563b',
  crate: '#b07a3f',
  barrel: '#8a5a2b',
  vase: '#d9773a',
  scarecrow: '#e6c35a',
  pillar: '#a9a3b8',
  concrete: '#9a9a9a',
  rampart: '#8f8a99',
  pyramid: '#d9b56a',
  tramp: '#ff7ab0',
  tomb: '#8f8a9e',
  bigtree: '#6b4220',
  slab: '#8f8a99',
};
const WOOD = new Set(['crate', 'barrel', 'scarecrow', 'bigtree']);
function propFactory() {
  const P = [];
  return [
    P,
    (kind, x, y, w, h, hp, o = {}) =>
      P.push(
        Object.assign(
          {
            kind,
            x,
            y,
            w,
            h,
            hp,
            max: hp,
            seed: (Math.random() * 1e9) | 0,
            vy: 0,
            stack: true,
            flash: 0,
            burn: 0,
            frost: 0,
            rise: 1,
            stage: 0,
            handT: 0,
          },
          o
        )
      ),
  ];
}
function buildArena() {
  const [P, add] = propFactory();
  add('scarecrow', 470, GROUND - 130, 56, 130, 90, { stack: false });
  add('barrel', 620, GROUND - 62, 46, 62, 40);
  add('barrel', 668, GROUND - 62, 46, 62, 40);
  add('vase', 644, GROUND - 62 - 44, 34, 44, 12);
  for (let col = 0; col < 3; col++)
    for (let row = 0; row < 7; row++)
      add('brick', 800 + col * 46, GROUND - (row + 1) * 31, 46, 31, 28);
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [0.5, 1],
    [1.5, 1],
    [1, 2],
  ].forEach(([cx, ry]) => add('crate', 1010 + cx * 58, GROUND - (ry + 1) * 56, 56, 56, 30));
  add('pillar', 1230, GROUND - 170, 54, 170, 170, { stack: false });
  add('vase', 1240, GROUND - 170 - 44, 34, 44, 12);
  add('vase', 1340, GROUND - 44, 34, 44, 12);
  add('vase', 1382, GROUND - 44, 34, 44, 12);
  add('barrel', 1440, GROUND - 62, 46, 62, 40);
  return P;
}
const DUEL_MAPS = [
  {
    n: 'Le mur du château',
    b: add => {
      for (let col = 0; col < 2; col++)
        for (let row = 0; row < 5; row++)
          add('brick', W / 2 - 46 + col * 46, GROUND - (row + 1) * 31, 46, 31, 28);
      add('crate', 470, GROUND - 56, 56, 56, 30);
      add('vase', 481, GROUND - 100, 34, 44, 12);
      add('crate', W - 526, GROUND - 56, 56, 56, 30);
      add('vase', W - 515, GROUND - 100, 34, 44, 12);
      add('barrel', 620, GROUND - 62, 46, 62, 40);
      add('barrel', W - 666, GROUND - 62, 46, 62, 40);
    },
  },
  {
    n: 'La forêt enchantée',
    b: add => {
      add('bigtree', W / 2 - 40, GROUND - 250, 80, 250, 300, { stack: false });
      add('bigtree', 500, GROUND - 180, 60, 180, 160, { stack: false });
      add('bigtree', W - 560, GROUND - 180, 60, 180, 160, { stack: false });
      add('crate', 660, GROUND - 56, 56, 56, 30);
      add('crate', W - 716, GROUND - 56, 56, 56, 30);
      add('vase', 671, GROUND - 100, 34, 44, 12);
      add('vase', W - 705, GROUND - 100, 34, 44, 12);
    },
  },
  {
    n: 'Les ruines célestes',
    b: add => {
      add('pillar', W / 2 - 27, GROUND - 150, 54, 150, 170, { stack: false });
      add('slab', W / 2 - 90, 430, 180, 26, 140, { stack: false });
      add('vase', W / 2 - 17, 386, 34, 44, 12);
      add('slab', 430, 545, 150, 24, 110, { stack: false });
      add('slab', W - 580, 545, 150, 24, 110, { stack: false });
      add('pillar', 600, GROUND - 110, 44, 110, 120, { stack: false });
      add('pillar', W - 644, GROUND - 110, 44, 110, 120, { stack: false });
    },
  },
  {
    n: 'Le champ de tonneaux',
    b: add => {
      const c = W / 2;
      [
        [c - 69, 0],
        [c - 23, 0],
        [c + 23, 0],
        [c - 46, 1],
        [c, 1],
        [c - 23, 2],
        [520, 0],
        [566, 0],
        [543, 1],
        [W - 566, 0],
        [W - 612, 0],
        [W - 589, 1],
      ].forEach(([x, r]) => add('barrel', x, GROUND - 62 * (r + 1), 46, 62, 40));
      add('vase', c - 17, GROUND - 230, 34, 44, 12);
    },
  },
  {
    n: 'Les deux tours',
    b: add => {
      for (const bx of [420, W - 512])
        for (let col = 0; col < 2; col++)
          for (let row = 0; row < 6; row++)
            add('brick', bx + col * 46, GROUND - (row + 1) * 31, 46, 31, 28);
      add('crate', W / 2 - 28, GROUND - 56, 56, 56, 30);
      add('vase', W / 2 - 17, GROUND - 100, 34, 44, 12);
      add('scarecrow', W / 2 - 140, GROUND - 130, 56, 130, 90, { stack: false });
      add('scarecrow', W / 2 + 84, GROUND - 130, 56, 130, 90, { stack: false });
    },
  },
];
function buildDuel() {
  const [P, add] = propFactory();
  DUEL_MAPS[G.duelMap % DUEL_MAPS.length].b(add);
  return P;
}
function pickMap() {
  let n;
  do {
    n = (Math.random() * DUEL_MAPS.length) | 0;
  } while (n === G.duelMap && DUEL_MAPS.length > 1);
  G.duelMap = n;
}
G.props = buildArena();
const propTop = q => q.y + q.h * (1 - easeBack(q.rise));
