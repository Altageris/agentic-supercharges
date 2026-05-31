#!/usr/bin/env python3
"""Query the compact Codex session index."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

CODEX_DIR = Path.home() / ".codex"
NDJSON = CODEX_DIR / "session-index.ndjson"


def load_entries() -> list[dict]:
    if not NDJSON.exists():
        script = CODEX_DIR / "skills" / "index-sessions" / "scripts" / "build-index.py"
        print(f"No index found. Run: python {script}", file=sys.stderr)
        sys.exit(1)
    entries = []
    with NDJSON.open("r", encoding="utf-8", errors="ignore") as handle:
        for line in handle:
            try:
                entries.append(json.loads(line))
            except Exception:
                pass
    return entries


def score(entry: dict, terms: list[str]) -> tuple[int, list[str]]:
    haystacks = {
        "preview": " ".join(entry.get("preview", [])),
        "recent": " ".join(entry.get("recent_preview", [])),
        "topics": " ".join(entry.get("topics", [])),
        "artifacts": " ".join(entry.get("artifacts", [])),
        "project": entry.get("project", ""),
    }
    points = 0
    sites = []
    weights = {"preview": 5, "recent": 4, "topics": 3, "artifacts": 2, "project": 1}
    for term in terms:
        pattern = re.compile(re.escape(term), re.I)
        for site, text in haystacks.items():
            if pattern.search(text):
                points += weights[site]
                sites.append(site)
    return points, sorted(set(sites))


def main() -> None:
    parser = argparse.ArgumentParser(description="Query Codex session index")
    parser.add_argument("keywords", nargs="+")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    matches = []
    for entry in load_entries():
        points, sites = score(entry, args.keywords)
        if points:
            copy = dict(entry)
            copy["score"] = points
            copy["match_sites"] = sites
            matches.append(copy)
    matches.sort(key=lambda e: (e["score"], e.get("started") or ""), reverse=True)
    matches = matches[: args.limit]

    if args.json:
        print(json.dumps({"keywords": args.keywords, "matches": matches}, indent=2, ensure_ascii=False))
        return

    print(f"Found {len(matches)} session(s) matching: {' '.join(args.keywords)}")
    for entry in matches:
        print("-" * 70)
        print(f"Session  : {entry['id']}")
        print(f"Project  : {entry.get('project')}")
        print(f"Started  : {entry.get('started') or 'unknown'}")
        print(f"Score    : {entry['score']} ({', '.join(entry['match_sites'])})")
        print(f"Skills   : {', '.join(entry.get('skills_used', [])) or '-'}")
        print(f"Artifacts: {', '.join(entry.get('artifacts', [])[:10]) or '-'}")
        print(f"Resume   : {entry.get('resume')}")
        for msg in entry.get("preview", []):
            print(f"Preview  : {msg!r}")


if __name__ == "__main__":
    main()
