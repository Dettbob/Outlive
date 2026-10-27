# Changelog
## v0.3.0
- Custom artwork: load your own map image and Leader portraits/names (local only, IndexedDB).
- Map-style board mode (nodes overlay the picture), portraits in Leader selection and Shelter header.
- Repo created: sources split into `src/`, build script, README, handoff notes.
## v0.2.0
- Board rebuilt as the map ring (two-way arrows), animations, turn bar with End turn, main menu, pause menu, settings, tutorial, music + SFX, version label.
## v0.1.0
- First playable version.

## v0.4.0
- Czech localization (Pustina) with an English/Čeština switch in the main menu, Settings and pause menu; choice is remembered. Terms follow the official Czech rulebook. Implemented as src/i18n.js (phrase tables + live DOM translator).

## v0.5.0
- UI rebuilt: the publisher's self-print solo map fills the screen; the bunker (player board) slides up from the bottom; the Convoy/events board slides down from the top.
- New original SVG icons (resources, survivors as boy/girl faces), Leader cards with generated portraits, start positions/resources/equipment, equipment cards with pair half-symbols that join into a gold set when both halves are repaired.
- Bunker layout: radiation gauge (left), Water and Food rooms, Airlock + 3 basic rooms, 4 advanced rooms, storage rooms (metal, wood, microchips, munitions), night-phase reference (right).
- Rule fix: Airlock row 1 holds 2, row 2 holds 5 (second row only when the first is full), 1 Water per used row.
