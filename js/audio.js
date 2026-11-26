/* Scribble Wizards — audio.js
   Sound effects and procedural background music (Web Audio API). */
/* ---------- sound ---------- */
let AC = null,
  muted = false,
  noiseBuf = null;
const lastS = {};
function sfx(type) {
  if (muted) return;
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      const b = AC.createBuffer(1, AC.sampleRate, AC.sampleRate),
        d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noiseBuf = b;
    }
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
    }
  } catch (e) {}
}
