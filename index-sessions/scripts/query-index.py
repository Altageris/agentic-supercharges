#!/usr/bin/env python3
"""
Query ~/.claude/session-index.ndjson using the .idx sidecar for O(1) seek.
Usage: query-index.py <keyword> [keyword2 ...]
"""

import json, os, struct, sys
from pathlib import Path

HOME       = str(Path.home())
NDJSON     = os.path.join(HOME, '.claude', 'session-index.ndjson')
IDX        = os.path.join(HOME, '.claude', 'session-index.idx')
MAGIC      = b'SIDX'


def fnv32(s: str) -> int:
    h = 0x811c9dc5
    for c in s.encode():
        h ^= c
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h


def load_idx() -> list[tuple[int, int]]:
    """Return sorted list of (hash, offset) pairs."""
    with open(IDX, 'rb') as f:
        magic = f.read(4)
        if magic != MAGIC:
            raise ValueError('Bad index file')
        _version, count = struct.unpack('>II', f.read(8))
        return [struct.unpack('>IQ', f.read(12)) for _ in range(count)]


def seek_by_id(session_id: str, offsets: list) -> dict | None:
    """Binary search idx for session_id, seek directly to its line."""
    target = fnv32(session_id)
    lo, hi = 0, len(offsets) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        h, off = offsets[mid]
        if h == target:
            with open(NDJSON) as f:
                f.seek(off)
                return json.loads(f.readline())
        elif h < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return None


def search_fulltext(keywords: list[str]) -> list[dict]:
    """Grep NDJSON for keywords — fast because file is compact."""
    import subprocess
    pattern = '\\|'.join(keywords)
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


def main():
    if not os.path.exists(NDJSON):
        print('No index found. Run: python3 build-index.py')
        sys.exit(1)

    keywords = sys.argv[1:]
    if not keywords:
        print('Usage: query-index.py <keyword> [keyword2 ...]')
        sys.exit(1)

    matches = search_fulltext(keywords)

    if not matches:
        print(f'No sessions found matching: {" ".join(keywords)}')
        sys.exit(0)

    for m in matches[:10]:
        print(f'\nSession  : {m["id"]}')
        print(f'Project  : {m["project"]}')
        print(f'Started  : {m.get("started", "unknown")}')
        print(f'Skills   : {", ".join(m.get("skills_used", [])) or "—"}')
        print(f'Artifacts: {", ".join(m.get("artifacts", [])) or "—"}')
        for p in m.get('preview', []):
            print(f'  > {repr(p[:120])}')
        print(f'Resume   : {m["resume"]}')


if __name__ == '__main__':
    main()
