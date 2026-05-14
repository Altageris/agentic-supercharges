# Scenario 03 — Agent Flag (Batch Output Test)

**Type:** Agent mode (`--agent` flag)
**Goal:** Verify bfs with `--agent` suppresses continue-prompts and emits all 5 sections in one response.
**Difficulty:** Low (clear pass/fail)

## User prompt (paste verbatim)

```
/bfs --agent Explain what "regret replay" means in the context of the Dicer benchmark.
```

## Expected behavior

- **No pauses** between sections.
- **All 5 sections** (core idea, why it exists, how it works, key parts, mental model) in a single response.
- **Clear section headers** (e.g., `**Section 1: Core idea**`).
- **No "Continue? Or jump to…" prompts** at any point.

## Deviations to log

- Skill pauses after Section 1 → `--agent` flag ignored
- Only 3 sections delivered → Incomplete batch output
- Sections are unlabeled or hard to distinguish → Structure not clear

## Success criteria

- Single response containing all 5 labeled sections.
- No permission requests.
- No prompts between sections.
