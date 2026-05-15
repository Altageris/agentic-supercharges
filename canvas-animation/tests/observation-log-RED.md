# RED Phase Observation Log

**Date:** 2026-05-15  
**Phase:** RED (baseline — skill NOT present)  
**Model:** claude-haiku-4-5  
**Scenarios run:** 3

---

## Scenario 01 — Animation Loop (Bouncing Ball)

**Result:** PARTIAL PASS — fundamentals correct, gaps missed

**What the agent did right:**
- Used `requestAnimationFrame` (not `setInterval`) ✅
- Gave correct rationale: syncs with refresh rate, pauses on hidden tab ✅

**What the agent missed:**
- Used `Date.now()` implicitly (did not use rAF's `currentTime` parameter) — not mentioned
- No delta-time cap present — not mentioned
- Tab-switch consequence not addressed ("pauses automatically" stated, but the spike-on-resume was not flagged)

**Verbatim gap:** Agent wrote "requestAnimationFrame also pauses automatically when the tab is hidden, saving CPU/battery" — correct but incomplete. It does not warn that on resume, `deltaTime` will be the full elapsed time, causing a physics spike.

**Gap confirmed:** Delta-time cap, `performance.now()` via rAF param

---

## Scenario 02 — Player Speed (5 units/sec)

**Result:** PARTIAL PASS — delta-time used, cap absent, timing source wrong

**What the agent did right:**
- Correctly applied delta-time formula: `player.x += velocity * deltaTime` ✅
- Correctly explained frame-rate independence at varying FPS ✅

**What the agent missed:**
- Used `Date.now()` — not the `currentTime` param from rAF callback ❌
- No delta-time cap ❌
- Did not address what happens on tab-switch (the 5-second alt-tab spike would teleport the player)

**Verbatim quote (timing source):** `const currentTime = Date.now();` — wall-clock, not monotonic.

**Gap confirmed:** `performance.now()` via rAF param, delta-time cap

---

## Scenario 03 — Stutter Diagnosis

**Result:** PARTIAL PASS — correct fix, unordered diagnosis, no cleanup

**What the agent did right:**
- Correctly identified `setInterval` as the primary cause ✅
- Fixed with `requestAnimationFrame` ✅
- Added delta-time to the improved version ✅

**What the agent missed:**
- Diagnosis was a flat list of possible causes ("the next culprits are usually..."), not an ordered sequence ❌
- No mention of `cancelAnimationFrame` or storing `rafId` ❌
- No mention of event listener cleanup ❌

**Verbatim quote (unordered diagnosis):** "If you're seeing continued stuttering after switching to requestAnimationFrame, the next culprits are usually: Long-running update() or draw() calls / Layout thrashing / Garbage collection pauses" — presented as a flat list, no priority or ruling-in sequence.

**Gap confirmed:** Systematic ordered diagnosis, lifecycle cleanup checklist

---

## Summary of Gaps Found in RED Phase

| Gap | Scenario(s) | Failure mode |
|-----|-------------|--------------|
| Delta-time cap missing | 01, 02 | No `Math.min(dt, 0.1)` — spiral of death on tab resume |
| `Date.now()` instead of rAF `currentTime` | 02 | Wall-clock timing, possible drift |
| Unordered stutter diagnosis | 03 | Guessing, not ruling in/out primary cause first |
| No lifecycle cleanup | 03 | `rafId` not stored, no `cancelAnimationFrame`, no listener removal |

**These four gaps drove the skill content.** The skill omits fundamentals (rAF, basic delta-time) because agents already handle those correctly.
