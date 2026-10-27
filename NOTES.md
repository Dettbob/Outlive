# Handoff notes (continue from here)

## State at v0.3.0
Everything in README works; engine passes `node src/test.js 40 4` (0 errors, avg ≈ 45 SP). UI verified in headless Chromium (desktop + 390px phone), including pause/abort, tutorial, full games.

## Architecture facts worth remembering
- Engine is async. Human input goes through `UI.*` promise hooks (`pickMove`, `pickAction`, `pickLocation`, `shelter`, `chooseOne`, …); AI uses the same primitives. Presentation hooks: `UI.move/turn/turnEnd/pressure/focus/banner/pop/log/render/sleep`.
- Abort model: `V.gen` counter in ui.js; `wait()` never resolves for a stale generation, so an abandoned game just hangs silently. Pause = `wait()` blocks while `V.paused`.
- Movement: Locations form one ring (`RING` in engine.js); adjacency is two-way; up to 2 steps.
- Seeded RNG: `seedRng(n)`; tutorial uses seed 20261.
- Artifact publishing form = index.html minus doctype/html/head/body wrapper (see the artifact build used in the chat session); it needs a `claude:viewport-fit-sides` meta and ≥16px side gutters.

## Known gaps / TODO
1. **Leaders are placeholders.** The 10 Leader cards in `LEADERS` (engine.js) are invented names/stats. Transcribe the real cards (name, age, start locations, starting resources, broken equipment; Mary Koolpepper draws 4 Search tiles, discards 1) from the rulebook leader page.
2. Verify the 12 Event, 38 Advanced / 12 Standard Room and 40 Equipment lists against the rulebook appendix (counts and costs).
3. Custom art is a local import; no artwork is bundled. Possible: per-location pictures, equipment/room art.
4. Optional polish: hero meeple look, drag-to-move, step-through mode for AI turns, save/resume game, balance AI.
5. Audio was never listened to in the test environment — tune volumes/mood by ear.
