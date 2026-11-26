/* Scribble Wizards — ui.js
   Grimoire (spell book) interface, buttons and settings. */
/* ---------- spell editor UI ---------- */
const pv = $('#cv'),
  pctx = pv.getContext('2d');
function sizePreview() {
  const r = pv.getBoundingClientRect(),
    d = window.devicePixelRatio || 1;
  pv.width = Math.max(1, r.width * d);
  pv.height = Math.max(1, r.height * d);
}
const ro2 = new ResizeObserver(sizePreview);
ro2.observe(pv);
function renderPreview(t) {
  const w = pv.width,
    h = pv.height,
    cw = CW();
  pctx.setTransform(1, 0, 0, 1, 0, 0);
  pctx.clearRect(0, 0, w, h);
  const g = pctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, cw.dark ? 'rgba(150,60,255,.2)' : 'rgba(246,196,83,.16)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  pctx.fillStyle = g;
  pctx.fillRect(0, 0, w, h);
  pctx.translate(w / 2, h / 2);
  drawCircle(pctx, w * 0.4, cw.layers, cw.saw, t, 1, true, cw.dark);
}
function icon(k, px, dk) {
  const c = document.createElement('canvas'),
    d = window.devicePixelRatio || 1;
  c.width = px * d;
  c.height = px * d;
  const x = c.getContext('2d');
  x.scale(d, d);
  x.translate(px / 2, px / 2);
  drawSym(x, k, px * 0.95, symCol(k, dk));
  return c;
}
function buildPalette() {
  const dk = CW().dark;
  for (const [sel, bonus] of [
    ['#palette', false],
    ['#palette2', true],
  ]) {
    const el = $(sel);
    el.textContent = '';
    SYMS.filter(s => !!s.bonus === bonus).forEach(s => {
      const b = document.createElement('button');
      b.className = 'sym' + (dk && DARK[s.k] ? ' dk' : '');
      b.type = 'button';
      b.dataset.k = s.k;
      b.append(icon(s.k, 38, dk));
      const sp = document.createElement('span');
      sp.textContent = symName(s.k, dk) + (s.ext ? ' (ext.)' : '');
      b.append(sp);
      b.title = symDesc(s.k, dk);
      const show = () =>
        ($('#hint').textContent = symName(s.k, CW().dark) + ' : ' + symDesc(s.k, CW().dark));
      b.addEventListener('click', () => addLayer(s.k));
      b.addEventListener('mouseenter', show);
      b.addEventListener('focus', show);
      el.append(b);
    });
  }
}
function addLayer(k) {
  const w = CW();
  if (k === 'saw') {
    w.saw = !w.saw;
    $('#hint').textContent = w.saw
      ? "Dents de scie posées à l'extérieur du cercle."
      : 'Dents de scie retirées.';
  } else {
    if (w.layers.length >= MAXL) {
      $('#hint').textContent = 'Le cercle est plein ! (' + MAXL + ' dessins maximum)';
      return;
    }
    w.layers.push(k);
    $('#hint').textContent = symName(k, w.dark) + ' ajouté au centre du cercle.';
  }
  changed();
}
function changed() {
  saveW(CW());
  renderLayers();
  renderReading();
}
function renderLayers() {
  const w = CW(),
    ol = $('#layers');
  ol.textContent = '';
  document.querySelectorAll('.sym[data-k="saw"]').forEach(b => b.classList.toggle('on', w.saw));
  if (w.saw) {
    const li = document.createElement('li');
    li.className = 'ext';
    const n = document.createElement('span');
    n.className = 'num';
    n.textContent = 'ext';
    li.append(n, icon('saw', 30, w.dark));
    const nm = document.createElement('span');
    nm.className = 'nm';
    nm.textContent = 'Dents de scie (dehors)';
    li.append(nm);
    li.append(
      mini('✕', 'Retirer', () => {
        w.saw = false;
        changed();
      })
    );
    ol.append(li);
  }
  if (!w.layers.length && !w.saw) {
    const li = document.createElement('li');
    li.textContent = 'Cercle vide : la balle sera une simple boule magique.';
    li.style.color = 'var(--mute)';
    ol.append(li);
  }
  w.layers.forEach((k, i) => {
    const li = document.createElement('li');
    const n = document.createElement('span');
    n.className = 'num';
    n.textContent = i + 1;
    const nm = document.createElement('span');
    nm.className = 'nm';
    nm.textContent = symName(k, w.dark);
    li.append(
      n,
      icon(k, 30, w.dark),
      nm,
      mini('↑', 'Vers l’extérieur', () => {
        if (i > 0) {
          [w.layers[i - 1], w.layers[i]] = [w.layers[i], w.layers[i - 1]];
          changed();
        }
      }),
      mini('↓', 'Vers l’intérieur', () => {
        if (i < w.layers.length - 1) {
          [w.layers[i + 1], w.layers[i]] = [w.layers[i], w.layers[i + 1]];
          changed();
        }
      }),
      mini('✕', 'Retirer', () => {
        w.layers.splice(i, 1);
        changed();
      })
    );
    ol.append(li);
  });
}
function mini(t, label, fn) {
  const b = document.createElement('button');
  b.className = 'mini';
  b.type = 'button';
  b.textContent = t;
  b.setAttribute('aria-label', label);
  b.title = label;
  b.addEventListener('click', fn);
  return b;
}
function renderReading() {
  const w = CW(),
    el = $('#reading'),
    spec = compW(w);
  el.textContent = '';
  const h = document.createElement('div');
  h.style.fontWeight = '800';
  h.textContent = 'Lecture du sort de ' + w.name + (w.dark ? ' (mage noir)' : '');
  el.append(h);
  if (!w.layers.length && !w.saw) {
    const p = document.createElement('div');
    p.className = 'empty';
    p.textContent = w.dark
      ? 'Une boule de magie noire toute simple. Ajoute des dessins !'
      : 'Une boule de magie toute simple. Ajoute des dessins !';
    el.append(p);
    return;
  }
  const ol = document.createElement('ol');
  if (w.saw) {
    const li = document.createElement('li');
    li.textContent = 'Dehors, dents de scie : ' + SM.saw.d.replace('(Extérieur du cercle) ', '');
    li.style.listStyle = 'none';
    ol.append(li);
  }
  w.layers.forEach(k => {
    const li = document.createElement('li');
    li.textContent = symName(k, w.dark) + ' : ' + symDesc(k, w.dark);
    if (w.dark && DARK[k]) li.style.color = '#d9a6ff';
    ol.append(li);
  });
  el.append(ol);
  for (const s of spec.syn) {
    const d = document.createElement('div');
    d.className = 'syn';
    d.textContent = discovered.has(s)
      ? '✦ Synergie : ' + SYNM[s].n + ' — ' + SYNM[s].d
      : "✦ Une synergie secrète s'est formée… tire pour la découvrir !";
    el.append(d);
  }
}
function renderBook() {
  const el = $('#book');
  el.textContent = '';
  $('#syncount').textContent = '(' + discovered.size + '/' + SYN.length + ')';
  SYN.forEach(s => {
    const d = document.createElement('div'),
      on = discovered.has(s.id);
    d.className = 'entry' + (on ? '' : ' lock');
    const b = document.createElement('b');
    b.textContent = on ? s.n : '???';
    const r = document.createElement('div');
    r.className = 'rec';
    r.textContent = on
      ? s.any
        ? SM[s.a].n + ' + ' + SM[s.b].n
        : SM[s.a].n + ' puis ' + SM[s.b].n
      : SM[s.a].n + (s.any ? ' + ???' : ' puis ???');
    const p = document.createElement('p');
    p.textContent = on ? s.d : 'Pas encore découverte.';
    d.append(b, r, p);
    el.append(d);
  });
}
function renderDarkBook() {
  const el = $('#darkbook');
  el.textContent = '';
  for (const k in DARK) {
    const d = document.createElement('div');
    d.className = 'entry dk';
    const b = document.createElement('b');
    b.textContent = DARK[k].n;
    const r = document.createElement('div');
    r.className = 'rec';
    r.textContent = 'au lieu de : ' + SM[k].n;
    const p = document.createElement('p');
    p.textContent = DARK[k].d;
    d.append(b, r, p);
    el.append(d);
  }
}
function renderGrim() {
  const el = $('#grim');
  el.textContent = '';
  grimoire.forEach((g, i) => {
    const c = document.createElement('div');
    c.className = 'chip' + (g.d ? ' dk' : '');
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = g.n + (g.d ? ' (noir)' : '');
    b.addEventListener('click', () => {
      const w = CW();
      w.layers = cleanL(g.l);
      w.saw = !!g.s;
      w.dark = !!g.d;
      saveW(w);
      renderWizard();
      $('#hint').textContent = 'Sort « ' + g.n + ' » chargé pour ' + w.name + '.';
    });
    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'x';
    x.textContent = '✕';
    x.setAttribute('aria-label', 'Supprimer ' + g.n);
    x.addEventListener('click', () => {
      grimoire.splice(i, 1);
      store.set('sw_grim2', grimoire);
      renderGrim();
    });
    c.append(b, x);
    el.append(c);
  });
}
$('#save').addEventListener('click', () => {
  const w = CW(),
    n = $('#spellname').value.trim() || 'Sort n°' + (grimoire.length + 1);
  grimoire.push({ n, l: w.layers.slice(), s: w.saw, d: w.dark });
  store.set('sw_grim2', grimoire);
  $('#spellname').value = '';
  renderGrim();
});
$('#undo').addEventListener('click', () => {
  const w = CW();
  if (w.layers.length) w.layers.pop();
  else w.saw = false;
  changed();
});
$('#clear').addEventListener('click', () => {
  const w = CW();
  w.layers = [];
  w.saw = false;
  changed();
});
const ROBES = ['#6b4cff', '#e0457b', '#2bb673', '#f08a24', '#2a9df4', '#8d5b3a'];
ROBES.forEach(c => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'robe';
  b.dataset.c = c;
  b.style.background = c;
  b.setAttribute('aria-label', 'Couleur ' + c);
  b.addEventListener('click', () => {
    CW().robe = c;
    saveW(CW());
    renderWizard();
  });
  $('#robes').append(b);
});
const wn = $('#wname');
wn.addEventListener('input', () => {
  CW().name = wn.value.slice(0, 14) || 'Sorcier';
  saveW(CW());
  renderTabs();
  renderReading();
});
$('#darkbtn').addEventListener('click', () => {
  const w = CW();
  w.dark = !w.dark;
  saveW(w);
  sfx(w.dark ? 'evil' : 'win');
  if (G.mode === 'arena' || w.ent)
    txt(
      w.x,
      GROUND - 220,
      w.dark ? 'Mage noir !' : 'Mage blanc !',
      w.dark ? '#d9a6ff' : '#fff',
      32
    );
  renderWizard();
});
document.querySelectorAll('.tab').forEach(t =>
  t.addEventListener('click', () => {
    ed = +t.dataset.i;
    renderWizard();
  })
);
function renderTabs() {
  document.querySelectorAll('.tab').forEach(t => {
    const i = +t.dataset.i;
    t.textContent = 'Sorcier ' + (i + 1) + ' · ' + WZ[i].name;
    t.classList.toggle('on', i === ed);
    t.hidden = i === 1 && G.mode !== 'duel';
  });
}
function renderWizard() {
  const w = CW();
  if (document.activeElement !== wn) wn.value = w.name;
  $('#darkbtn').textContent = w.dark ? 'Redevenir mage blanc' : 'Devenir mage noir';
  $('#workshop').classList.toggle('is-dark', w.dark);
  document.querySelectorAll('.robe').forEach(b => b.classList.toggle('on', b.dataset.c === w.robe));
  renderTabs();
  buildPalette();
  renderLayers();
  renderReading();
}
function updUI() {
  const duel = G.mode === 'duel',
    b = $('#wave');
  $('#mArena').classList.toggle('on', !duel);
  $('#mDuel').classList.toggle('on', duel);
  $('#rebuild').hidden = duel;
  if (duel) {
    const s = G.duel.state;
    b.disabled = s === 'count' || s === 'fight';
    b.textContent = s === 'end' ? 'Revanche !' : s === 'idle' ? 'Lancer le duel' : 'Duel en cours…';
    $('#help').textContent =
      "Duel : choisissez « Sorcier 1 » ou « Sorcier 2 » dans l'atelier pour dessiner le cercle de chacun (et devenir mage noir si vous voulez), puis lancez le duel. Les sorciers visent et tirent tout seuls. On peut changer les cercles pendant le combat !";
  } else {
    b.disabled = G.waveActive;
    b.textContent = G.waveActive
      ? 'Vague ' + G.wave + ' en cours…'
      : 'Lancer la vague ' + (G.wave + 1);
    $('#help').textContent =
      "Vise avec la souris ou le doigt, clique pour lancer le sort. Reste appuyé pour tirer en rafale. Barre espace = tirer. Les objets se fissurent puis se cassent, et les monstres s'arrêtent pour taper sur ce qui leur bloque le passage.";
  }
  renderTabs();
}
function setMode(m) {
  G.mode = m;
  G.projs = [];
  G.enemies = [];
  G.pickups = [];
  G.zones = [];
  G.bolts = [];
  G.spawnQ = [];
  G.waveActive = false;
  G.over = false;
  G.cast = [];
  $('#overlay').hidden = true;
  G.firing = false;
  WZ.forEach(w => {
    w.ent = null;
    w.haste = 0;
    w.hurt = 0;
  });
  if (m === 'duel') {
    G.props = buildDuel();
    setupDuel();
    G.duel = { state: 'idle', t: 0 };
  } else {
    G.props = buildArena();
    ed = 0;
    G.wave = 0;
  }
  renderWizard();
  updUI();
}
$('#mArena').addEventListener('click', () => {
  if (G.mode !== 'arena') setMode('arena');
});
$('#mDuel').addEventListener('click', () => {
  if (G.mode !== 'duel') setMode('duel');
});
$('#wave').addEventListener('click', () => {
  sfx('pop');
  if (G.mode === 'duel') startDuel();
  else startWave();
});
$('#rebuild').addEventListener('click', () => {
  G.props = buildArena();
  G.pickups = [];
  G.zones = [];
  banner('Arène reconstruite', 'Tout est neuf, prêt à être cassé !');
});
$('#mute').addEventListener('click', e => {
  muted = !muted;
  e.currentTarget.textContent = 'Son : ' + (muted ? 'non' : 'oui');
});
$('#again').addEventListener('click', () => {
  G.hearts = G.maxHearts;
  G.wave = 0;
  G.enemies = [];
  G.spawnQ = [];
  G.waveActive = false;
  G.over = false;
  $('#overlay').hidden = true;
  G.props = buildArena();
  updUI();
});

renderWizard();
renderBook();
renderDarkBook();
renderGrim();
updUI();
