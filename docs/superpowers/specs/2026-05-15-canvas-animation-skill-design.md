# Canvas/Game Animation Skill — Design Spec

**Date:** 2026-05-15  
**Status:** Approved for implementation

## Problem

Baseline testing showed Claude handles `requestAnimationFrame`, basic delta-time, and `setInterval` diagnosis correctly without a skill. The skill is NOT needed for fundamentals.

The skill IS needed for four specific failure modes that all three baseline agents missed:

1. **Delta-time cap** — no agent capped `deltaTime`. After tab unfocus/focus, uncapped delta can be 5–30s, teleporting entities or crashing physics. This is the "spiral of death."
2. **`performance.now()` vs `Date.now()`** — agents defaulted to `Date.now()`, which is wall-clock and can drift. `requestAnimationFrame` passes `performance.now()` — monotonic, sub-millisecond.
3. **Systematic stutter diagnosis** — agents listed possible culprits but guessed, with no structured sequence for ruling causes in/out.
4. **Lifecycle cleanup** — no agent mentioned removing `keydown`/`keyup` listeners or cleaning up canvas resources. Common source of memory leaks in games.

## Skill Design

### Name
`canvas-animation`

### Description trigger
Fires when: building a canvas/WebGL game or simulation, debugging frame rate issues, fixing stutter, implementing game loop, or symptoms like "entities teleport", "physics breaks after switching tabs", "memory leak in canvas game".

### Sections

1. **Delta-time cap pattern** (core, always needed)
   - Code snippet showing the cap (typically `Math.min(deltaTime, 0.1)`)
   - Explains why: tab unfocus, debugger pause, slow device frame skips
   
2. **`performance.now()` note**
   - One-liner: rAF callback receives `performance.now()` — use it, don't call `Date.now()` separately
   
3. **Systematic stutter diagnosis table**
   - Symptom → most likely cause → first check
   - Ordered: rAF check → delta-time cap check → draw call audit → GC/object allocation → layout thrash
   
4. **Lifecycle cleanup checklist**
   - Remove keydown/keyup listeners on teardown
   - Cancel rAF loop (`cancelAnimationFrame`)
   - Null canvas context reference
   - Clear any setInterval/setTimeout backups

### What the skill explicitly omits
- rAF vs setInterval basics (agents already know)
- Basic delta-time formula (agents already know)
- Library-specific APIs (Three.js, p5.js) — looked up on demand
- Audio, networking, save states

### File location
`~/.claude/skills/canvas-animation/SKILL.md`

### Token budget
Target <300 words — this is a focused gap-filler, not a comprehensive reference.
