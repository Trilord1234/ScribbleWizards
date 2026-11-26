/* Scribble Wizards — state.js
   Wizards, global game state and quality settings. */
/* ---------- wizards & game state ---------- */
function mkWiz(i) {
  const d = store.get('sw_w' + i, null) || {};
  return {
    i,
    x: i ? W - 150 : 150,
    side: i ? -1 : 1,
    robe: d.robe || (i ? '#e0457b' : '#6b4cff'),
    name: d.name || (i ? 'Morgane' : 'Merlin'),
    layers: cleanL(d.layers || (i ? ['fish', 'bite', 'arrow'] : ['flame'])),
    saw: !!d.saw,
    dark: !!d.dark,
    hurt: 0,
    recoil: 0,
    cd: 0,
    haste: 0,
    aim: i ? Math.PI + 0.2 : -0.2,
    ent: null,
  };
}
const WZ = [mkWiz(0), mkWiz(1)];
let ed = 0;
const CW = () => WZ[ed];
const saveW = w =>
  store.set('sw_w' + w.i, {
    robe: w.robe,
    name: w.name,
    layers: w.layers,
    saw: w.saw,
    dark: w.dark,
  });
const cvs = $('#game'),
  ctx = cvs.getContext('2d');
const G = {
  mode: 'arena',
  projs: [],
  parts: [],
  props: [],
  enemies: [],
  plants: [],
  pickups: [],
  zones: [],
  bolts: [],
  texts: [],
  shake: 0,
  hearts: 5,
  maxHearts: 5,
  wave: 0,
  waveActive: false,
  spawnQ: [],
  spawnT: 0,
  score: 0,
  broken: 0,
  cast: [],
  aim: { x: 900, y: 560 },
  firing: false,
  banner: null,
  over: false,
  time: 0,
  steal: 0,
  blood: 0,
  duel: { state: 'idle', t: 0 },
};
