# Experience Playbook

Use this when a task needs to expand from completed experience into a concrete working surface.

## Order Of Attack

1. Restate the current anchor in the narrowest local terms.
2. Read `C:\Users\jeanj\.codex\memories\memory_summary.md`.
3. Search `C:\Users\jeanj\.codex\memories\MEMORY.md` with exact project, repo, workflow, artifact, or error keywords.
4. Prefer entries that describe completed work, validated commands, known paths, or durable artifacts.
5. Search raw history only when `MEMORY.md` does not already point to a clear completed precedent.
6. Open the smallest matching rollout summary or history slice.
7. Extract one reusable lesson and one next actionable surface.

## First Questions

Ask these silently before widening:

- What was completed before that resembles this?
- Which earlier path actually worked?
- What local path, command, branch, or artifact did that path converge on?
- What did prior work prove was unnecessary?
- Does the current task need the same seam, or only the same narrowing pattern?

## Evidence Rules

Treat these as strong evidence:

- a validated command
- a committed or saved artifact
- a known live service root
- a repo-local handoff or ledger
- a direct user correction that changed future workflow
- a previous failure mode with a concrete fix or avoidance rule

Treat these as weak evidence:

- vague thematic similarity
- old speculation without completion
- broad memory hits without a concrete path
- a larger precedent when a smaller one is available

## Pattern Extraction

For the closest prior completed work, extract only:

- the anchor it started from
- the search path that narrowed correctly
- the concrete thing that moved the task
- the validation surface
- the part of the exploration that was unnecessary

Do not copy the whole old solution when only the narrowing pattern is reusable.

## One-Hop Expansion Rule

Expand outward from the proven anchor:

1. anchor file, service, branch, command, or artifact
2. directly adjacent file, symbol, command, route, thread, or handoff
3. one more hop only if the first hop does not produce an actionable surface

Stop when the next move is concrete.

## Narrowing Rule

Stop widening as soon as one of these is clear:

- the file to edit
- the command to run
- the branch to inspect
- the artifact to inspect
- the live surface to validate
- the blocker to report

If more than one surface remains, choose the one with the smallest merge, permission, or coordination risk.

## Cadence Pass

Use this when an experience-based cadence is configured to run every `k` turns.

- Preserve the current `k` if one is already active.
- If `k` is unset, default to `6`.
- If `k` changes, apply it immediately.

At each cadence pass:

1. Inspect what was completed since the last pass.
2. Find the nearest successful pattern or decision.
3. Compare the current path against that pattern.
4. End with exactly one of:
   - reaffirm current surface
   - replace it with one better actionable surface
   - mark a concrete blocker that prevents either

Do not let the cadence pass become a broad retrospective or a new planning branch.

## Immediate Operation

- Prefer `rg` over broad recursion.
- Use one worker for tightly coupled work.
- Use more workers only when the subproblems are clearly independent.
- Report the chosen surface before editing.
- If the surface is already actionable, act instead of researching more.

## When To Refresh

- refresh if prior experience seems stale
- refresh if the task outcome depends on a possibly changed local snapshot
- refresh if the first candidate surface fails or is ambiguous
