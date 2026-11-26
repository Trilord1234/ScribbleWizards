/* Scribble Wizards — audio.js
   Sound effects and procedural background music (Web Audio API). */
/* ---------- sound ---------- */
let AC = null,
  muted = false,
  noiseBuf = null;
const lastS = {};
function ensureAudio() {
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      const b = AC.createBuffer(1, AC.sampleRate, AC.sampleRate),
        d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noiseBuf = b;
    }
    if (AC.state === 'suspended') AC.resume();
  } catch (e) {}
}
function sfx(type, arg = 1) {
  if (muted || !type) return;
  try {
    ensureAudio();
    if (!AC) return;
    const now = AC.currentTime;
    if (lastS[type] && now - lastS[type] < 0.05) return;
    lastS[type] = now;
    const tone = (f1, f2, dur, wave = 'sine', vol = 0.08, delay = 0) => {
      const o = AC.createOscillator(),
        g = AC.createGain();
      o.type = wave;
      o.frequency.setValueAtTime(f1, now + delay);
      o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), now + delay + dur);
      g.gain.setValueAtTime(vol, now + delay);
      g.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
      o.connect(g).connect(AC.destination);
      o.start(now + delay);
      o.stop(now + delay + dur + 0.02);
    };
    const noise = (dur, freq, vol = 0.12) => {
      const s = AC.createBufferSource(),
        f = AC.createBiquadFilter(),
        g = AC.createGain();
      s.buffer = noiseBuf;
      f.type = 'lowpass';
      f.frequency.value = freq;
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      s.connect(f).connect(g).connect(AC.destination);
      s.start(now);
      s.stop(now + dur);
    };
    switch (type) {
      case 'cast':
        tone(420, 980, 0.16, 'sine', 0.06);
        tone(840, 1500, 0.12, 'triangle', 0.03, 0.03);
        break;
      case 'dcast':
        tone(300, 90, 0.25, 'sawtooth', 0.04);
        tone(150, 60, 0.25, 'sine', 0.06);
        break;
      case 'hit':
        tone(220, 90, 0.09, 'square', 0.04);
        noise(0.06, 1800, 0.05);
        break;
      case 'thud':
        noise(0.09, 700, 0.08);
        break;
      case 'boing':
        tone(180, 620, 0.12, 'sine', 0.08);
        tone(620, 240, 0.14, 'sine', 0.05, 0.11);
        break;
      case 'croc':
        noise(0.05, 4000, 0.1);
        tone(320, 140, 0.07, 'square', 0.05);
        break;
      case 'coin':
        tone(988, 988, 0.08, 'triangle', 0.06);
        tone(1319, 1319, 0.18, 'triangle', 0.06, 0.07);
        break;
      case 'break':
        noise(0.3, 1400, 0.16);
        tone(160, 60, 0.2, 'triangle', 0.06);
        break;
      case 'freeze':
        tone(1800, 2600, 0.2, 'triangle', 0.04);
        tone(2400, 3200, 0.15, 'sine', 0.03, 0.05);
        break;
      case 'boom':
        noise(0.5, 500, 0.22);
        tone(110, 35, 0.45, 'sine', 0.18);
        break;
      case 'zap':
        tone(900, 200, 0.15, 'sawtooth', 0.04);
        noise(0.1, 6000, 0.05);
        break;
      case 'wall':
        noise(0.45, 300, 0.18);
        break;
      case 'hurt':
        tone(320, 110, 0.3, 'square', 0.06);
        break;
      case 'pop':
        tone(600, 1400, 0.06, 'sine', 0.06);
        break;
      case 'evil':
        tone(200, 100, 0.5, 'sawtooth', 0.05);
        tone(203, 98, 0.5, 'sawtooth', 0.05);
        break;
      case 'win':
        [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.18, 'triangle', 0.06, i * 0.09));
        break;
      case 'tick':
        tone(880, 880, 0.1, 'square', 0.04);
        break;
      case 'add': {
        const m = Math.pow(1.26, arg - 1);
        tone(440 * m, 660 * m, 0.1, 'triangle', 0.06);
        break;
      }
      case 'lvl':
        [660, 880, 1320].forEach((f, i) => tone(f, f * 1.01, 0.14, 'triangle', 0.06, i * 0.07));
        tone(1760, 1760, 0.4, 'sine', 0.03, 0.2);
        break;
      case 'remove':
        tone(500, 250, 0.1, 'sine', 0.05);
        break;
      case 'spawn':
        tone(200, 420, 0.12, 'sine', 0.05);
        break;
      case 'squeak':
        tone(2200, 2800, 0.06, 'square', 0.02);
        break;
      case 'step':
        tone(70, 40, 0.18, 'sine', 0.16);
        noise(0.1, 200, 0.08);
        break;
      case 'horn':
        tone(196, 196, 0.5, 'sawtooth', 0.04);
        tone(294, 294, 0.5, 'sawtooth', 0.03, 0.15);
        break;
      case 'fanfare':
        [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
          tone(f, f, 0.22, 'square', 0.035, i * 0.12)
        );
        break;
      case 'sad':
        [392, 370, 349, 330].forEach((f, i) => tone(f, f * 0.97, 0.35, 'sawtooth', 0.04, i * 0.3));
        break;
      case 'grow':
        tone(300, 900, 0.35, 'sine', 0.05);
        tone(600, 1800, 0.35, 'sine', 0.02, 0.05);
        break;
      case 'whoosh':
        noise(0.25, 2500, 0.08);
        break;
      case 'fireup':
        noise(0.3, 900, 0.1);
        tone(120, 200, 0.3, 'sawtooth', 0.03);
        break;
      case 'gulp':
        tone(400, 120, 0.2, 'sine', 0.1);
        tone(150, 90, 0.15, 'sine', 0.08, 0.15);
        break;
      case 'thunder':
        noise(0.9, 250, 0.3);
        noise(0.2, 3000, 0.12);
        break;
      case 'timestop':
        tone(1200, 200, 0.8, 'sine', 0.06);
        tone(600, 100, 0.8, 'triangle', 0.05);
        break;
      case 'rumble':
        noise(0.8, 140, 0.25);
        break;
      case 'snore':
        tone(120, 90, 0.4, 'sawtooth', 0.03);
        break;
      case 'chest':
        [784, 988, 1175, 1568].forEach((f, i) => tone(f, f, 0.25, 'triangle', 0.05, i * 0.08));
        break;
      case 'ko':
        tone(600, 80, 0.6, 'square', 0.05);
        break;
      case 'splash':
        noise(0.35, 1500, 0.12);
        tone(800, 300, 0.2, 'sine', 0.04);
        break;
      case 'click':
        tone(1200, 900, 0.04, 'sine', 0.04);
        break;
      case 'clash':
        tone(1400, 380, 0.14, 'square', 0.04);
        noise(0.12, 4500, 0.09);
        break;
      case 'page':
        noise(0.35, 2400, 0.07);
        tone(300, 600, 0.3, 'sine', 0.03);
        break;
      case 'note': {
        const f = [523, 587, 659, 784, 880][(Math.random() * 5) | 0];
        tone(f, f, 0.25, 'triangle', 0.07);
        tone(f * 2, f * 2, 0.2, 'sine', 0.02, 0.02);
        break;
      }
      case 'portal':
        tone(200, 1600, 0.35, 'sine', 0.06);
        tone(1600, 300, 0.3, 'triangle', 0.03, 0.2);
        break;
      case 'shield':
        tone(900, 1400, 0.25, 'sine', 0.05);
        tone(1350, 2100, 0.25, 'sine', 0.03, 0.05);
        break;
      case 'rain':
        noise(1.2, 3000, 0.06);
        break;
      case 'wind':
        noise(1, 600, 0.15);
        tone(150, 300, 0.8, 'sawtooth', 0.02);
        break;
      case 'web':
        tone(1500, 300, 0.12, 'square', 0.03);
        noise(0.08, 5000, 0.05);
        break;
      case 'potion':
        [0, 0.07, 0.14].forEach(d => tone(600 + Math.random() * 600, 1200, 0.08, 'sine', 0.05, d));
        break;
    }
  } catch (e) {}
}
/* ---------- music (procedural) ---------- */
let musicOn = store.get('sw_music', true),
  MG = null,
  mTimer = null,
  mStep = 0,
  mNext = 0;
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
const SONGS = {
  arena: {
    bpm: 100,
    chords: [
      [60, 64, 67],
      [57, 60, 64],
      [53, 57, 60],
      [55, 59, 62],
    ],
    scale: [72, 74, 76, 79, 81, 84],
    arp: 'sine',
  },
  dark: {
    bpm: 80,
    chords: [
      [50, 53, 57],
      [46, 50, 53],
      [43, 46, 50],
      [45, 49, 52],
    ],
    scale: [62, 65, 67, 69, 70, 74],
    arp: 'triangle',
    drone: 1,
  },
  duel: {
    bpm: 132,
    chords: [
      [57, 60, 64],
      [53, 57, 60],
      [55, 59, 62],
      [52, 56, 59],
    ],
    scale: [69, 71, 72, 76, 79, 81],
    arp: 'square',
    drums: 1,
  },
  dueldark: {
    bpm: 124,
    chords: [
      [50, 53, 57],
      [46, 50, 53],
      [48, 52, 55],
      [45, 49, 52],
    ],
    scale: [62, 65, 67, 69, 70, 74],
    arp: 'square',
    drums: 1,
    drone: 1,
  },
};
function curSong() {
  const dk = G.mode === 'duel' ? WZ.some(w => w.dark) : WZ[0].dark;
  return G.mode === 'duel' ? (dk ? 'dueldark' : 'duel') : dk ? 'dark' : 'arena';
}
function mnote(f, t, dur, type, vol, filt) {
  const o = AC.createOscillator(),
    g = AC.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  if (filt) {
    const fl = AC.createBiquadFilter();
    fl.type = 'lowpass';
    fl.frequency.value = filt;
    o.connect(fl).connect(g);
  } else o.connect(g);
  g.connect(MG);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function mnoise(t, dur, type, freq, vol) {
  const s = AC.createBufferSource(),
    f = AC.createBiquadFilter(),
    g = AC.createGain();
  s.buffer = noiseBuf;
  f.type = type;
  f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(MG);
  s.start(t);
  s.stop(t + dur);
}
function playStep(S, st, t, spb) {
  const bar = Math.floor(st / 16) % S.chords.length,
    ch = S.chords[bar],
    s = st % 16;
  if (s === 0) {
    ch.forEach(n => mnote(NOTE(n), t, spb * 15, 'triangle', 0.035, 1200));
    if (S.drone) mnote(NOTE(ch[0] - 24), t, spb * 16, 'sawtooth', 0.03, 300);
  }
  const an = ch[s % 3] + 12 * ((s >> 2) % 2);
  mnote(
    NOTE(an),
    t,
    spb * 1.5,
    S.arp,
    S.arp === 'square' ? 0.018 : 0.04,
    S.arp === 'square' ? 1800 : 0
  );
  if (s % 8 === 0 || (S.drums && s % 4 === 0)) mnote(NOTE(ch[0] - 12), t, spb * 3, 'sine', 0.11);
  if (s % 4 === 2 && (st * 7919) % 5 > 1)
    mnote(NOTE(S.scale[(st * 31 + bar * 7) % S.scale.length]), t, spb * 2.5, 'triangle', 0.04);
  if (!S.drums && s === 14 && bar % 2)
    mnote(NOTE(S.scale[S.scale.length - 1] + 12), t, spb * 4, 'sine', 0.025);
  if (S.drums) {
    if (s % 4 === 0) {
      const o = AC.createOscillator(),
        g = AC.createGain();
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g).connect(MG);
      o.start(t);
      o.stop(t + 0.2);
    }
    if (s % 2 === 1) mnoise(t, 0.04, 'highpass', 7000, 0.035);
    if (s === 4 || s === 12) mnoise(t, 0.12, 'bandpass', 1800, 0.07);
  }
}
function sched() {
  if (!AC || !MG) return;
  const S = SONGS[curSong()],
    spb = 60 / S.bpm / 2;
  if (mNext < AC.currentTime) mNext = AC.currentTime + 0.05;
  while (mNext < AC.currentTime + 0.15) {
    playStep(S, mStep, mNext, spb);
    mNext += spb;
    mStep = (mStep + 1) % 64;
  }
}
function startMusic() {
  ensureAudio();
  if (!AC) return;
  if (!MG) {
    MG = AC.createGain();
    MG.gain.value = 0;
    MG.connect(AC.destination);
  }
  MG.gain.setTargetAtTime(musicOn ? 0.32 : 0, AC.currentTime, 0.4);
  if (!mTimer) {
    mNext = AC.currentTime + 0.1;
    mTimer = setInterval(sched, 25);
  }
}
document.addEventListener('pointerdown', startMusic, { once: true });
document.addEventListener('keydown', startMusic, { once: true });
