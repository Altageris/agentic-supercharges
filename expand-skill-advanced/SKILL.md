---
name: expand-skill-advanced
description: Experience-guided expansion for tasks that need Codex to use completed prior work as evidence, govern scope tightly, and choose the next concrete action without speculative exploration after a first experience pass already established the nearby evidence surface. Use when `exp` already identified the right local precedent but stricter evidence-bounded widening is still needed, or when the user explicitly wants a stricter alternative to `expand-skill`. For the dedicated `/exp` command and first-line "learn from what was already completed" requests, use `exp`.
---

# Expand Skill Advanced

## Overview

Use this skill only as a stricter fallback after `exp` or when the user explicitly asks for a stricter evidence-bounded alternative to `expand-skill`. Do not treat it as the owner of `/exp` or the first-line choice for "learn from what was already completed" requests.

The purpose is not to search memory broadly. The purpose is to use completed prior work as operational evidence so the current task starts from the right local pattern, avoids known mistakes, and stops widening as soon as one actionable surface is clear.

For the concrete search order, evidence rules, and cadence pass shape, load [references/experience-playbook.md](references/experience-playbook.md).

## Contract

Use completed prior work to widen the current task only where evidence shows that doing so improves correctness, speed, or safety.

The pass should be:

- memory-informed
- scope-governing
- experience-first
- evidence-bounded

## Workflow

1. State the current anchor in narrow local terms:
   - the user's current request
   - the current repo, file, branch, service, or artifact
   - any concrete work already in motion
2. Find the closest completed precedent:
   - prior completed edits
   - validated commands
   - rollout summaries
   - handoffs or ledgers that record what actually worked
3. Extract only the reusable operating lesson:
   - the real anchor
   - the search path that narrowed correctly
   - the command, file, or artifact that moved the task
   - the validation surface
   - the unnecessary scope that should not be repeated
4. Expand in one-hop steps from that evidence:
   - one adjacent file
   - one adjacent symbol
   - one adjacent command surface
   - one adjacent thread, handoff, or artifact
5. Stop as soon as one next actionable surface is clear.
6. Act from that surface when the task calls for execution.

## Cadence Mode

Use cadence mode only when the thread is long, drift-prone, or the user requests periodic experience-based checks.

- This skill can run ad hoc from a user request.
- This skill can run every `k` turns as a re-anchoring pass.
- `k` must stay editable.
- If no `k` is supplied, default to `6`.
- If `k` changes, apply the new cadence immediately and report the new rhythm briefly.

During each cadence pass:

1. Check what was actually completed since the last experience pass.
2. Extract the nearest successful pattern or decision.
3. Compare the current path against that pattern.
4. End with exactly one result:
   - reaffirm the current surface
   - replace it with one better surface
   - mark a concrete blocker

Do not convert cadence into a broad retrospective or planning essay.

## Immediate Operation

- Prefer direct edits or targeted checks once the next surface is clear.
- Use `rg` before broad recursion.
- Use memory to learn the proven path, not to inflate scope.
- Use multiple workers only when the branches are genuinely independent and the merge surface stays small.
- Reduce worker count when the task is mostly re-anchoring, the repository is unstable, or the split introduces coordination overhead.

## Guardrails

- Do not widen scope just because more context exists.
- Do not treat this skill as an experiment runner, explanation command, or speculative branch generator.
- Do not turn every memory hit into a work branch.
- Do not prefer the biggest precedent; prefer the closest completed precedent.
- If prior experience is stale or ambiguous, say so and refresh only the smallest relevant slice.
- Preserve the current working scope unless the next actionable surface clearly points elsewhere.
- If cadence repeatedly produces no useful adjustment, bias toward less frequent checking instead of inventing expansion.
