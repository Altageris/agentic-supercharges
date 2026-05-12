# three-turn-design

A skill that compresses UI design conversations into three user-facing turns: **Diagnose → Compose → Ship**.

## Layout

```
three-turn-design/
├── SKILL.md                       # The skill definition (auto-loaded)
├── README.md                      # You are here
├── design-defaults-template.md    # Copy this to ~/.claude/design-defaults.md to enable the skill
└── tests/
    ├── README.md                  # How to run scenarios
    ├── scenario-00-no-defaults.md
    ├── scenario-01-dead-idle.md
    ├── scenario-02-empty-tile-live.md
    ├── scenario-03-open-exploration.md
    ├── scenario-04-grace-notes.md
    └── observation-log.md         # Append-only log of observed runs
```

## Quickstart

1. **Scaffold preferences:**
   ```
   cp ~/.claude/skills/three-turn-design/design-defaults-template.md ~/.claude/design-defaults.md
   ```
   Fill in the choices. The skill refuses to run without this file.

2. **Invoke in a session:**
   ```
   /three-turn-design  (or just describe the UI problem with a speed signal)
   ```

3. **Observe a run:** open one of the test scenarios, follow the user-prompt flow, log the result in `tests/observation-log.md`.

## What this skill assumes

- The user wants to *ship*, not collaborate. Every clause in `design-defaults.md` is treated as binding, not consultative.
- The codebase is readable — the skill grounds itself in actual files before designing.
- The visual companion is available (the skill renders mockups to a browser, not text-only).
- Three turns is a hard budget. If a fourth would be needed, the skill chooses a default, parks the question in the spec, and ships.

## What this skill is not

- Not for open-ended exploration. Use `superpowers:brainstorming` for "what should we build?"
- Not for backend-only work. The compression formula relies on visual fork → render → ship.
- Not a replacement for code review. The skill ships a working implementation; correctness review is a separate pass.

## Iterating

The skill is meant to be revised based on observed drifts. The flow:

1. Run scenarios across real projects.
2. Log every deviation in `tests/observation-log.md`.
3. When the same drift recurs (e.g., "kept asking about palette"), tighten the corresponding rule in `SKILL.md`.
4. Append a `Skill change` entry to the observation log describing what changed and why.

The test scenarios are the contract; the observation log is the feedback loop; `SKILL.md` is the artifact that tightens over time.

## Source

Distilled from a real 32-turn brainstorming session that the user wanted to compress. The principles, phase shape, and discipline rules in `SKILL.md` are direct lifts from that session's working patterns and friction points.
