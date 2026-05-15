---
name: session-search
description: Find a previous Claude Code session by keyword or description. Returns session ID and exact --resume command. Defaults to last 3 days across all project dirs. Expands date window progressively if nothing found.
---

# Session Search

Find a previous Claude Code session and return the exact `cd <dir> && claude --resume <id>` command.

**Arguments (all optional):**
- Keywords — words you remember from the conversation
- Date / range — default: last 3 days
- Project dir — default: all project directories

---

## Steps

### Step 1 — Find + filter candidate sessions

Default window: **3 days**. If keywords provided, grep inline. If not, carry all candidates forward.

```bash
find ~/.claude/projects -maxdepth 2 -name "*.jsonl" -not -path "*/subagents/*" -mtime -3 \
  | xargs grep -ril "word1\|word2" 2>/dev/null
```

**Progressive expansion** — if no matches, re-run with wider windows **without asking the user**:

| Attempt | Window |
|---|---|
| 1 | `-mtime -3` (default) |
| 2 | `-mtime -7` |
| 3 | `-mtime -14` |
| 4 | `-mtime -30` |
| 5 | (no `-mtime`, all time) |

If **no keywords** given, skip grep — carry all files from `find` forward.

**Index fallback** — if all-time grep still returns nothing and keywords were given, query the session index:

```bash
python3 ~/.claude/skills/index-sessions/scripts/query-index.py <keyword> [keyword2 ...] --limit 5
```

If the index also returns nothing, report "no sessions found" and ask for different terms. Do not attempt further expansion.

---

### Step 2 — Extract first meaningful user messages (matched files only)

Run only on the 1–5 files that survived Step 1:

```bash
python3 - <<'EOF' <file1> [file2 ...]
import json, sys, os
from pathlib import Path

home = str(Path.home())
projects_dir = os.path.join(home, '.claude', 'projects')

for path in sys.argv[1:]:
    msgs = []
    with open(path) as f:
        for line in f:
            try:
                obj = json.loads(line)
                if obj.get('type') == 'user':
                    c = obj.get('message', {}).get('content', '')
                    blocks = c if isinstance(c, list) else [{'type':'text','text':c}]
                    for b in blocks:
                        if isinstance(b, dict) and b.get('type') == 'text':
                            t = b['text']
                            if not t.startswith('<') and len(t) > 10:
                                msgs.append(t[:200])
                                break
                if len(msgs) >= 3:
                    break
            except:
                pass
    sid = path.split('/')[-1].replace('.jsonl','')
    encoded = os.path.basename(os.path.dirname(path))
    home_prefix = home.lstrip('/').replace('/', '-')
    suffix = encoded.lstrip('-')
    if suffix.startswith(home_prefix):
        suffix = suffix[len(home_prefix):].lstrip('-')
    def decode(base, parts):
        if not parts:
            return base if os.path.exists(base) else None
        for i in range(1, len(parts) + 1):
            seg = '-'.join(parts[:i])
            cand = os.path.join(base, seg)
            if os.path.isdir(cand):
                r = decode(cand, parts[i:])
                if r is not None:
                    return r
        return None
    proj_abs = decode(home, suffix.split('-')) if suffix else home
    if proj_abs is None:
        proj_abs = home
    print(f'--- {sid}')
    print(f'    project: {proj_abs}')
    for m in msgs:
        print(f'    > {repr(m)}')
EOF
```

---

### Step 3 — Score confidence and report

Assign a **confidence level** per candidate:

| Signal | Boost | Penalty |
|---|---|---|
| Keywords in first 3 user messages | +high | — |
| Keywords only deep in session | — | -medium |
| Single candidate after grep | +high | — |
| 4+ candidates after grep | — | -medium |
| Date window: 3 days | +medium | — |
| Date window: 14+ days | — | -low |
| No keywords (date-only search) | — | -medium |
| Project dir matched user's stated dir | +high | — |

Levels: **High** / **Medium** / **Low**

Report each match as:

```
Confidence : High / Medium / Low
Session    : <id>
Project    : <absolute path>
Preview    : <first 1–2 user messages>
Resume     : cd <absolute path> && claude --resume <id>
```

If multiple sessions match, list all with confidence levels and ask the user to confirm.

If no match after all-time expansion, report "no sessions found matching `<keywords>`" and ask for different terms.
