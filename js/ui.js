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
    h = pv.height;
  pctx.setTransform(1, 0, 0, 1, 0, 0);
  pctx.clearRect(0, 0, w, h);
  const g = pctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(246,196,83,.16)');
  g.addColorStop(1, 'rgba(246,196,83,0)');
  pctx.fillStyle = g;
  pctx.fillRect(0, 0, w, h);
  pctx.translate(w / 2, h / 2);
  drawCircle(pctx, w * 0.4, layers, saw, t, 1, true);
}
function icon(k, px) {
  const c = document.createElement('canvas'),
    d = window.devicePixelRatio || 1;
  c.width = px * d;
  c.height = px * d;
  const x = c.getContext('2d');
  x.scale(d, d);
  x.translate(px / 2, px / 2);
  drawSym(x, k, px * 0.95, SM[k].c);
  return c;
}
function buildPalette() {
  for (const [sel, bonus] of [
    ['#palette', false],
    ['#palette2', true],
  ]) {
    const el = $(sel);
    SYMS.filter(s => !!s.bonus === bonus).forEach(s => {
      const b = document.createElement('button');
      b.className = 'sym';
      b.type = 'button';
      b.dataset.k = s.k;
      b.append(icon(s.k, 38));
      const sp = document.createElement('span');
      sp.textContent = s.n + (s.ext ? ' (ext.)' : '');
      b.append(sp);
      b.title = s.d;
      b.addEventListener('click', () => addLayer(s.k));
      b.addEventListener('mouseenter', () => ($('#hint').textContent = s.n + ' : ' + s.d));
      b.addEventListener('focus', () => ($('#hint').textContent = s.n + ' : ' + s.d));
      el.append(b);
    });
  }
}
function addLayer(k) {
  if (k === 'saw') {
    saw = !saw;
    $('#hint').textContent = saw
      ? "Dents de scie posées à l'extérieur du cercle."
      : 'Dents de scie retirées.';
  } else {
    if (layers.length >= MAXL) {
      $('#hint').textContent = 'Le cercle est plein ! (' + MAXL + ' dessins maximum)';
      return;
    }
    layers.push(k);
    $('#hint').textContent = SM[k].n + ' ajouté au centre du cercle.';
  }
  changed();
}
function changed() {
  store.set('sw_layers', layers);
  store.set('sw_saw', saw);
  renderLayers();
  renderReading();
}
function renderLayers() {
  const ol = $('#layers');
  ol.textContent = '';
  document.querySelectorAll('.sym[data-k="saw"]').forEach(b => b.classList.toggle('on', saw));
  if (saw) {
    const li = document.createElement('li');
    li.className = 'ext';
    const n = document.createElement('span');
    n.className = 'num';
    n.textContent = 'ext';
    li.append(n, icon('saw', 30));
    const nm = document.createElement('span');
    nm.className = 'nm';
    nm.textContent = 'Dents de scie (dehors)';
    li.append(nm);
    li.append(
      mini('✕', 'Retirer', () => {
        saw = false;
        changed();
      })
    );
    ol.append(li);
  }
  if (!layers.length && !saw) {
    const li = document.createElement('li');
    li.textContent = 'Cercle vide : la balle sera une simple boule magique.';
    li.style.color = 'var(--mute)';
    ol.append(li);
  }
  layers.forEach((k, i) => {
    const li = document.createElement('li');
    const n = document.createElement('span');
    n.className = 'num';
    n.textContent = i + 1;
    const nm = document.createElement('span');
    nm.className = 'nm';
    nm.textContent = SM[k].n;
    li.append(
      n,
      icon(k, 30),
      nm,
      mini('↑', 'Vers l’extérieur', () => {
        if (i > 0) {
          [layers[i - 1], layers[i]] = [layers[i], layers[i - 1]];
          changed();
        }
      }),
      mini('↓', 'Vers l’intérieur', () => {
        if (i < layers.length - 1) {
          [layers[i + 1], layers[i]] = [layers[i], layers[i + 1]];
          changed();
        }
      }),
      mini('✕', 'Retirer', () => {
        layers.splice(i, 1);
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
  const el = $('#reading'),
    spec = compile(layers, saw);
  el.textContent = '';
  const h = document.createElement('div');
  h.style.fontWeight = '800';
  h.textContent = 'Lecture du sort';
  el.append(h);
  if (!layers.length && !saw) {
    const p = document.createElement('div');
    p.className = 'empty';
    p.textContent = 'Une boule de magie toute simple. Ajoute des dessins !';
    el.append(p);
    return;
  }
  const ol = document.createElement('ol');
  if (saw) {
    const li = document.createElement('li');
    li.textContent = 'Dehors, dents de scie : ' + SM.saw.d.replace('(Extérieur du cercle) ', '');
    li.style.listStyle = 'none';
    ol.append(li);
  }
  layers.forEach(k => {
    const li = document.createElement('li');
    li.textContent = SM[k].n + ' : ' + SM[k].d;
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
function renderGrim() {
  const el = $('#grim');
  el.textContent = '';
  grimoire.forEach((g, i) => {
    const c = document.createElement('div');
    c.className = 'chip';
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = g.n;
    b.addEventListener('click', () => {
      layers = (g.l || []).filter(k => SM[k] && k !== 'saw').slice(0, MAXL);
      saw = !!g.s;
      changed();
      $('#hint').textContent = 'Sort « ' + g.n + ' » chargé.';
    });
    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'x';
    x.textContent = '✕';
    x.setAttribute('aria-label', 'Supprimer ' + g.n);
    x.addEventListener('click', () => {
      grimoire.splice(i, 1);
      store.set('sw_grim', grimoire);
      renderGrim();
    });
    c.append(b, x);
    el.append(c);
  });
}
$('#save').addEventListener('click', () => {
  const n = $('#spellname').value.trim() || 'Sort n°' + (grimoire.length + 1);
  grimoire.push({ n, l: layers.slice(), s: saw });
  store.set('sw_grim', grimoire);
  $('#spellname').value = '';
  renderGrim();
});
$('#undo').addEventListener('click', () => {
  if (layers.length) layers.pop();
  else saw = false;
  changed();
});
$('#clear').addEventListener('click', () => {
  layers = [];
  saw = false;
  changed();
});
function updWaveBtn() {
  const b = $('#wave');
  b.disabled = G.waveActive;
  b.textContent = G.waveActive
    ? 'Vague ' + G.wave + ' en cours…'
    : 'Lancer la vague ' + (G.wave + 1);
}
$('#wave').addEventListener('click', () => {
  sfx('pop');
  startWave();
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
  updWaveBtn();
});
const wn = $('#wname');
wn.value = WIZ.name;
wn.addEventListener('input', () => {
  WIZ.name = wn.value.slice(0, 14);
  store.set('sw_name', WIZ.name);
});
const ROBES = ['#6b4cff', '#e0457b', '#2bb673', '#f08a24', '#2a9df4', '#8d5b3a'];
ROBES.forEach(c => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'robe' + (c === WIZ.robe ? ' on' : '');
  b.style.background = c;
  b.setAttribute('aria-label', 'Robe ' + c);
  b.addEventListener('click', () => {
    WIZ.robe = c;
    store.set('sw_robe', c);
    document.querySelectorAll('.robe').forEach(x => x.classList.toggle('on', x === b));
  });
  $('#robes').append(b);
});

buildPalette();
renderLayers();
renderReading();
renderBook();
renderGrim();
updWaveBtn();
