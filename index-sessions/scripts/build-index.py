#!/usr/bin/env python3
"""Build a compact searchable index for Codex sessions."""

from __future__ import annotations

import json
import os
import re
import struct
import sys
import time
from pathlib import Path
from typing import Any

HOME = Path.home()
CODEX_DIR = HOME / ".codex"
SESSIONS_DIR = CODEX_DIR / "sessions"
NDJSON_PATH = CODEX_DIR / "session-index.ndjson"
IDX_PATH = CODEX_DIR / "session-index.idx"
MAGIC = b"SIDX"
VERSION = 1
DEFAULT_DAYS = 90

PATH_RE = re.compile(r"[A-Za-z]:\\[^\s\"'<>|]+|(?:[\w.-]+/)+[\w.-]+")
SKILL_RE = re.compile(r"(?:Using|use|uses)\s+`?([a-z0-9][a-z0-9_.:-]*?)`?\s+(?:skill|because)|\$([a-z0-9][a-z0-9_.:-]*)", re.I)


def fnv32(text: str) -> int:
    h = 0x811C9DC5
    for byte in text.encode("utf-8", "ignore"):
        h ^= byte
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h


def text_blocks(value: Any) -> list[str]:
    out: list[str] = []
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        for item in value:
            if isinstance(item, dict):
                text = item.get("text") or item.get("input_text") or item.get("output_text")
                if isinstance(text, str):
                    out.append(text)
            elif isinstance(item, str):
                out.append(item)
    return out


def payload_text(payload: dict[str, Any]) -> list[tuple[str, str]]:
    role = payload.get("role") or payload.get("type") or "event"
    content = payload.get("content")
    if content is None and "message" in payload:
        content = payload["message"]
    return [(str(role), text) for text in text_blocks(content)]


def extract_session(path: Path) -> dict[str, Any] | None:
    sid = path.stem.replace("rollout-", "")
    cwd = str(HOME)
    started = None
    user_messages: list[str] = []
    recent_messages: list[str] = []
    skills: set[str] = set()
    artifacts: set[str] = set()

    with path.open("r", encoding="utf-8", errors="ignore") as handle:
        for raw in handle:
            try:
                obj = json.loads(raw)
            except Exception:
                continue

            timestamp = obj.get("timestamp")
            if timestamp and started is None:
                started = timestamp

            typ = obj.get("type")
            payload = obj.get("payload") if isinstance(obj.get("payload"), dict) else {}

            if typ == "session_meta":
                meta = payload
                sid = meta.get("id") or sid
                cwd = meta.get("cwd") or cwd
                started = meta.get("timestamp") or started
                continue

            for role, text in payload_text(payload):
                clean = " ".join(text.split())
                if not clean or clean.startswith("<"):
                    continue
                recent_messages.append(clean[:300])
                if role == "user" or typ in {"user_message", "turn_context"}:
                    user_messages.append(clean[:300])
                for match in SKILL_RE.finditer(clean):
                    skill = match.group(1) or match.group(2)
                    if skill:
                        skills.add(skill.lower())
                for match in PATH_RE.finditer(clean):
                    artifacts.add(os.path.basename(match.group(0).rstrip(".,):]")))

            if typ == "response_item" and isinstance(payload, dict):
                name = payload.get("name") or payload.get("tool_name")
                if isinstance(name, str) and "skill" in name.lower():
                    skills.add(name)
                args = payload.get("arguments") or payload.get("input")
                if isinstance(args, dict):
                    for key in ("path", "file_path", "command"):
                        val = args.get(key)
                        if isinstance(val, str):
                            artifacts.add(os.path.basename(val.rstrip(".,):]")))

    preview_source = user_messages or recent_messages
    if not preview_source:
        return None

    topics = sorted(skills)[:8] + sorted(a for a in artifacts if a)[:8]
    return {
        "id": sid,
        "project": cwd,
        "started": started,
        "topics": topics,
        "artifacts": sorted(a for a in artifacts if a)[:20],
        "skills_used": sorted(skills),
        "preview": preview_source[:2],
        "recent_preview": preview_source[-5:],
        "resume": f"cd {cwd} && codex resume {sid}",
        "jsonl": str(path),
    }


def find_session_files(days: int) -> list[Path]:
    cutoff = time.time() - days * 86400
    if not SESSIONS_DIR.exists():
        return []
    return [p for p in SESSIONS_DIR.rglob("*.jsonl") if p.stat().st_mtime >= cutoff]


def write_index(entries: list[dict[str, Any]]) -> None:
    offsets: list[tuple[int, int]] = []
    with NDJSON_PATH.open("w", encoding="utf-8") as handle:
        for entry in entries:
            offset = handle.tell()
            handle.write(json.dumps(entry, ensure_ascii=False, separators=(",", ":")) + "\n")
            offsets.append((fnv32(entry["id"]), offset))
    offsets.sort(key=lambda item: item[0])
    with IDX_PATH.open("wb") as handle:
        handle.write(MAGIC)
        handle.write(struct.pack(">II", VERSION, len(offsets)))
        for hashed, offset in offsets:
            handle.write(struct.pack(">IQ", hashed, offset))
    print(f"Indexed {len(entries)} Codex sessions -> {NDJSON_PATH}")
    print(f"Sidecar -> {IDX_PATH} ({len(offsets) * 12 + 12} bytes)")


def main() -> None:
    days = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_DAYS
    files = sorted(find_session_files(days), key=lambda p: p.stat().st_mtime, reverse=True)
    print(f"Scanning {len(files)} Codex session files from last {days} days...")
    entries = [entry for path in files if (entry := extract_session(path))]
    write_index(entries)


if __name__ == "__main__":
    main()
