# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [1.0.0]

### Added
- Duel mode: two wizards fight automatically, with their own circles and names.
- Dark mage: 18 drawings get a dark variant (possession, cursed fire, piranha, spider eggs, tombstone…).
- Stacking: repeated drawings get stronger and unlock level 2 and level 3 effects.
- Status effects stack on targets (fire layers, longer freezes…).
- Procedural background music (arena, dark, duel) and many new sound effects.
- Grimoire: the circle editor is now a spell book that opens over the arena, with an opening animation.
- 8 bonus drawings: bomb, portal, shield, music note, cloud, tornado, spider web, potion.
- 13 new synergies (31 in total).
- Duel: wizard movement, dodging and counter-spells, spell clashes, 5 random maps, 400 HP.
- Duel magic budget: every drawing has a cost, players pick a shared budget.
- Fullscreen button and a layout that fits a desktop screen.

### Changed
- Redrawn whale.
- Level 3 lightning now strikes violently from the sky.

### Performance
- Magic circles are rendered once and cached as sprites.
- Static background on its own canvas, batched particles, cached cracks and glows.
- Automatic quality setting and pause while the grimoire is open.

## [0.1.0]

### Added
- First playable version: magic circle builder, 19 drawings plus 5 bonus drawings, 18 synergies.
- Arena with breakable props and monster waves.
- Wizard name and robe colour, saved spells.
