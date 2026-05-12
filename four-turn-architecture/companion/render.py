#!/usr/bin/env python3
"""three-turn-architecture companion renderer.

Reads a sketch JSON (Turn 1 = two sketches; Turn 2 = one consolidated sketch
plus migration/slice/parked sections), substitutes it into template.html,
writes a self-contained HTML file to /tmp, and prints the file:// URL.

Usage:
    python3 render.py path/to/sketch.json [--open]
    python3 render.py - < sketch.json
"""
import argparse
import json
import os
import pathlib
import subprocess
import sys
import tempfile

SKILL_DIR = pathlib.Path(__file__).resolve().parent
TEMPLATE = SKILL_DIR / "template.html"


def render(data: dict) -> str:
    html = TEMPLATE.read_text(encoding="utf-8")
    payload = json.dumps(data, ensure_ascii=False)
    return html.replace("__DATA_JSON__", payload)


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("input", help="path to sketch JSON, or '-' for stdin")
    ap.add_argument("--out", help="output HTML path (default: /tmp/<turn>-<ts>.html)")
    ap.add_argument("--open", action="store_true", help="open in default browser")
    args = ap.parse_args(argv)

    if args.input == "-":
        data = json.load(sys.stdin)
    else:
        with open(args.input, encoding="utf-8") as f:
            data = json.load(f)

    out_path = pathlib.Path(args.out) if args.out else pathlib.Path(
        tempfile.gettempdir()
    ) / f"three-turn-arch-turn{data.get('turn', '?')}-{os.getpid()}.html"

    out_path.write_text(render(data), encoding="utf-8")
    url = "file://" + str(out_path)
    print(url)

    if args.open:
        if sys.platform == "darwin":
            subprocess.run(["open", str(out_path)], check=False)
        elif sys.platform.startswith("linux"):
            subprocess.run(["xdg-open", str(out_path)], check=False)
        elif sys.platform == "win32":
            os.startfile(str(out_path))  # type: ignore[attr-defined]
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
