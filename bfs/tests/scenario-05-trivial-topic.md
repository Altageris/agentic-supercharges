# Scenario 05 — Trivial Topic (Compression Test)

**Type:** Interactive mode
**Goal:** Verify bfs can compress a simple one-sentence concept into 5 sections without over-inflating.
**Difficulty:** Hard (easy to bloat trivial topics)

## User prompt (paste verbatim)

```
Explain what "wave fatigue" is in Dicer.
```

## Expected behavior

### Section 1: Core idea
- **Should be:** Exactly one sentence: "After 12 turns on the same wave, the hero takes damage each turn until the wave changes."
- **Should NOT be:** A definition followed by context. Just the fact.

### Section 2: Why it exists
- **Should explain:** The problem it solves (preventing infinite stalls where heroes defend infinitely).
- **Length:** 1–2 sentences max.

### Section 3: How it works
- **Should explain:** The simple formula (`damage = max(0, turns_on_wave - 12)`).
- **Should be concise** (not padded with extra lore).

### Section 4: Key parts
- **Should list:**
  - Threshold: 12 turns
  - Damage ramp: linear
  - Reset condition: next wave
  - Visual cue: red vignette (optional)

### Section 5: Mental model
- **Should capture:** "A timer that punishes you for stalling."
- **One phrase,** no elaboration.

## Deviations to log

- Core idea becomes a paragraph → Compression failure
- Section 3 ("how it works") contains lore instead of mechanics → Scope creep
- Mental model is 3+ sentences → Should be atomic
- Skill asks "would you like more detail?" → Already has enough for a simple topic

## Success criteria

- All 5 sections delivered with pauses.
- Each section is concise (no padding).
- Core idea is exactly one sentence.
- Mental model is exactly one phrase.
