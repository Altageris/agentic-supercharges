# four-turn-architecture — test scenarios

Same testing methodology as `three-turn-architecture/tests/`. Run scenarios in fresh sessions, follow the prompts, log every deviation in `observation-log.md`.

## Scenarios

| Scenario | Status | Tests |
|---|---|---|
| 01-sync-to-async | TODO (clone from parent, adapt turn numbering) | Clean compression on the canonical sync→async refactor |
| 02-slice-too-big | TODO (clone from parent) | Auto-degrade still works inside the four-turn flow |
| 03-exploration-routing | TODO (clone from parent) | Refuse-to-`brainstorming` routing — should be identical behavior |
| 04-perf-diagnosis | TODO (clone from parent) | Perf-grounded fork, with Turn 2 verifying perf envelope quantification |
| **05-rigor-checkpoint** | **Live** | Tests Turn 2 mechanic — the whole reason this skill exists |

For now, the load-bearing scenario is **05**. The four cloned scenarios are useful for regression testing the unchanged turns but aren't required to start collecting comparison data.

## Comparison protocol

The experiment this skill embodies: does Turn 2 verification pay for itself?

To answer: run the same problem statement through **both skills** in fresh sessions and compare observation-log entries on:

| Metric | Parent (three-turn) | Variant (four-turn) | Verdict |
|---|---|---|---|
| `build_count` in final turn | N | N | Lower = variant wins |
| `turn_1_rigor_signal` | clean / soft / hard | clean / soft / hard | Cleaner = variant wins |
| Turn 2 findings (variant only) | n/a | N | If 0 across many runs → extra turn is overhead |
| User pushback at Turn 2 (variant only) | n/a | Y/N rate | High rate → checkpoint is over-correcting |
| Wall-clock minutes per arc | N | N | Variant should not be > 2× parent |

After 5+ paired runs, look at the matrix. If `four-turn` consistently wins on `build_count` without large pushback or wall-clock penalties → the mechanic earns promotion (consider folding into parent's Turn 1 as a mandatory check). If it doesn't → the extra turn is overhead; deprecate.
