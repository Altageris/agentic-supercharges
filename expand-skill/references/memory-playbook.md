# Memory Playbook

Use this when a task needs to expand from a vague request into a concrete working surface.

## Order Of Attack

1. Read `C:\Users\jeanj\.codex\memories\memory_summary.md`.
2. Read `C:\Users\jeanj\.codex\memories\MEMORY.md`.
3. Search `C:\Users\jeanj\.codex\memories\raw_memories.md` for stable keywords.
4. Search `C:\Users\jeanj\.codex\memories\session_index.jsonl` or `history.jsonl` only after a narrow candidate appears.
5. Open the smallest matching rollout summary or history slice.

## Stable Keywords

Use exact project names, thread ids, repo names, and workflow nouns.

Examples from this environment:

- `AlterProgramming`
- `Pokemon Showdown Agent`
- `pokemon-showdown`
- `Codename Arissa`
- `thread-memory-bridge`
- `balanced-subagents`
- `branch-artifacts`
- `codegraph`

## Narrowing Rule

Stop widening as soon as one of these is clear:

- the file to edit
- the command to run
- the branch to inspect
- the artifact to inspect

If more than one surface remains, choose the one with the smallest merge or coordination risk.

## Immediate Operation

- Prefer `rg` over broad recursion.
- Use one worker for tightly coupled work.
- Use more workers only when the subproblems are clearly independent.
- Report the chosen surface before editing.

## When To Refresh

- refresh if memory seems stale
- refresh if the task outcome depends on a possibly changed local snapshot
- refresh if the first candidate surface fails or is ambiguous
