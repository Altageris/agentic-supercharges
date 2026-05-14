# Scenario 05 - `/exp` re-anchor after a completed three-turn run

**`live_subagent_creation`:** true

Tests that `/exp` complements the architecture arc instead of reopening already-landed work.

## Setup

- Project with one real architectural seam that can be shipped in three turns.
- `architecture-defaults.md` present.
- `exp` skill installed and client config reloaded before the session starts.
- Aim for a run where the three-turn pass lands the main slice but leaves one nearby unresolved seam, such as a second consumer ticket or a metric naming follow-up already parked in the spec.

## User prompt

> /three-turn-architecture POST /checkout calls service A, B, and C in series and p99 is 1.8s. A is the only one that has to be in the request path. Skeleton it.

## Expected behavior before `/exp`

- The normal three-turn arc completes.
- The chosen slice ships.
- One adjacent unresolved surface remains clearly parked rather than silently forgotten.

## Expected user reply

> /exp

## Expected `/exp` behavior

- Starts from the just-completed architecture run as the current anchor
- Filters out surfaces already fixed, validated, or explicitly parked with the spec
- Names exactly one next actionable surface, such as the deferred `service C` slice or one unresolved observability seam
- Includes live subagent creation because this is an `/exp`-driven run
- Does not reopen the fork decision, retry defaults, or already-correct contracts

## Anti-patterns this catches

- `/exp` reopening Option A vs B after the slice already shipped
- `/exp` resurfacing defaults already bound in `architecture-defaults.md`
- `/exp` returning a broad plan instead of one next surface
