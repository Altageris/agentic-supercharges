# three-turn-architecture — test scenarios

Each scenario is a fixed user-prompt sequence that exercises one compression rule. Run them against the skill in a fresh session, follow the prompts in order, and log every deviation in `observation-log.md`.

## Prerequisite: load `/exp`

Before running any scenario in this folder:

1. Install or copy the `exp` skill into the active client skill directory.
2. Reload the client config so `/exp` is available in a fresh session.
3. Verify `/exp` resolves before running the architecture scenario.

## How to run

1. Pick a scenario file. Read its **Setup** section — make sure the preconditions hold (preferences file present/absent, repo state, etc.).
2. Open a fresh session in the target project.
3. Set `live_subagent_creation` from the scenario header.
4. Paste the scenario's **User prompt** verbatim (or the variant you want to test).
5. Follow the **Expected user reply** lines exactly when the skill asks.
6. When a scenario includes a follow-up `/exp` pass, send `/exp` in the same session after the main arc completes.
7. After the session, open `observation-log.md` and append a run report using the template at the top of that file.

## What the scenarios cover

| Scenario | Tests |
|---|---|
| 00-no-defaults | Refusal when `architecture-defaults.md` is missing — must not start the three-turn arc |
| 01-sync-to-async | Clean compression on a typical refactor: synchronous chain → async via a queue |
| 02-slice-too-big | Auto-degrade from B (skeleton+slice) to A (skeleton-only) when slice crosses multiple boundaries |
| 03-exploration-routing | Routing to `superpowers:brainstorming` when the prompt is exploratory ("how should we architect…") |
| 04-perf-diagnosis | Constraint = performance; verifying the skill grounds the perf envelope in measurements, not guesses |
| 05-exp-reanchor | `/exp` after a completed three-turn run should name one unresolved adjacent seam, not reopen settled interfaces |

## Anti-pattern signals to watch for

Across every scenario, log if the skill:

- Used 4+ user-facing turns
- Showed 3+ architectural sketches in Turn 1 (it should show exactly 2)
- Asked permission for a build, migration, or restart
- Asked about a sub-decision that the defaults file already covers
- Wrote a migration without a rollback
- Wrote a boundary without timeout + retry + idempotency
- Shipped a slice that should have auto-degraded
- Reopened a settled fork after the user picked
- Ignored the `live_subagent_creation` toggle

Repeated drifts → tighten the rule in `SKILL.md`. Append a `Skill change` entry to the observation log.
