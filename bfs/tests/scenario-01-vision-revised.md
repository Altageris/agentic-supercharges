# Scenario 01 — VISION_revised.md (Multi-Concept Explanation)

**Type:** Interactive mode
**Goal:** Verify bfs can explain a complex document with multiple interlocking concepts.
**Difficulty:** Hard (document has 5+ major concepts)

## User prompt (paste verbatim)

```
Explain the shift in VISION_revised.md from viewing Dicer as a game/benchmark to viewing it as a "pattern generator" for transferable agent knowledge. Cover: (1) the anonymization + transfer loop, (2) what "adaptive pressure" means as a design principle, (3) how "spectatable behavior" fits in, (4) how this changes the roadmap priorities.
```

## Expected behavior

### Section 1: Core idea
- **Should be:** The core shift (from game → pattern generator).
- **Should mention:** Adaptive pressure + anonymization pairing.
- **Length:** Exactly one sentence.

### Section 2: Why it exists
- **Should explain:** Why the shift happened (need to make agent learning reusable, shareable, transferable).
- **Should contrast:** Old framing (Dicer measures agents) vs. new framing (Dicer produces portable knowledge).

### Section 3: How it works
- **Should detail:** The loop structure (Pressure → Behavior → Trace → Abstraction → Anonymization → Transfer).
- **Should explain:** Why adaptive pressure is key (keeps environment novel so agents don't memorize).
- **Should explain:** How anonymization enables transfer (strips domain-lock without losing structure).

### Section 4: Key parts
- **Should list:** 
  - Adaptive pressure (infinite difficulty)
  - Spectatable behavior (making adaptation visible)
  - Anonymized trace (structure-preserving scrubbing)
  - Pattern generator (reusable output)
  - Transfer loop (destination for patterns)

### Section 5: Mental model
- **Should capture:** The idea that Dicer is less a game and more a **research artifact factory**.
- **Alternative phrasing:** "Pressure chamber for learning patterns that can escape the domain."

## Deviations to log

- Core idea > 1 sentence → Checkpoint failure
- Sections merge (e.g., "Why" and "How" in same response) → Checkpoint failure
- Only 3–4 sections delivered → Incomplete explanation
- User interrupts ("I only care about adaptive pressure") → Skill should redirect to that section only

## Success criteria

- All 5 sections delivered as separate turns.
- Core idea addresses the shift (not a generic definition).
- Section 4 lists all 5 key concepts.
- Section 5 ties back to the bigger picture (why reusability matters).
