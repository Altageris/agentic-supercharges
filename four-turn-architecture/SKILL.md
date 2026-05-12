---
name: four-turn-architecture
description: Experimental sibling of three-turn-architecture. Same compression formula, plus one user-facing turn (Turn 2 — Rigor verification) inserted between fork-pick and spec. Use when the user opts into the four-turn variant explicitly OR when prior dogfood runs on the same project showed `turn_1_rigor_signal = soft|hard` and you want the extra checkpoint to catch Turn 1 rigor gaps before they propagate into the spec and the build. Requires the same `architecture-defaults.md` as the parent skill. NOT the default — `three-turn-architecture` remains the canonical entry point; this variant is a measurement experiment.
---

# Four-Turn Architecture (experimental)

A four-turn variant of `three-turn-architecture`. The arc:

1. **Turn 1 — Survey & fork** (identical to parent's Turn 1)
2. **Turn 2 — Rigor verification** *(new)*
3. **Turn 3 — Spec & contracts** (parent's Turn 2 renumbered)
4. **Turn 4 — Skeleton + slice** (parent's Turn 3 renumbered)

The extra turn is **after the user picks a fork and before the spec is written.** Purpose: walk the chosen sketch's typed interfaces against a small implementation probe and surface any inconsistency — Map vs object access pattern, interface-vs-example divergence, missing failure-mode rows, unquantified perf envelope — *before* the spec hardens them.

This skill exists to test whether one extra structured-rigor turn pays for itself in (a) lower Turn 4 build counts, (b) fewer post-ship regressions, and (c) higher `turn_1_rigor_signal` scores.

## Relation to `three-turn-architecture`

| | three-turn | four-turn |
|---|---|---|
| Turn budget | 3 user-facing turns | 4 user-facing turns |
| Verification | Inline within Turn 1 + Turn 3 (build catches type errors) | Dedicated Turn 2 walkthrough (catches before build) |
| Default for new projects | **Yes** — start here | No — opt-in or escalation from three-turn |
| Companion / defaults file | Shared with three-turn (symlinked) | Shared with three-turn (symlinked) |
| Scenarios that should use this | None by default | When parent's `turn_1_rigor_signal = soft|hard` on prior runs in the same project |

**Use the parent (`three-turn-architecture`) unless you have explicit evidence this project benefits from the extra turn.** This skill is for the empirical experiment: measure whether `build_count` and `turn_1_rigor_signal` improve when Turn 2 verification runs.

## When to invoke

- The user invokes `/four-turn-architecture` explicitly.
- The user previously ran `three-turn-architecture` on this project and the observation log shows `turn_1_rigor_signal = soft|hard` for 2+ runs.
- The user names a constraint where the typed interfaces are non-trivial (async producers/consumers, generics-heavy, Map/Set primitives, polymorphic boundaries) and the project's history shows recurring type/interface bugs in Turn 3.

## When to refuse

Same refuse rules as `three-turn-architecture`:
- Exploratory ("how should we architect?") → route to `superpowers:brainstorming`.
- User wants to weigh in on each boundary call → wrong skill.
- One component deep, no boundary crossed → just do it.
- Vendor / tool / model selection → direct recommendation outside the frame.

## The four turns

### Turn 1 — Survey & fork

Identical to `three-turn-architecture` Turn 1. See `~/.claude/skills/three-turn-architecture/SKILL.md` for the full rules. Brief recap:

1. (Setup, not a turn) Ensure `architecture-defaults.md` exists at a canonical path; scaffold inline if not.
2. Read actual topology as ground truth.
3. Read `architecture-defaults.md`.
4. Name the constraint in one sentence.
5. Render two sketches via the companion (`~/.claude/skills/three-turn-architecture/companion/render.py`), each with the four required panels (typed interfaces, sequence happy+failure, failure-mode table, perf envelope).
6. Recommend with one-line defaults-rooted rationale.
7. Ask: "A, B, or push back?"

### Turn 2 — Rigor verification *(new)*

After the user picks (or pushes back once, which counts as Turn 1 redux):

1. **Walk the chosen sketch's typed interfaces against a small implementation probe** (≤30 lines of agent-internal code). The probe doesn't ship; it's a reasoning aid to catch interface-vs-implementation inconsistencies before the spec.
2. Run the structured verification checklist over the chosen sketch:

   | Check | What it catches |
   |---|---|
   | Companion was rendered for Turn 1 | Drift on the four-panel discipline |
   | All four panels present and populated | Inline-prose fallback drift |
   | Typed interface uses the same access pattern as the example code | Map vs object, getter vs property, generic vs concrete — the canonical failure |
   | Failure-mode table covers every cross-boundary call named in the sequence diagram | Untyped failure modes, in-process boundaries missing carve-outs |
   | Perf envelope is quantified (p50/p99/throughput/memory or their in-process analogues) | "Faster" without numbers |
   | Defaults invariants from `architecture-defaults.md` are reflected in the failure-mode rows | Invariants treated as advisory |

3. Output a rigor verification table. Each row: claim from Turn 1 / finding from walkthrough / verdict (clean / soft fix / blocker) / proposed fix.
4. For **soft fixes**: auto-apply with a one-line note in the table. For **blockers**: stop and ask the user to confirm the fix before Turn 3.
5. Ask **one** question: "Verification clean (or fixes applied) — OK to spec, or push back on the corrections?"

Forbidden:
- Re-sketching the architecture (Turn 1 settled the fork; this is verification, not redesign).
- Asking about parked items.
- Auto-applying anything classified as a blocker.
- Skipping the walkthrough because "the interfaces look obvious" — the dogfood that birthed this skill had "obvious" types that hid a Map/object mismatch.

### Turn 3 — Spec & contracts

Identical to `three-turn-architecture` Turn 2 (renumbered). See parent skill for full rules. Brief:

1. Apply preference defaults silently.
2. Decide slice scope (one boundary → B; multi-boundary → auto-degrade to A, list slice as ticket #1).
3. Render consolidated spec via the companion (`turn: 2` JSON form — companion JSON schema unchanged from parent).
4. Write spec to `docs/architecture/specs/YYYY-MM-DD-<topic>-arch.md`.
5. Park 5–10 sub-decisions.
6. Ask the **4-option commitment ladder** (same as parent skill): **"Ship slice / Ship skeleton, defer slice / Ship spec, defer code / Tweak first?"** See `three-turn-architecture/SKILL.md` Turn 2 step 6 for the full ladder table and rationale.

The spec MUST cite the Turn 2 verification findings (in a "Verified contract" section) so downstream readers can see what was checked and what corrections were applied.

### Turn 4 — Skeleton + slice

Identical to `three-turn-architecture` Turn 3 (renumbered). See parent skill for full rules. Brief:

1. Implement skeleton (and slice if B).
2. Type check.
3. Contract tests at every new boundary — exercise the actual logic, not a liveness curl.
4. Build.
5. Smoke test (separate from contract test).
6. Restart service if applicable.
7. Report: files touched, interfaces landed, slice status, parked tickets, **`build_count`**, **`turn_1_rigor_signal`** (clean = 1 build; soft = 2; hard = >2 or > `max_builds_per_slice`).

The hypothesis this skill tests: **`build_count` should trend toward 1 because Turn 2 verification caught the interface inconsistencies before they reached the build.** Compare observation-log entries across both skills to evaluate.

## Compression rules

Same as parent: **bundled decisions, recommendations not options, defaults not questions.** The extra turn is verification, not exploration — it does NOT expand the decision surface.

## Companion

Symlinked to `three-turn-architecture/companion/`. Same renderer, same template, same JSON schemas. The Turn 2 verification output is **inline structured text** (a table), not a companion-rendered panel — it's a transient checkpoint, not a durable artifact.

Future iteration: if the verification table grows, we could add a `verification` block to the companion JSON schema and render it. Don't do this until 3+ runs show the inline table is hard to read.

## Defaults file

Same `architecture-defaults.md` as parent. The four-turn variant respects ALL parent invariants and adds optional ones:

- **`rigor_checkpoint_strict`** (default: `auto-fix-soft`): one of `auto-fix-soft` (auto-apply soft fixes, surface blockers) | `surface-all` (every finding asks the user; safer but burns more turn-budget within Turn 2) | `strict-blocker` (any finding stops the arc, including soft fixes).

If a parent project's `architecture-defaults.md` is already set up, this skill reads it without modification; the optional invariant just falls back to the default.

## Testing

Test scenarios in `tests/`:
- `scenario-01` through `scenario-04` — same shapes as parent's, adapted to four-turn flow.
- `scenario-05-rigor-checkpoint` — **new** — tests the Turn 2 mechanic specifically, including the Map/object dogfood failure case it was designed to catch.

Iterate per the standard observation-log feedback loop. Specifically watch:

- `build_count` distribution vs parent's runs on the same projects.
- `turn_1_rigor_signal` distribution — does it skew clean?
- User pushback rate at Turn 2 — if users frequently push back on Turn 2 corrections, the rigor checkpoint may be over-correcting.
- Total wall-clock time per arc — does the extra turn cost more than it saves?
