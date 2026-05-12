# Scenario 05 — Rigor checkpoint catches Turn 1 interface gap

Tests the **new Turn 2 mechanic** that this skill exists to validate. This scenario seeds a known Turn 1 rigor failure (the Map-vs-object inconsistency from the dogfood that birthed this skill) and verifies that Turn 2 catches it before the spec is written.

## Setup

- Project with a React hook that needs a per-key state map (e.g., per-agent queue, per-user session, per-route cache).
- `architecture-defaults.md` present.
- `rigor_checkpoint_strict` set to `auto-fix-soft` (default).

## User prompt

> /four-turn-architecture our event handler enqueues messages but loses track of order when two arrive on the same key. Add per-key queuing inside the hook. Skeleton it.

## Expected behavior per turn

### Turn 1 — Survey & fork

Same shape as parent's Turn 1. Expected fork:
- **Option A**: per-key `Map<KeyT, QueueItem[]>` inside a `useRef`, with a separate `Map<KeyT, boolean>` tracking which keys are currently animating.
- **Option B**: single flat `Array<QueueItem>` with key-based filtering on dequeue.

The skill's Turn 1 output is **expected to be a partial-rigor pass** for this scenario. Specifically — to seed the Turn 2 test — Turn 1 may contain a subtle inconsistency: the typed interface declares `Map<KeyT, QueueItem[]>` but the example pseudo-code in the same panel uses object-property access (`queueRef.current[key]`) instead of Map methods (`.get(key)` / `.set(key, ...)`).

This inconsistency mirrors the actual dogfood failure that motivated this skill.

**Expected user reply:** "A"

### Turn 2 — Rigor verification *(the test)*

The skill must:

1. Walk the chosen sketch's typed interfaces against a small implementation probe.
2. Produce a rigor verification table. At minimum, this scenario should produce a row like:
   ```
   | Claim from Turn 1                                | Walkthrough finding                                           | Verdict   | Proposed fix                                  |
   |--------------------------------------------------|---------------------------------------------------------------|-----------|-----------------------------------------------|
   | Interface: `queueRef: Map<KeyT, QueueItem[]>`    | Example uses `queueRef.current[key]` — object indexing on Map | Soft fix  | Replace `[key]` with `.get(key)`; assignments use `.set()` |
   ```
3. Per the default `rigor_checkpoint_strict: auto-fix-soft`, this row's verdict is "soft fix" → auto-apply, note in the table, continue.
4. Other expected rows depending on Turn 1's specific drift:
   - All four panels (interfaces / sequence / failure modes / perf envelope) present? — if any are missing, that's a **blocker**.
   - Failure-mode table covers every cross-boundary call named in the sequence diagram? — missing rows = soft fix (auto-fill from defaults).
   - Perf envelope quantified? — missing = blocker (can't ship without numbers).
5. Ask **one** question: "Verification clean (or fixes applied) — OK to spec, or push back on the corrections?"

**Expected user reply:** "OK to spec"

### Turn 3 — Spec & contracts

The spec MUST include a "Verified contract" section that:
- Quotes the original Turn 1 interface (with the inconsistency).
- Notes the Turn 2 fix and rationale.
- Specifies the corrected interface that the implementation will use.

Same shape as parent's Turn 2 otherwise.

**Expected user reply:** "Ship slice"

### Turn 4 — Skeleton + slice

Implementation now uses the *corrected* interface from Turn 3. Build should pass on the first try (`build_count: 1`), because the interface-implementation mismatch was caught in Turn 2.

If `build_count > 1`, the hypothesis behind this skill has failed for this scenario — Turn 2 didn't catch the right things. Log it loudly in `observation-log.md`.

## Signals of compression failure

- Turn 2 produces zero findings → either Turn 1 was actually rigorous (unlikely for a seeded test) or the verification logic is shallow.
- Turn 2 auto-fixes the Map/object inconsistency but the spec doesn't cite the fix → audit trail broken.
- Turn 2 classifies the Map/object case as a "blocker" with `rigor_checkpoint_strict: auto-fix-soft` → over-strict; soft fixes should auto-apply.
- Turn 4 hits `build_count: 2+` despite Turn 2 passing → verification missed the actual problem; tighten the verification checklist.
- Turn 2 reopens the fork decision ("actually, B is better now that I see the Map issue") → out of scope; that should be a "push back" from the user at Turn 2, not the skill re-sketching.

## Comparison to parent skill

Run the same scenario against `three-turn-architecture` (without Turn 2 verification). Expected outcome with parent:
- Turn 3 build hits the type error.
- Build #1 fails on Map vs object.
- Build #2 passes after correcting in-arc.
- `build_count: 2`, `turn_1_rigor_signal: soft`.

If `four-turn-architecture` achieves `build_count: 1` on the same scenario, the extra turn paid for itself. If it achieves `build_count: 2` with the extra Turn 2 cost, the experiment failed for this scenario class.

## What to log

Beyond the standard observation-log fields:

- **Turn 2 findings count**: N
- **Soft fixes auto-applied**: N
- **Blockers surfaced**: N
- **User pushback at Turn 2**: Y/N
- **Build count delta vs parent**: N (the comparison metric — if positive, this skill is winning)
