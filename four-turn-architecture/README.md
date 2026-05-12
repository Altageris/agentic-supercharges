# four-turn-architecture (experimental sibling)

An experimental variant of `three-turn-architecture` with one extra user-facing turn — **Turn 2: Rigor verification** — inserted between fork-pick and spec.

## Why this exists

The first dogfood of `three-turn-architecture` shipped successfully in 3 turns but had a Turn 1 rigor failure: the typed interface declared `Map<...>` while the example code used object-property access. The mismatch slipped past Turn 1, propagated through Turn 2's spec, and surfaced as a TypeScript error in Turn 3 — costing one extra build cycle.

This skill tests whether a dedicated verification turn between fork-pick and spec catches that class of failure cheaply enough to justify the extra turn.

## Relation to parent

| Aspect | three-turn-architecture | four-turn-architecture |
|---|---|---|
| **Status** | Canonical | Experimental |
| **Turn budget** | 3 | 4 |
| **Verification** | Inline within Turn 1; build catches type errors | Dedicated Turn 2 walkthrough catches before build |
| **Companion** | Original | Shared via symlink |
| **Defaults file** | Original | Shared (with one optional addition: `rigor_checkpoint_strict`) |
| **Default for new projects** | Yes — start here | No — opt in only |

Start with the parent. Escalate to this skill only when prior runs in the same project showed `turn_1_rigor_signal = soft|hard` two or more times.

## Layout

```
four-turn-architecture/
├── SKILL.md                          # The skill definition
├── README.md                         # You are here
├── architecture-defaults-template.md # Same shape as parent + optional rigor_checkpoint_strict
├── companion/                        # → symlink to three-turn-architecture/companion
└── tests/
    ├── README.md
    ├── scenario-01-sync-to-async.md       # Adapted to four-turn flow
    ├── scenario-02-slice-too-big.md       # Adapted
    ├── scenario-03-exploration-routing.md # Same (routing decision)
    ├── scenario-04-perf-diagnosis.md      # Adapted
    ├── scenario-05-rigor-checkpoint.md    # NEW — tests Turn 2 mechanic
    └── observation-log.md
```

## Hypothesis being tested

**H:** One extra structured-rigor turn between fork-pick and spec lowers `build_count` in the final turn and raises `turn_1_rigor_signal` to "clean," at the cost of one additional user-facing exchange.

**Comparison metric:** observation-log distributions across both skills on similar projects.

**Failure mode of the experiment:** if Turn 2 frequently produces zero findings (rigor was fine without checkpointing), the extra turn is overhead. If users frequently push back on Turn 2 corrections (the auto-fix logic is wrong), the checkpoint is more harm than help.

## How to invoke

```
/four-turn-architecture <problem statement with constraint>
```

Same `architecture-defaults.md` precondition as parent. If absent, the skill scaffolds inline + proceeds (preserving the four-turn budget) — same rule as parent's three-turn budget preservation.

## What's downstream of this

If `four-turn-architecture` outperforms `three-turn-architecture` consistently on the same project, the parent skill should adopt the Turn 2 mechanic (either as a mandatory step inside its existing Turn 1, or as an opt-in extension).

If `four-turn-architecture` doesn't outperform: the experiment is a no-op, and the data still feeds the design — we learn that build-count drift isn't worth a turn.

If `four-turn-architecture` outperforms only on specific kinds of projects (e.g., generics-heavy code, async pipelines), it becomes a specialty skill rather than a candidate to merge upstream.
