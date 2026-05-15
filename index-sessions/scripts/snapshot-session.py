#!/usr/bin/env python3
"""
Snapshot the current Claude Code session to ~/.claude/snapshots/<session-id>.md

Usage:
  python3 snapshot-session.py            # auto-detect current session by most-recent mtime
  python3 snapshot-session.py <sid>      # explicit session ID

Writes a markdown file the next session can read to recover context post-compaction.
"""

import json, os, sys
from pathlib import Path
from datetime import datetime, timezone

HOME         = str(Path.home())
PROJECTS_DIR = os.path.join(HOME, '.claude', 'projects')
SNAPSHOTS    = os.path.join(HOME, '.claude', 'snapshots')
LAST_N       = 12   # messages to include in recent log
MAX_FILES    = 10   # default cap on files-touched list


def find_current_jsonl() -> tuple[str, str] | tuple[None, None]:
    """Return (session_id, jsonl_path) for the most-recently modified session."""
    best_mtime, best_path = 0, None
    for root, dirs, files in os.walk(PROJECTS_DIR):
        dirs[:] = [d for d in dirs if d != 'subagents']
        depth = root.replace(PROJECTS_DIR, '').count(os.sep)
        if depth > 1:
            dirs[:] = []
            continue
        for f in files:
            if f.endswith('.jsonl'):
                fp = os.path.join(root, f)
                mt = os.path.getmtime(fp)
                if mt > best_mtime:
                    best_mtime, best_path = mt, fp
    if not best_path:
        return None, None
    sid = os.path.basename(best_path).replace('.jsonl', '')
    return sid, best_path


def decode_project_path(encoded: str) -> str:
    home_prefix = HOME.lstrip('/').replace('/', '-')
    suffix = encoded.lstrip('-')
    if suffix.startswith(home_prefix):
        suffix = suffix[len(home_prefix):].lstrip('-')

    def _decode(base, parts):
        if not parts:
            return base if os.path.exists(base) else None
        for i in range(1, len(parts) + 1):
            seg = '-'.join(parts[:i])
            cand = os.path.join(base, seg)
            if os.path.isdir(cand):
                r = _decode(cand, parts[i:])
                if r is not None:
                    return r
        return None

    return _decode(HOME, suffix.split('-')) or HOME


def extract_snapshot(jsonl_path: str) -> dict:
    messages = []
    files_touched = set()
    skills_used = set()
    started = None

    with open(jsonl_path) as f:
        for raw in f:
            try:
                obj = json.loads(raw)
            except Exception:
                continue

            ts = obj.get('timestamp')
            if ts and started is None:
                started = ts

            t = obj.get('type', '')

            if t in ('user', 'assistant'):
                c = obj.get('message', {}).get('content', '')
                blocks = c if isinstance(c, list) else [{'type': 'text', 'text': c}]
                for b in blocks:
                    if isinstance(b, dict) and b.get('type') == 'text':
                        text = b['text'].strip()
                        if text and not text.startswith('<') and len(text) > 5:
                            messages.append((t, text))
                            break

            if t == 'assistant':
                content = obj.get('message', {}).get('content', [])
                if isinstance(content, list):
                    for block in content:
                        if not isinstance(block, dict):
                            continue
                        if block.get('type') == 'tool_use':
                            name = block.get('name', '')
                            inp  = block.get('input', {})
                            if name in ('Read', 'Write', 'Edit'):
                                fp = inp.get('file_path', '')
                                if fp:
                                    files_touched.add(fp)
                            if name == 'Skill':
                                s = inp.get('skill', '')
                                if s:
                                    skills_used.add(s)

    return {
        'started':      started,
        'messages':     messages,
        'files_touched': sorted(files_touched),
        'skills_used':  sorted(skills_used),
    }


def detect_pending(messages: list[tuple[str, str]]) -> list[str]:
    """Scan recent messages for pending/next/todo language."""
    SIGNALS = ('pending', 'next step', 'todo', 'still need', 'not yet', 'follow-up',
               'should build', 'will build', 'plan to', 'remaining')
    hits = []
    for role, text in messages[-30:]:
        lower = text.lower()
        if any(s in lower for s in SIGNALS):
            hits.append(f'[{role}] {text[:200]}')
    return hits[-5:]  # max 5


def write_snapshot(sid: str, jsonl_path: str, max_files: int = MAX_FILES, last_n: int = LAST_N):
    os.makedirs(SNAPSHOTS, exist_ok=True)
    out_path = os.path.join(SNAPSHOTS, f'{sid}.md')

    encoded  = os.path.basename(os.path.dirname(jsonl_path))
    project  = decode_project_path(encoded)
    snap     = extract_snapshot(jsonl_path)

    recent   = snap['messages'][-last_n:]
    pending  = detect_pending(snap['messages'])
    now      = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

    lines = [
        f'# Session Snapshot: {sid}',
        f'',
        f'**Snapshotted:** {now}',
        f'**Session started:** {snap["started"] or "unknown"}',
        f'**Project:** {project}',
        f'**Resume:** `cd {project} && claude --resume {sid}`',
        f'',
    ]

    if snap['skills_used']:
        lines += [f'## Skills Used', '']
        for s in snap['skills_used']:
            lines.append(f'- {s}')
        lines.append('')

    if snap['files_touched']:
        files = snap['files_touched']
        capped = (max_files > 0) and (len(files) > max_files)
        shown = files[:max_files] if capped else files
        header = f'## Files Touched ({len(files)} total, showing {len(shown)})' if capped else '## Files Touched'
        lines += [header, '']
        for fp in shown:
            lines.append(f'- {fp}')
        if capped:
            lines.append(f'- … {len(files) - max_files} more omitted (pass --max-files 0 for all)')
        lines.append('')

    if pending:
        lines += [f'## Pending / Next Steps (detected)', '']
        for p in pending:
            lines.append(f'> {p}')
        lines.append('')

    lines += [f'## Recent Messages (last {len(recent)})', '']
    for role, text in recent:
        prefix = 'User' if role == 'user' else 'Assistant'
        lines.append(f'**{prefix}:** {text[:400]}')
        lines.append('')

    with open(out_path, 'w') as f:
        f.write('\n'.join(lines))

    print(f'Snapshot written → {out_path}')
    print(f'Resume           : cd {project} && claude --resume {sid}')
    return out_path


def main():
    import argparse
    p = argparse.ArgumentParser(description='Snapshot current Claude Code session')
    p.add_argument('session_id', nargs='?', help='Session ID (default: auto-detect)')
    p.add_argument('--max-files', type=int, default=MAX_FILES, metavar='N',
                   help=f'Max files to list (default: {MAX_FILES}, 0 = unlimited)')
    p.add_argument('--last', type=int, default=LAST_N, metavar='N',
                   help=f'Messages to include (default: {LAST_N})')
    args = p.parse_args()
    last_n = args.last

    if args.session_id:
        sid = args.session_id
        # Find jsonl from explicit sid
        jsonl = None
        for root, dirs, files in os.walk(PROJECTS_DIR):
            dirs[:] = [d for d in dirs if d != 'subagents']
            depth = root.replace(PROJECTS_DIR, '').count(os.sep)
            if depth > 1:
                dirs[:] = []
                continue
            if sid + '.jsonl' in files:
                jsonl = os.path.join(root, sid + '.jsonl')
                break
        if not jsonl:
            print(f'Session {sid} not found in {PROJECTS_DIR}')
            sys.exit(1)
    else:
        sid, jsonl = find_current_jsonl()
        if not sid:
            print(f'No session files found in {PROJECTS_DIR}')
            sys.exit(1)
        print(f'Auto-detected session: {sid}')

    write_snapshot(sid, jsonl, max_files=args.max_files, last_n=last_n)


if __name__ == '__main__':
    main()
