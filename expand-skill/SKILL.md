---
name: expand-skill
description: Memory-guided scope expansion for tasks that need Codex to widen a problem carefully, mine local memory/history for relevant anchors, and start the smallest safe operation. Use when a user asks to expand a task, find adjacent files or threads, decide where to explore next, or turn a loose request into an actionable local workflow.
---

# Expand Skill

## Overview

Use this skill to widen from a small prompt to the smallest useful working surface without losing the anchor to prior memory.

Do not use this as the first-line skill for "learn from what was already completed" requests. Those route to `exp`.

For the concrete search order and narrowing rules, load [references/memory-playbook.md](references/memory-playbook.md).

## Workflow

1. Read the local memory surface first:
   - `C:\Users\jeanj\.codex\memories\memory_summary.md`
   - `C:\Users\jeanj\.codex\memories\MEMORY.md`
2. Search the narrowest likely anchor set next:
   - `C:\Users\jeanj\.codex\memories\raw_memories.md`
   - `C:\Users\jeanj\.codex\memories\session_index.jsonl`
   - `C:\Users\jeanj\.codex\history.jsonl`
3. Open only the smallest matching rollout summary or history slice.
4. Extract the immediate action surface:
   - one file
   - one command
   - one branch
   - one diff or artifact
5. If several surfaces are plausible, choose the narrowest one that can move the task forward and report the tradeoff briefly.

## Immediate Operation

- Prefer direct edits or targeted checks once the anchor is clear.
- Use `rg` before broad recursion.
- Use multiple workers only when the branches are genuinely independent and the merge surface stays small.
- Reduce worker count when the task is mostly exploration, the repository is unstable, or the split introduces coordination overhead.

## Guardrails

- Do not widen scope just because more context exists.
- Do not implicitly catch first-line experience-learning requests that belong to `exp`.
- Do not turn every memory hit into a new work branch.
- If memory is stale or ambiguous, say so and refresh only the smallest relevant slice.
- Preserve the current working scope unless the immediate surface clearly points elsewhere.
