# Three-Turn Design — Test Scenarios

These scenarios let you observe whether the skill is actually behaving on its three-turn budget, or quietly drifting back into consultative loops.

## Prerequisite: load `/exp`

Before running any scenario in this folder:

1. Install or copy the `exp` skill into the active client skill directory.
2. Reload the client config so `/exp` is available in a fresh session.
3. Verify `/exp` resolves before starting the design prompt.

## How to run a scenario

1. Open a fresh Claude Code session in a real project that has `design-defaults.md` (or use `scenario-00-no-defaults.md` to test refusal).
2. Set `live_subagent_creation` from the scenario header.
3. Paste the **User prompt** verbatim as the first message — no extra context.
4. Reply to each turn following the **Expected user reply** column. If the skill asks something unexpected, just answer it but log the deviation.
5. When a scenario includes a follow-up `/exp` pass, send `/exp` in the same session after the main arc completes.
6. After the run, fill out `observation-log.md`.

The goal is not to "pass" a scenario — it's to **observe where the skill fails to compress** and drive iteration from that.

## What to observe

For each turn, record:

- **Turn count consumed** — was it really one turn, or did the skill ask a follow-up?
- **Decisions surfaced** — how many did the user have to make? (Goal: 1 per turn.)
- **Visual mockup scale** — did the skill render at target scale on the first try, or thumbnail-and-redo?
- **Bundled vs unbundled** — did palette/scope/composition arrive as a recommended package, or as separate questions?
- **Tangents** — when something unrelated surfaced, was it parked to a file, or did it derail?
- **Verification turns** — did the user have to remind the skill to build, restart, or check anything?
- **Defaults applied silently** — count how many preference-file rules were honored without mention.
- **Toggle honored** — if `live_subagent_creation` was true, was a live subagent actually created?

## Signals of a failed compression

| Signal | What it means | Skill rule violated |
|---|---|---|
| 4th turn requested | Compression failed | "Choose default, park, ship" |
| 3+ visual options on one screen | Forking went wide | "2-up only" |
| Permission requested for build/restart | Lifecycle not internalized | Server-management default |
| User says "no I meant…" on Turn 2 | Turn 1 mockup was wrong scale or unclear | "Render at target scale" |
| Parked items become questions in Turn 3 | Compression broken | "Parked = decided" |
| Spec asks user "should we also…" | Skill negotiating, not deciding | "Defaults, not questions" |

## Scenarios in this folder

- `scenario-00-no-defaults.md` — anti-pattern: no `design-defaults.md` exists. Skill must refuse.
- `scenario-01-dead-idle.md` — canonical "page lacks something" arc. The original session that birthed this skill.
- `scenario-02-empty-tile-live.md` — partial state, busy chrome, want ambient layer for the empty parts.
- `scenario-03-open-exploration.md` — anti-pattern: user is still exploring. Skill should route to `brainstorming`.
- `scenario-04-grace-notes.md` — Turn 3 polish: user says "but let the X animation finish" — does the skill handle it inside Turn 3 or extend?
- `scenario-05-exp-reanchor.md` — `/exp` after shipping should point at one unresolved adjacent polish seam, not reopen accepted visual decisions.

## Iterating the skill

After every 3-5 runs across scenarios:

1. Read `observation-log.md`.
2. Group recurring deviations by which skill rule got violated.
3. Tighten the rule in `SKILL.md` so the next run is harder to drift on.
4. If a deviation is a real edge case (not a drift), add a new clause to the **Failure modes** table.

Skill drift to watch for:
- **Asking permission** — should be doing, not asking.
- **Re-questioning settled decisions** — preference file is binding, not consultative.
- **Showing too many options** — single fork, recommendation, move on.
- **Verification stalls** — build + restart on Turn 3 must be silent and automatic.
