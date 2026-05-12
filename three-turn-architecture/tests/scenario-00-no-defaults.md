# Scenario 00 — No architecture-defaults file (refusal test)

The skill MUST refuse to run when no `architecture-defaults.md` exists. Scaffolding the file is not one of the three turns.

## Setup

- Project of your choice, but ensure neither `~/.claude/architecture-defaults.md` nor `<project>/.claude/architecture-defaults.md` exists.
- Verify with `ls ~/.claude/architecture-defaults.md` (should error).

## User prompt

> /three-turn-architecture our checkout flow runs three sync HTTP calls in a row and p99 is awful. Cut it down.

## Expected behavior

**Turn 1 (and only turn):** The skill must NOT proceed with the compression. The architecture-defaults file is the source of binding invariants without which the skill cannot be opinionated.

Expected response:
- Names the missing precondition in one sentence: "No architecture-defaults file — I can't run three-turn-architecture without one."
- Offers to scaffold the template (one-line `cp` recipe).
- Stops.

## Anti-patterns this catches

- Skill proceeds anyway with hardcoded defaults — wastes a turn and ships a spec that doesn't reflect the user's invariants.
- Skill scaffolds the file AND continues into Turn 1 in the same response — scaffolding the file is its own task, not Turn 0 of three.
- Skill asks the user to declare invariants inline ("what's your default timeout? what about retries?") — that's the whole point of the file; doing it in chat defeats the compression.

## What to log

- Did the skill refuse cleanly? Y/N
- Did it offer the scaffold path? Y/N
- Did it attempt to inline-elicit invariants? (soft fail)
- Did it continue into a survey/sketch anyway? (hard fail)

## Variant prompts to try

- "/three-turn-architecture" (no follow-up) — same refusal.
- A prompt with a stale defaults file (`updated:` line is months old) — skill should warn but may proceed if the user confirms.
