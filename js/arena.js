/* Scribble Wizards — arena.js
   Arena and duel map layouts. */
/* ---------- arena ---------- */
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
};
const WOOD = new Set(['crate', 'barrel', 'scarecrow']);
function buildArena() {
  const P = [],
    add = (kind, x, y, w, h, hp, o = {}) =>
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
          },
          o
        )
      );
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
G.props = buildArena();
const propTop = q => q.y + q.h * (1 - easeBack(q.rise));
