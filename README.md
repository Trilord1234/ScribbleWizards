# Scribble Wizards

A small browser game I made with my little cousins. They invented the drawings: you build a **magic circle** out of hand-drawn symbols, and each symbol adds an effect to the ball your wizard shoots. Symbols are read from the outside of the circle to the inside, and some pairs placed one after the other create secret **synergies**.

The game is in French.

## Play

No installation and no build step: open `index.html` in a recent browser (Chrome, Edge, Firefox or Safari).

If your browser blocks local files, serve the folder instead:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## How to play

1. Click a drawing to add it to the centre of the circle. The order matters: outside to inside.
2. Aim with the mouse (or your finger) and click to cast. Hold to cast repeatedly, or press <kbd>Space</kbd>.
3. Break the crates, barrels, vases and brick tower, then start a monster wave.
4. Save your favourite circles in the grimoire.

## Features

- 19 drawings designed by the kids, plus 5 bonus drawings
- 18 secret synergies, unlocked in the synergy book when you discover them
- Breakable props that crack progressively, then collapse
- Monster waves: slimes, goblins, bats and a stone golem that loses its arms
- Saved spells and settings (stored locally in the browser)

## Project structure

```
index.html          Page layout
css/style.css       Styles
js/data.js          Drawings, synergies and saved settings
js/utils.js         Helpers
js/magic-circle.js  Symbol and circle drawing
js/spells.js        Circle → spell description
js/state.js         Game state
js/audio.js         Sound effects
js/effects.js       Particles and floating texts
js/arena.js         Arena layout
js/projectiles.js   Spell movement, hits and impacts
js/props.js         Breakable props, coins and plants
js/enemies.js       Monsters and waves
js/update.js        Simulation step
js/render.js        Drawing
js/input.js         Mouse, touch and keyboard
js/ui.js            Circle editor and grimoire
js/main.js          Game loop
```

The scripts are plain JavaScript loaded in order by `index.html` (no modules, no dependencies), so the game also works when opened straight from the disk.

## Tech

HTML, CSS, vanilla JavaScript, Canvas 2D and the Web Audio API.
