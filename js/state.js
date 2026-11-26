/* Scribble Wizards — state.js
   Wizards, global game state and quality settings. */
/* ---------- game state ---------- */
const cvs = $('#game'),
  ctx = cvs.getContext('2d');
const G = {
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
  cd: 0,
  cast: null,
  aim: { x: 900, y: 560 },
  firing: false,
  banner: null,
  over: false,
  time: 0,
};
const WIZ = {
  x: 150,
  robe: store.get('sw_robe', '#6b4cff'),
  name: store.get('sw_name', 'Merlin'),
  hurt: 0,
  recoil: 0,
};
