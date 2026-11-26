# Scribble Wizards

A small browser game I made with my little cousins. They invented the drawings: you build a **magic circle** out of hand-drawn symbols, and each symbol adds an effect to the ball your wizard shoots. Symbols are read from the outside of the circle to the inside, repeated symbols stack, and some pairs placed one after the other create secret **synergies**.

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

| Action | Control |
|---|---|
| Open the grimoire (spell book) | **Grimoire** button, the small circle in the top corner, or <kbd>G</kbd> |
| Add a drawing | Click it on the right page of the grimoire |
| Reorder / remove | Arrows and ✕ on the left page, or click the circle to remove the last drawing |
| Aim and cast (arena) | Mouse or finger, click; hold to cast repeatedly, or <kbd>Space</kbd> |
| Close the grimoire | ✕, <kbd>Esc</kbd>, or click outside the book |

The game pauses while the grimoire is open.

### Modes

- **Arena**: break props and survive monster waves (slimes, goblins, bats and a stone golem).
- **Duel**: each player builds a circle for their wizard within a shared **magic budget** (6, 10, 15, 20 or free). The wizards then fight on their own: they move, dodge, aim, and their spells can clash in mid-air. Five maps are picked at random.

## Features

- 32 drawings (19 designed by the kids, 13 bonus), each with a magic cost
- **Stacking**: placing a drawing 2 or 3 times unlocks a level 2 and level 3 effect
- **Dark mage**: 18 drawings change their effect when a wizard turns to dark magic
- 31 secret **synergies**, revealed in the synergy book when discovered
- Breakable props that crack progressively, status effects that stack on targets (fire, ice…)
- Procedural music that changes with the mode, and generated sound effects
- Automatic quality setting (resolution, particles, glow) to keep the game smooth
- Spells, settings and discoveries saved locally in the browser

## Project structure

```
index.html          Page layout and grimoire markup
css/style.css       Styles
js/data.js          Drawings, dark variants, synergies, stack levels, costs, saved settings
js/utils.js         Math, colour and canvas helpers
js/magic-circle.js  Symbol drawings and cached magic circle rendering
js/spells.js        Circle → spell description, fish species
js/state.js         Wizards, game state, quality presets
js/audio.js         Sound effects and procedural music (Web Audio API)
js/effects.js       Particles, floating texts, banners
js/arena.js         Arena and duel map layouts
js/projectiles.js   Spell movement, collisions, hits, impacts, levels, synergies, zones
js/props.js         Breakable props, coins, plants
js/enemies.js       Monsters, waves, wizard status effects
js/duel.js          Duel setup, wizard AI, spell clashes
js/update.js        Simulation step
js/render.js        Background, props, monsters, wizards, spells, HUD
js/input.js         Canvas sizing, mouse, touch, keyboard
js/ui.js            Grimoire, buttons, settings, fullscreen
js/main.js          Game loop and automatic quality
```

The scripts are plain JavaScript loaded in order by `index.html` (no modules, no dependencies), so the game also works when opened straight from the disk. Load order matters: a file may use what earlier files define.

## Contributing

- Branches: `main` (stable releases), `develop` (integration), `feature/*`, `fix/*`, `docs/*` created from `develop`.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `perf:`, `docs:`, `style:`, `refactor:`, `chore:`…
- Format with Prettier before committing: `npx prettier --write .`

## Ideas

- Desktop app (Electron or Tauri)
- Android / iOS app (Capacitor, or a PWA wrapped with PWABuilder)

## Tech

HTML, CSS, vanilla JavaScript, Canvas 2D and the Web Audio API.
