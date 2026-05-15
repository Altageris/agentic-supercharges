#!/usr/bin/env python3
"""
Build ~/.claude/session-index.ndjson + ~/.claude/session-index.idx

Index format:
  .ndjson  — one JSON object per line, one session per line
  .idx     — binary sidecar: magic(4) + version(4) + count(4) + N×(hash_u32 + offset_u64)
             sorted by hash for binary search

Each NDJSON entry:
  id, project, started, topics, artifacts, skills_used, preview (first 2 msgs), resume
"""

import json, os, struct, sys
from pathlib import Path
from hashlib import md5

HOME = str(Path.home())
PROJECTS_DIR = os.path.join(HOME, '.claude', 'projects')
NDJSON_PATH  = os.path.join(HOME, '.claude', 'session-index.ndjson')
IDX_PATH     = os.path.join(HOME, '.claude', 'session-index.idx')
MAGIC        = b'SIDX'
VERSION      = 1
MAX_SESSIONS = 90  # rolling window: days


def fnv32(s: str) -> int:
    h = 0x811c9dc5
    for c in s.encode():
        h ^= c
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h


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


def extract_session(path: str) -> dict | None:
    msgs, skills, artifacts = [], set(), set()
    started = None

    with open(path, 'rb') as f:
        for raw in f:
            try:
                obj = json.loads(raw)
            except Exception:
                continue

            ts = obj.get('timestamp')
            if ts and started is None:
                started = ts

            t = obj.get('type', '')

            # User messages → preview + topic signals
            if t == 'user':
                c = obj.get('message', {}).get('content', '')
                blocks = c if isinstance(c, list) else [{'type': 'text', 'text': c}]
                for b in blocks:
                    if isinstance(b, dict) and b.get('type') == 'text':
                        text = b['text']
                        if not text.startswith('<') and len(text) > 10:
                            msgs.append(text[:200])
                            break
                if len(msgs) >= 5:
                    break

            # Tool use → skill invocations + file artifacts
            if t == 'assistant':
                content = obj.get('message', {}).get('content', [])
                if isinstance(content, list):
                    for block in content:
                        if not isinstance(block, dict):
                            continue
                        if block.get('type') == 'tool_use':
                            name = block.get('name', '')
                            inp  = block.get('input', {})
                            if name == 'Skill':
                                s = inp.get('skill', '')
                                if s:
                                    skills.add(s)
                            if name in ('Read', 'Write', 'Edit'):
                                fp = inp.get('file_path', '')
                                if fp:
                                    artifacts.add(os.path.basename(fp))

    if not msgs:
        return None

    sid     = os.path.basename(path).replace('.jsonl', '')
    encoded = os.path.basename(os.path.dirname(path))
    project = decode_project_path(encoded)
    resume  = f'cd {project} && claude --resume {sid}'

    # Derive topics: first msg words, skill names, artifact names
    topics = list(skills)[:5] + list(artifacts)[:5]

    return {
        'id':          sid,
        'project':     project,
        'started':     started,
        'topics':      topics,
        'artifacts':   sorted(artifacts)[:10],
        'skills_used': sorted(skills),
        'preview':     msgs[:2],
        'resume':      resume,
    }


def load_existing_index() -> dict[str, int]:
    """Return {session_id: mtime_ns} for already-indexed sessions."""
    known = {}
    if not os.path.exists(NDJSON_PATH):
        return known
    with open(NDJSON_PATH) as f:
        for line in f:
            try:
                obj = json.loads(line)
                sid = obj.get('id')
                if sid:
                    known[sid] = True
            except Exception:
                pass
    return known


def find_session_files(days: int) -> list[str]:
    import time
    cutoff = time.time() - days * 86400
    results = []
    for root, dirs, files in os.walk(PROJECTS_DIR):
        dirs[:] = [d for d in dirs if d != 'subagents']
        depth = root.replace(PROJECTS_DIR, '').count(os.sep)
        if depth > 1:
            dirs[:] = []
            continue
        for f in files:
            if f.endswith('.jsonl'):
                fp = os.path.join(root, f)
                if os.path.getmtime(fp) >= cutoff:
                    results.append(fp)
    return results


def write_index(entries: list[dict]):
    # Write NDJSON and collect byte offsets
    offsets = []  # list of (hash_u32, offset_u64)
    with open(NDJSON_PATH, 'w') as f:
        for entry in entries:
            offset = f.tell()
            line = json.dumps(entry, separators=(',', ':'))
            f.write(line + '\n')
            offsets.append((fnv32(entry['id']), offset))

    # Sort by hash for binary search
    offsets.sort(key=lambda x: x[0])

    # Write binary idx: magic(4) + version(4) + count(4) + N×(u32 hash + u64 offset)
    with open(IDX_PATH, 'wb') as f:
        f.write(MAGIC)
        f.write(struct.pack('>II', VERSION, len(offsets)))
        for h, off in offsets:
            f.write(struct.pack('>IQ', h, off))

    print(f'Indexed {len(entries)} sessions → {NDJSON_PATH}')
    print(f'Sidecar → {IDX_PATH} ({len(offsets) * 12 + 12} bytes)')


def main():
    days = int(sys.argv[1]) if len(sys.argv) > 1 else MAX_SESSIONS
    print(f'Scanning sessions from last {days} days...')

    files = find_session_files(days)
    print(f'Found {len(files)} session files')

    known = load_existing_index()
    entries = []

    for fp in sorted(files, key=os.path.getmtime, reverse=True):
        sid = os.path.basename(fp).replace('.jsonl', '')
        if sid in known:
            continue
        entry = extract_session(fp)
        if entry:
            entries.append(entry)

    if not entries:
        print('No new sessions to index.')
        return

    # Merge with existing (append new to front)
    existing = []
    if os.path.exists(NDJSON_PATH):
        with open(NDJSON_PATH) as f:
            for line in f:
                try:
                    existing.append(json.loads(line))
                except Exception:
                    pass

    all_entries = entries + existing
    write_index(all_entries)


if __name__ == '__main__':
    main()
