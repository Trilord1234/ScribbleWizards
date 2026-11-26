/* Scribble Wizards — data.js
   Game data: drawings (symbols), dark-mage variants, synergies, stacking levels, costs and saved settings. */
const $ = s => document.querySelector(s);
const TAU = Math.PI * 2,
  rnd = (a, b) => a + Math.random() * (b - a),
  clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const W = 1600,
  H = 900,
  GROUND = 790,
  MAXL = 10;

const SYMS = [
  {
    k: 'heart',
    n: 'Cœur',
    c: '#ff6fae',
    d: "Double la balle : les deux balles tournent l'une autour de l'autre, en mode câlin.",
  },
  {
    k: 'square',
    n: 'Carré',
    c: '#c3c9d3',
    d: 'Transforme la balle en parpaing. Lourd, ça cogne fort !',
  },
  { k: 'triangle', n: 'Triangle', c: '#7cf2c8', d: 'La balle vole en dessinant des triangles.' },
  {
    k: 'saw',
    n: 'Dents de scie',
    c: '#e9edf3',
    d: '(Extérieur du cercle) Transforme la balle en scie circulaire qui traverse tout.',
    ext: true,
  },
  { k: 'mountain', n: 'Montagne', c: '#b5cc72', d: 'Rend la balle géante.' },
  {
    k: 'gravity',
    n: 'Deux traits',
    c: '#a68bff',
    d: 'Grosse gravité : la balle tombe lourdement et fait BOUM au sol.',
  },
  { k: 'flame', n: 'Flamme', c: '#ff8a3d', d: "Effets de feu : enflamme ce qu'elle touche." },
  { k: 'snow', n: 'Flocon', c: '#8fe3ff', d: 'Effets de gel : gèle les monstres sur place.' },
  {
    k: 'bite',
    n: 'Lune à dents',
    c: '#ffd84d',
    d: 'La balle ouvre et ferme la bouche pour mordre. CROC !',
  },
  { k: 'ghost', n: 'Fantôme', c: '#dfe7ff', d: 'Passe à travers les murs et les obstacles.' },
  { k: 'zigzag', n: 'Zigzag', c: '#ff9de2', d: 'Trajectoire complètement aléatoire.' },
  {
    k: 'dots',
    n: 'Petits ronds',
    c: '#ffcf7a',
    d: 'Baguette fusil à pompe : une gerbe de petites balles.',
  },
  { k: 'arrow', n: 'Flèche', c: '#6fd0ff', d: 'La balle va beaucoup plus vite.' },
  {
    k: 'fish',
    n: 'Poisson',
    c: '#4fc3ff',
    d: 'Transforme la balle en poisson (jamais le même !).',
  },
  {
    k: 'egg',
    n: 'Œuf',
    c: '#fff1cf',
    d: 'Balle à fragmentation : se casse au contact en plein de morceaux.',
  },
  { k: 'cushion', n: 'Coussin', c: '#ffa7c4', d: 'La balle rebondit partout.' },
  { k: 'tree', n: 'Arbre', c: '#5fd36f', d: 'Fait pousser des fleurs et des arbres.' },
  {
    k: 'coin',
    n: "Pièce d'or",
    c: '#ffc93c',
    d: "La balle devient une pièce d'or : les monstres gourmands courent après !",
  },
  {
    k: 'wall',
    n: 'Mur',
    c: '#d2cdc0',
    d: 'Fait sortir un petit mur de béton du sol, là où la balle tombe.',
  },
  { k: 'star', n: 'Étoile', c: '#fff07a', d: "Explose en feu d'artifice.", bonus: 1 },
  { k: 'bolt', n: 'Éclair', c: '#fff59a', d: "L'éclair saute d'un monstre à l'autre.", bonus: 1 },
  {
    k: 'magnet',
    n: 'Aimant',
    c: '#ff6464',
    d: 'Tête chercheuse : la balle poursuit le monstre le plus proche.',
    bonus: 1,
  },
  {
    k: 'bubble',
    n: 'Bulle',
    c: '#a6f6ff',
    d: "Enferme le monstre dans une bulle qui s'envole.",
    bonus: 1,
  },
  {
    k: 'hourglass',
    n: 'Sablier',
    c: '#e8c07a',
    d: 'Crée une zone où le temps ralentit pour les monstres.',
    bonus: 1,
  },
];
const SM = {};
SYMS.forEach(s => (SM[s.k] = s));

const SYN = [
  {
    id: 'icefire',
    a: 'flame',
    b: 'snow',
    n: 'Feu glacé',
    d: 'Des flammes bleues qui brûlent ET gèlent en même temps.',
  },
  {
    id: 'steam',
    a: 'snow',
    b: 'flame',
    n: 'Explosion de vapeur',
    d: 'Un gros nuage de vapeur qui étourdit tous les monstres autour.',
  },
  {
    id: 'caviar',
    a: 'egg',
    b: 'fish',
    n: 'Caviar',
    d: "L'œuf éclate en plein de petits poissons.",
  },
  {
    id: 'egglay',
    a: 'fish',
    b: 'egg',
    n: 'Ponte en vol',
    d: "Le poisson pond des œufs pendant qu'il vole.",
  },
  {
    id: 'xmas',
    a: 'tree',
    b: 'snow',
    n: 'Sapin de Noël',
    d: 'Fait pousser des sapins décorés qui clignotent.',
  },
  {
    id: 'money',
    a: 'tree',
    b: 'coin',
    n: 'Arbre à sous',
    d: "L'arbre fait tomber des pièces d'or de temps en temps.",
  },
  {
    id: 'jackpot',
    a: 'coin',
    b: 'cushion',
    n: 'Jackpot',
    d: 'À chaque rebond, des pièces giclent partout.',
  },
  {
    id: 'snowball',
    a: 'snow',
    b: 'cushion',
    n: 'Boule de neige',
    d: 'Grossit et tape plus fort à chaque rebond.',
  },
  {
    id: 'rampart',
    a: 'mountain',
    b: 'wall',
    n: 'Rempart',
    d: "Un énorme mur de château au lieu d'un petit mur.",
  },
  {
    id: 'tramp',
    a: 'wall',
    b: 'cushion',
    n: 'Trampoline',
    d: 'Un trampoline qui renvoie les monstres en arrière.',
  },
  {
    id: 'ram',
    a: 'square',
    b: 'arrow',
    n: 'Bélier',
    d: 'Un parpaing ultra rapide qui traverse et repousse très loin.',
  },
  {
    id: 'ghosteater',
    a: 'ghost',
    b: 'bite',
    n: 'Glouton spectral',
    d: 'Passe à travers les murs… et les croque au passage.',
  },
  {
    id: 'blackhole',
    a: 'gravity',
    b: 'egg',
    n: 'Trou noir',
    d: "L'œuf libère un mini trou noir qui aspire les monstres.",
  },
  {
    id: 'love',
    a: 'dots',
    b: 'heart',
    n: "Pluie d'amour",
    d: 'Des cœurs qui rendent les monstres gentils : ils rentrent chez eux.',
  },
  {
    id: 'pyramid',
    a: 'triangle',
    b: 'mountain',
    n: 'Pyramide',
    d: 'Fait surgir une pyramide de pierre.',
  },
  {
    id: 'rocket',
    a: 'zigzag',
    b: 'arrow',
    n: 'Fusée folle',
    d: 'Une fusée qui part dans tous les sens et explose.',
  },
  {
    id: 'starlove',
    a: 'star',
    b: 'heart',
    n: "Feu d'artifice d'amour",
    d: "Le feu d'artifice rend gentils tous les monstres autour.",
  },
  {
    id: 'sawfish',
    a: 'saw',
    b: 'fish',
    any: 1,
    n: 'Poisson-scie',
    d: 'Dents de scie dehors + un poisson dedans = un vrai poisson-scie !',
  },
];
const SYNM = {};
SYN.forEach(s => (SYNM[s.id] = s));

const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch (e) {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  },
};
const PRESETS = [
  { n: 'Boule de feu', l: ['mountain', 'flame'], s: false },
  { n: 'Poisson-scie glouton', l: ['fish', 'bite', 'arrow'], s: true },
  { n: 'Fusil à flocons', l: ['dots', 'snow', 'arrow'], s: false },
  { n: 'Parpaing rebondissant', l: ['square', 'cushion', 'cushion'], s: false },
];
let layers = (store.get('sw_layers', ['flame']) || [])
  .filter(k => SM[k] && k !== 'saw')
  .slice(0, MAXL);
let saw = !!store.get('sw_saw', false);
let discovered = new Set(store.get('sw_disc', []).filter(id => SYNM[id]));
let grimoire = store.get('sw_grim', PRESETS);
if (!Array.isArray(grimoire)) grimoire = PRESETS.slice();
