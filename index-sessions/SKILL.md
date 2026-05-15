---
name: index-sessions
description: Use when building or updating a searchable index of all Claude Code sessions, or when session-search returns no results and a deeper index-backed search is needed
---

# Index Sessions

Build and maintain a seekable index of Claude Code sessions at `~/.claude/session-index.ndjson` with a binary offset sidecar at `~/.claude/session-index.idx`.

## When to Use

- User asks to index sessions, rebuild the session index, or "make sessions searchable"
- `session-search` returns no results and the topic may be in older sessions
- First time setup — no index exists yet

## Index Format

**`session-index.ndjson`** — one JSON object per line:
```json
{"id":"<uuid>","project":"<abs-path>","started":"<ISO>","topics":["skill-name","filename"],"artifacts":["file.py"],"skills_used":["three-turn-design"],"preview":["first msg","second msg"],"resume":"cd <path> && claude --resume <id>"}
```

**`session-index.idx`** — binary sidecar for O(1) seek by session ID:
```
magic(4)  = 'SIDX'
version(4) = 1 (big-endian u32)
count(4)  = N entries (big-endian u32)
N × [ hash(4): FNV-32 of session_id | offset(8): byte offset in .ndjson ]
sorted by hash — binary search to seek directly to any session line
```

Size estimate: ~500 bytes/session → 500KB for 1000 sessions.

## Steps

### Step 1 — Build or update the index

```bash
python3 ~/.claude/skills/index-sessions/scripts/build-index.py [days]
```

- Default window: last 90 days
- Skips already-indexed sessions (incremental)
- Extracts: first 5 user messages, skill invocations, file artifacts from tool calls
- Writes NDJSON + rebuilds `.idx` sidecar

### Step 2 — Query the index

```bash
python3 ~/.claude/skills/index-sessions/scripts/query-index.py <keyword> [keyword2 ...]
```

- Greps compact NDJSON (fast — no raw session parsing)
- Returns up to 10 matches with project, skills, artifacts, preview, resume command
- For direct session ID lookup: uses `.idx` binary sidecar → O(1) seek

### Step 3 — Report results

Use the same confidence scoring as `session-search`:

| Signal | Boost |
|---|---|
| Keyword in preview (first 2 msgs) | +high |
| Keyword only in topics/artifacts | +medium |
| Single match | +high |
| 4+ matches | -medium |

## Signals Extracted Per Session

| Signal | Source | Stored as |
|---|---|---|
| First 5 user messages | `type: user` blocks | `preview` (first 2), topic inference |
| Skill invocations | `Skill` tool calls | `skills_used` |
| Files touched | `Read`/`Write`/`Edit` tool calls | `artifacts` |
| Session start time | first `timestamp` field | `started` |
| Project path | encoded directory name | `project` (decoded) |

## Maintenance

- Run `build-index.py` after sessions you want findable
- Or schedule via `/schedule` to run nightly
- Rolling 90-day window by default — pass `build-index.py 365` for a full-year index
- Index is append-only (new sessions prepended); no dedup needed within a window

## Scripts

- `scripts/build-index.py` — builds/updates index
- `scripts/query-index.py` — queries index by keyword
