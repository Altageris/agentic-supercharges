# Experience Playbook

Use this when a task needs to learn from prior completed work before widening.

## Order Of Attack

1. Restate the current anchor in the narrowest local terms.
2. Read `C:\Users\jeanj\.codex\memories\memory_summary.md`.
3. Read `C:\Users\jeanj\.codex\memories\MEMORY.md`.
4. Search for the closest prior completed work, not the broadest related topic.
5. Search `C:\Users\jeanj\.codex\memories\raw_memories.md` only when `MEMORY.md` does not already point to the right seam.
6. Search `C:\Users\jeanj\.codex\memories\session_index.jsonl` or `history.jsonl` only after a narrow candidate appears.
7. Open the smallest matching rollout summary or history slice.
8. Filter out surfaces already resolved in the active thread.
9. Extract one reusable pattern and one next actionable surface.

## First Questions

Ask these silently before widening:

- What was just completed that resembles this?
- Which earlier path actually worked?
- What anchor file, command, or branch did that earlier path converge on?
- Can the current task start from that same seam?
- Which nearby seams were already fixed in the active thread and should therefore be skipped?

## Stable Keywords

Use exact project names, thread ids, repo names, workflow nouns, and names of completed artifacts.

## Pattern Extraction

For the closest prior completed work, extract only:

- the anchor it started from
- the search path that narrowed correctly
- the concrete thing that moved the task
- the part of the exploration that was unnecessary

Do not copy the whole old solution when only the narrowing pattern is reusable.

## Resolved-Surface Filter

Before naming the next actionable surface, remove any candidate that was already:

- fixed in the active thread
- validated in the active thread
- explicitly reaffirmed by a recent `/exp` pass

Only resurface a previously resolved seam if current evidence shows:

- the fix did not propagate
- the fix failed
- a downstream seam still routes through the old behavior

## BFS Expansion Rule

Expand outward in one-hop steps from the proven anchor:

1. anchor file or artifact
2. directly adjacent file, symbol, command, or thread
3. one more hop only if the first hop does not produce an actionable surface

Stop when the next move is concrete.

## Narrowing Rule

Stop widening as soon as one of these is clear:

- the file to edit
- the command to run
- the branch to inspect
- the artifact to inspect

If more than one surface remains, choose the one with the smallest merge or coordination risk.

## Cadence Pass

Use this when `/exp` is configured to run every `k` turns.

- Preserve the current `k` if one is already active.
- If `k` is unset, default to `6`.
- If `k` changes, apply it immediately.
- At each cadence pass:
  - inspect what was completed since the last pass
  - find the nearest successful pattern
  - filter out surfaces already resolved since the last pass
  - compare the current path against the remaining unresolved pattern
  - end with exactly one of:
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
