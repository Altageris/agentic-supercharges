#!/usr/bin/env python3
"""
Query ~/.claude/session-index.ndjson using the .idx sidecar for O(1) seek.
Usage: query-index.py <keyword> [keyword2 ...]

For each match, extracts:
  - Match-site context: ±2 messages around the keyword hit in the raw JSONL
  - Session arc: opening intent + closing state
"""

import json, os, re, struct, sys
from pathlib import Path

HOME         = str(Path.home())
PROJECTS_DIR = os.path.join(HOME, '.claude', 'projects')
NDJSON       = os.path.join(HOME, '.claude', 'session-index.ndjson')
IDX          = os.path.join(HOME, '.claude', 'session-index.idx')
MAGIC        = b'SIDX'
WINDOW       = 2  # messages before/after the match


def fnv32(s: str) -> int:
    h = 0x811c9dc5
    for c in s.encode():
        h ^= c
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h


def search_index(keywords: list[str]) -> list[dict]:
    """Grep the compact NDJSON index for keywords."""
    import subprocess
    pattern = '\\|'.join(re.escape(k) for k in keywords)
    result = subprocess.run(
        ['grep', '-i', pattern, NDJSON],
        capture_output=True, text=True
    )
    matches = []
    for line in result.stdout.splitlines():
        try:
            matches.append(json.loads(line))
        except Exception:
            pass
    return matches


def find_jsonl(session_id: str) -> str | None:
    """Locate the raw JSONL file for a session ID."""
    for root, dirs, files in os.walk(PROJECTS_DIR):
        dirs[:] = [d for d in dirs if d != 'subagents']
        depth = root.replace(PROJECTS_DIR, '').count(os.sep)
        if depth > 1:
            dirs[:] = []
            continue
        target = session_id + '.jsonl'
        if target in files:
            return os.path.join(root, target)
    return None


def extract_text(obj: dict) -> str | None:
    """Pull plain text from a message object."""
    role = obj.get('type', '')
    if role not in ('user', 'assistant'):
        return None
    c = obj.get('message', {}).get('content', '')
    blocks = c if isinstance(c, list) else [{'type': 'text', 'text': c}]
    for b in blocks:
        if isinstance(b, dict) and b.get('type') == 'text':
            t = b['text'].strip()
            if t and not t.startswith('<') and len(t) > 5:
                return t
    return None


def extract_context(jsonl_path: str, keywords: list[str]) -> dict:
    """
    Read the raw JSONL to find:
      - match_window: ±WINDOW messages around the first keyword hit
      - arc_open: first meaningful user message
      - arc_close: last meaningful user message
    """
    pattern = re.compile('|'.join(re.escape(k) for k in keywords), re.IGNORECASE)
    messages = []  # list of (role, text)

    with open(jsonl_path) as f:
        for raw in f:
            try:
                obj = json.loads(raw)
            except Exception:
                continue
            text = extract_text(obj)
            if text:
                messages.append((obj.get('type', ''), text))

    if not messages:
        return {}

    # Find first keyword hit
    hit_idx = None
    for i, (role, text) in enumerate(messages):
        if pattern.search(text):
            hit_idx = i
            break

    result = {}

    # Arc: opening + closing user messages
    user_msgs = [(i, t) for i, (r, t) in enumerate(messages) if r == 'user']
    if user_msgs:
        result['arc_open'] = user_msgs[0][1][:200]
        if len(user_msgs) > 1:
            result['arc_close'] = user_msgs[-1][1][:200]

    # Match window
    if hit_idx is not None:
        lo = max(0, hit_idx - WINDOW)
        hi = min(len(messages), hit_idx + WINDOW + 1)
        window = []
        for i, (role, text) in enumerate(messages[lo:hi], start=lo):
            marker = '>>>' if i == hit_idx else '   '
            window.append(f'{marker} [{role}] {text[:160]}')
        result['match_window'] = window
        result['match_found'] = True
    else:
        result['match_found'] = False

    return result


def main():
    if not os.path.exists(NDJSON):
        print('No index found. Run: python3 build-index.py')
        sys.exit(1)

    keywords = sys.argv[1:]
    if not keywords:
        print('Usage: query-index.py <keyword> [keyword2 ...]')
        sys.exit(1)

    matches = search_index(keywords)

    if not matches:
        print(f'No sessions found matching: {" ".join(keywords)}')
        sys.exit(0)

    print(f'Found {len(matches)} session(s) matching: {" ".join(keywords)}\n')

    for m in matches[:5]:
        sid = m['id']
        print('─' * 70)
        print(f'Session  : {sid}')
        print(f'Project  : {m["project"]}')
        print(f'Started  : {m.get("started", "unknown")}')
        print(f'Skills   : {", ".join(m.get("skills_used", [])) or "—"}')
        print(f'Artifacts: {", ".join(m.get("artifacts", [])) or "—"}')
        print(f'Resume   : {m["resume"]}')

        jsonl = find_jsonl(sid)
        if jsonl:
            ctx = extract_context(jsonl, keywords)
            if ctx.get('arc_open'):
                print(f'\nArc open : {repr(ctx["arc_open"])}')
            if ctx.get('arc_close'):
                print(f'Arc close: {repr(ctx["arc_close"])}')
            if ctx.get('match_window'):
                print('\nMatch context:')
                for line in ctx['match_window']:
                    print(f'  {line}')
        else:
            print('  (raw session file not found — index context only)')
        print()


if __name__ == '__main__':
    main()
