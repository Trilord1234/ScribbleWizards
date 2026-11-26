/* Scribble Wizards — spells.js
   Turns a circle (list of drawings) into a spell description, and fish species. */
/* ---------- spell compile ---------- */
function compile(ls, sw, dk) {
  const n = {};
  ls.forEach(k => (n[k] = (n[k] || 0) + 1));
  const seq = sw ? ['saw', ...ls] : ls.slice(),
    syn = new Set();
  for (let i = 0; i < seq.length - 1; i++)
    for (const s of SYN) if (!s.any && s.a === seq[i] && s.b === seq[i + 1]) syn.add(s.id);
  if (sw && n.fish) syn.add('sawfish');
  let body = 'orb';
  for (const k of ls) if (k === 'square' || k === 'fish' || k === 'coin') body = k;
  if (sw && body === 'orb') body = 'saw';
  let shape = 'orb';
  for (const k of ls) {
    if (['egg', 'cushion', 'ghost', 'bite', 'star'].includes(k))
      shape = dk && k === 'bite' ? 'skull' : k;
    if (dk && k === 'zigzag') shape = 'bat';
  }
  return { n, syn, saw: sw, body, shape, layers: ls.slice(), dark: !!dk };
}
const compW = w => compile(w.layers, w.saw, w.dark);
function spellCol(k) {
  if (k.dark) {
    if (k.n.flame) return '#c34dff';
    if (k.n.snow) return '#5fe3b0';
    if (k.n.bubble) return '#8dff6a';
    return '#a45cff';
  }
  if (k.syn.has('icefire')) return '#7fc8ff';
  const l = k.layers;
  if (k.n.flame) return '#ff8a3d';
  if (k.n.snow) return '#8fe3ff';
  return l.length ? SM[l[l.length - 1]].c : '#c39bff';
}

const FISH = [
  { n: 'Poisson rouge', b: '#ff8a2a', f: '#ffc06b' },
  { n: 'Poisson-clown', b: '#ff7a1a', f: '#ff9a3a', stripes: '#fff', edge: 1 },
  { n: 'Requin', b: '#8fa3b5', f: '#6c8193', shark: 1 },
  { n: 'Poisson-globe', b: '#f2d24a', f: '#d9a82a', puff: 1 },
  { n: 'Poisson-lune', b: '#c7c9d9', f: '#a0a3ba', moon: 1 },
  { n: 'Espadon', b: '#3b74d9', f: '#2a55a8', sword: 1 },
  { n: 'Poisson tropical', b: '#3be0c9', f: '#ff4fa0', stripes: '#ffe14d' },
  { n: 'Sardine', b: '#b9cfe0', f: '#7f97ad' },
];
const SAWFISH = { n: 'Poisson-scie', b: '#7f93a6', f: '#5d7186', saw: 1, shark: 1 };
const PIRANHA = { n: 'Piranha', b: '#5a6470', f: '#3c434c', belly: '#ff4d4d', teeth: 1 };
