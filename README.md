# Outlive — digital prototype

An unofficial, fan-made digital adaptation of the board game **Outlive** (solo / hot-seat, 2–4 players, human and AI seats). Not affiliated with the publisher.

**Play:** open `index.html` in a browser (single self-contained file, no install, no server).

## Features (v0.3.0)
- Full 6-day game: Dawn → Day → Night, rules implemented from the official rulebook (movement, Pressure, Cargo Ship, Dam, hunting, Search tiles, Equipment, Rooms, radiation, scoring).
- AI opponents with animated, narrated turns (turn bar, floating gain/loss labels, Hero flight, speed setting).
- Main menu, pause menu (Esc), settings, tutorial primer + guided tutorial game.
- Procedural post-apocalyptic music and sound effects (Web Audio, no audio files), each switchable.
- Original vector board art, plus **Custom artwork**: load your own photo/scan of the map and Leader portraits (stored only in your browser via IndexedDB, never uploaded).

## Layout
- `index.html` – built game (generated, do not edit by hand)
- `src/engine.js` – rules + AI, UI-agnostic (async; talks to the UI through hooks)
- `src/ui.js` – interface, animations, menus, tutorial, custom-art store
- `src/audio.js` – music + sound effects
- `src/shell.html`, `src/extra.css` – page template and styles
- `src/build.py` – `python3 src/build.py` regenerates `index.html`
- `src/test.js` – headless AI-only regression: `node src/test.js 40 4` (games, players)

## Artwork / copyright
The official board, card and rulebook artwork belongs to its creators and publisher and is **not included**. Use *Custom artwork* in the menu to load pictures from your own copy for personal use.
