---
name: exp
description: Expansion from prior completed work for tasks that need Codex to learn from nearby experience, reuse the closest proven path, and pick the smallest next actionable surface. Use when a user asks to learn from what was already completed, avoid repeating old mistakes, re-anchor a drifting thread on evidence, or run an optional every-k-turn checkpoint with editable k.
---

# Exp

## Overview

Use this skill to expand from experience, not from generic exploration.

The first anchor is the closest prior completed work that resembles the current task. Expand outward from that proven surface only as much as needed to act now.

For the concrete search order, cadence pass shape, and narrowing rules, load [references/experience-playbook.md](references/experience-playbook.md).

For regression scoring focused on resolved-state awareness, use:

- `scripts/run-exp-regression.mjs`
- `scripts/score-exp-output.mjs`
- `references/regression-suite.json`
- `references/historical-test-outputs.json`

## Workflow

1. Start from the current anchor:
   - the user's current request
   - the current repo, file, branch, or seam
   - the most recent concrete work already in motion
2. Find the closest prior completed work:
   - completed edits
   - validated commands
   - prior rollout summaries
   - earlier threads that solved a similar local problem
3. Filter out surfaces already resolved in the active thread:
   - do not resurface a file, command, branch, or artifact that was already fixed, validated, or explicitly reaffirmed
   - prefer the nearest unresolved adjacent seam instead
4. Extract the reusable pattern from that prior work:
   - what was the real anchor
   - what search path worked
   - what file or command actually moved the task
   - what scope was unnecessary
5. Expand in a small BFS from that proven anchor:
   - one adjacent file
   - one adjacent symbol
   - one adjacent thread or artifact
   - one adjacent command surface
6. Stop as soon as one next actionable surface is clear.
7. Return that surface:
   - one file
   - one command
   - one branch
   - one diff or artifact
   - one next search seam when action is still premature

## Cadence Mode

Use an optional checkpoint cadence when the thread is long or drift-prone.

- `/exp` can run ad hoc from a user request.
- `/exp` can also run every `k` turns as a re-anchoring pass.
- `k` must stay editable.
- If no `k` is supplied, default to `6`.
- If `k` is edited, apply the new cadence immediately and report the new rhythm briefly.

During an every-`k`-turn pass:

1. Check what was actually completed since the last `/exp` pass.
2. Extract the nearest successful pattern or decision.
3. Filter out surfaces that were already resolved since the last `/exp` pass.
4. Compare the current path against the remaining unresolved pattern.
5. Name the smallest next surface that should now be acted on.
6. End with exactly one result:
   - reaffirm the current surface
   - replace it with one better surface
   - mark a concrete blocker
7. Do not convert the cadence pass into a broad retrospective or planning essay.

## Immediate Operation

- Prefer direct edits or targeted checks once the next surface is clear.
- Use `rg` before broad recursion.
- Use experience to learn the proven path, not to inflate scope.
- Use multiple workers only when the branches are genuinely independent and the merge surface stays small.
- Reduce worker count when the task is mostly re-anchoring, the repository is unstable, or the split introduces coordination overhead.

## Guardrails

- Do not widen scope just because more context exists.
- Do not treat `/exp` as an experiment runner or speculative branch generator.
- Do not turn every historical match into a new work branch.
- Do not prefer the biggest precedent; prefer the closest successful precedent.
- Do not resurface a seam that the active thread already fixed unless current evidence shows the fix failed or did not propagate.
- If prior experience is stale or ambiguous, say so and refresh only the smallest relevant slice.
- Preserve the current working scope unless the next actionable surface clearly points elsewhere.
- In cadence mode, do not interrupt active workers just to report the pass unless the user asks or the pass reveals a concrete correction.
- If cadence repeatedly produces no useful adjustment, bias toward less frequent checking instead of inventing expansion.

## Regression Check

After a meaningful change to this skill or its nearby routing surfaces, score at least one saved forward-test output against the regression suite.

- Prefer the regression suite when the failure mode is resolved-state awareness rather than generic reasoning quality.
- Treat `resolved_surface_repeat` as a real failure, not a cosmetic issue.
- Save representative outputs and re-score them after fixes so the trend is visible.
