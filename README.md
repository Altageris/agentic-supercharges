# Agentic Supercharges

Custom Claude Code skills for high-velocity development.

## Skills

| Skill | Purpose | Turns |
|-------|---------|-------|
| **three-turn-design** | UI/visual work shipping | 3 |
| **three-turn-architecture** | Architectural decisions | 3 |
| **four-turn-architecture** | Architectural decisions with a dedicated Turn 2 rigor checkpoint (experimental sibling of three-turn-architecture) | 4 |
| **anonymize** | Transform production code/docs into reusable educational examples — used as a companion when sharing skill observation logs or examples publicly | n/a |

## Install

Copy skills to `~/.claude/skills/`:
```bash
cp -r three-turn-* ~/.claude/skills/
cp -r four-turn-* ~/.claude/skills/
cp -r anonymize ~/.claude/skills/
```

Invoke in Claude Code: `/three-turn-design`, `/three-turn-architecture`, etc.

## Each Skill Includes

- `SKILL.md` — formal definition
- `*-defaults-template.md` — required preferences
- `tests/` — observation logs & scenarios
- `companion/` — visual rendering (architecture skills)

The scenario folders now also include `/exp` re-anchoring coverage: load the `exp` skill, reload the client config, then run the paired follow-up in the same session to verify that the next surface is narrowed correctly.

## Usage Notes

All skills require a `*-defaults.md` file in your project (or home directory) with binding preferences/invariants. Templates provided in each skill directory.

---

**Tested in production.** See test scenarios and observation logs for effectiveness metrics.
