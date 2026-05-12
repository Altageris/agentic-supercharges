# Agentic Supercharges

Custom Claude Code skills for high-velocity development.

## Skills

| Skill | Purpose | Turns |
|-------|---------|-------|
| **three-turn-design** | UI/visual work shipping | 3 |
| **three-turn-architecture** | Architectural decisions | 3 |
| **four-turn-architecture** | Complex multi-layer systems | 4 |

## Install

Copy skills to `~/.claude/skills/`:
```bash
cp -r three-turn-* ~/.claude/skills/
cp -r four-turn-* ~/.claude/skills/
```

Invoke in Claude Code: `/three-turn-design`, `/three-turn-architecture`, etc.

## Each Skill Includes

- `SKILL.md` — formal definition
- `*-defaults-template.md` — required preferences
- `tests/` — observation logs & scenarios
- `companion/` — visual rendering (architecture skills)

## Usage Notes

All skills require a `*-defaults.md` file in your project (or home directory) with binding preferences/invariants. Templates provided in each skill directory.

---

**Tested in production.** See test scenarios and observation logs for effectiveness metrics.
