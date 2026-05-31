---
name: codex-session-search
description: Find previous Codex sessions by keyword, date, or project and return the exact resume command for `codex resume`. Use when the user asks to search Codex history, recover a prior Codex thread, inspect `~/.codex/sessions`, or jump back into an earlier Codex run.
---

# Codex Session Search

## Workflow

1. Search `~/.codex/session_index.jsonl` and `~/.codex/history.jsonl` first when the user remembers keywords, a thread title, or a recent command.
2. If the user gave no keywords, scan `~/.codex/sessions` by recency. Use a default 3-day window and widen to 7, 14, 30, then all time if needed.
3. For each candidate session file, read the `session_meta` record first. Extract:
   - `payload.id`
   - `payload.cwd`
   - `payload.timestamp`
4. Pull the first 1-3 meaningful user messages from the same file and use them as the preview.
5. Return the exact resume command in this form:

```text
cd <payload.cwd> && codex resume <payload.id>
```

## Matching Rules

- Prefer keyword hits in the first user messages over thread titles.
- Prefer the session index for fast narrowing, but verify candidates against the raw session file before answering.
- If several sessions match, report the top few with confidence and ask the user which one they want.
- If nothing matches, say so plainly and ask for better keywords instead of guessing.

## Output Shape

Use this compact report:

```text
Confidence : High / Medium / Low
Session    : <id>
Project    : <cwd>
Preview    : <first 1-2 user messages>
Resume     : cd <cwd> && codex resume <id>
```
