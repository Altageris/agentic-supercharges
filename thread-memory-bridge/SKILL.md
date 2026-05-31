---
name: thread-memory-bridge
description: Use when the user asks Codex to remember something for later, recover context from a previous thread, bridge memory across threads, or keep a durable running memory for an ongoing project. Reads the local Codex memory surface under C:\Users\jeanj\.codex\memories and writes concise durable notes into the skill-owned ledger.
---

# Thread Memory Bridge

Use this skill when the user wants continuity across Codex threads or asks for durable memory.

Primary goals:

- recover the most relevant prior thread context quickly
- capture durable facts from the current thread for future reuse
- keep memory notes concise, structured, and local

Do not use this skill for ordinary one-off questions that do not need persistence.

## Memory surface

Read from these local files first:

- `C:\Users\jeanj\.codex\memories\memory_summary.md`
- `C:\Users\jeanj\.codex\memories\MEMORY.md`
- `C:\Users\jeanj\.codex\memories\raw_memories.md`
- `C:\Users\jeanj\.codex\memories\rollout_summaries\`
- `C:\Users\jeanj\.codex\history.jsonl`
- `C:\Users\jeanj\.codex\session_index.jsonl`

Write durable skill-owned notes here:

- `C:\Users\jeanj\.codex\memories\skills\thread-memory-bridge\MEMORY_LEDGER.md`

## Small targeted workflow

The user prefers small targeted probes. Do not begin with broad recursive searches.

1. Start with `memory_summary.md` and `MEMORY.md`.
2. If the user references a prior thread, search `memory_summary.md`, `raw_memories.md`, and `session_index.jsonl` with `rg` using exact project names, thread ids, or stable keywords.
3. Only open the matching rollout summary files or matching history slices after you have a narrow candidate set.
4. If more detail is needed, inspect the matching session/rollout artifact directly instead of widening the search.

Good examples:

- `rg -n "Arissa|Quest|thread id" C:\Users\jeanj\.codex\memories\memory_summary.md C:\Users\jeanj\.codex\memories\raw_memories.md`
- `rg -n "project-name|keyword" C:\Users\jeanj\.codex\session_index.jsonl C:\Users\jeanj\.codex\history.jsonl`

Avoid:

- whole-profile recursion
- broad `Get-ChildItem -Recurse` across user roots
- searches that walk `node_modules`, `.git`, or unrelated caches

## What to store

Store only durable, reusable memory:

- user preferences
- stable workflow rules
- exact resume anchors
- project-specific facts that will save future rediscovery
- important constraints, caveats, and next-step anchors

Do not store:

- long chat transcripts
- obvious temporary thoughts
- secrets, tokens, or private credentials
- speculative claims presented as facts

## Ledger schema

When updating the ledger, append a compact entry with:

- date
- thread scope
- topic
- durable facts
- user preferences
- resume anchors

Keep entries short and searchable.

## Current-thread capture rule

When the user explicitly asks to remember from this thread forward:

1. summarize the durable outcome of the current task
2. append one concise entry to `MEMORY_LEDGER.md`
3. include the exact files, commands, or identifiers that future Codex runs should search first

## Previous-thread recovery rule

When the user asks for memory from a previous thread:

1. search the memory files above using stable topic keywords
2. identify the most likely prior thread or rollout summary
3. report the concrete file/thread anchor you found
4. reuse that anchor in the current task instead of reconstructing context from scratch

## Output style

- tell the user which memory file or thread anchor you used
- distinguish confirmed memory from inference
- if memory is missing, say so directly and name the exact files searched
