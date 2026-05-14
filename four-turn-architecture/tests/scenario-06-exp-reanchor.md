# Scenario 06 - `/exp` re-anchor after a completed four-turn run

**`live_subagent_creation`:** true

Tests that `/exp` respects the extra rigor checkpoint and does not reopen corrections already applied in Turn 2.

## Setup

- Project with `architecture-defaults.md` present.
- `rigor_checkpoint_strict` left at `auto-fix-soft` unless the scenario is explicitly testing a stricter mode.
- `exp` skill installed and client config reloaded before the session starts.
- Run a four-turn case where Turn 2 applies at least one soft fix and the final slice still leaves one adjacent parked seam.

## User prompt

> /four-turn-architecture our event handler enqueues messages but loses track of order when two arrive on the same key. Add per-key queuing inside the hook. Skeleton it.

## Expected behavior before `/exp`

- The normal four-turn arc completes.
- Turn 2 catches and applies its soft fixes.
- The final slice ships with one nearby unresolved surface still parked, such as a second consumer path or observability follow-up.

## Expected user reply

> /exp

## Expected `/exp` behavior

- Starts from the completed four-turn result as the closest successful anchor
- Treats Turn 2 corrections as resolved surfaces and does not reopen them
- Names exactly one unresolved adjacent seam
- Includes live subagent creation because this is an `/exp`-driven run
- Does not revisit the original fork or ask to relitigate a soft fix that already propagated into the shipped slice

## Anti-patterns this catches

- `/exp` re-raising the same Map-vs-object inconsistency Turn 2 already fixed
- `/exp` reopening the fork after the verified contract shipped
- `/exp` expanding into a broader retrospective instead of one next surface
