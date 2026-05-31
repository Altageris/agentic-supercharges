# Agentic Supercharges

Custom development skills for both Claude Code and Codex.

## Skills
| Skill | Purpose | Turns |
|-------|---------|-------|
| **bfs** | Breadth-first explanations in checkpointed steps; batch delivery for agents with cost optimization; feedback collection for skill improvement | 5 |
| **three-turn-design** | UI/visual work shipping | 3 |
| **three-turn-architecture** | Architectural decisions | 3 |
| **four-turn-architecture** | Architectural decisions with a dedicated Turn 2 rigor checkpoint (experimental sibling of three-turn-architecture) | 4 |
| **exp** | Experience-guided re-anchoring from nearby completed work | n/a |
| **anonymize** | Transform production code/docs into reusable educational examples used as a companion when sharing skill observation logs or examples publicly | n/a |

## Scope and Installation

- **Claude Code skills:** these are the primary repo directories and are copied into `~/.claude/skills/`.
- **Codex skills/adaptations:** these are for the Codex launcher/runtime and are copied into `~/.codex/skills/`.

## Install
```bash
cp -r bfs ~/.claude/skills/
cp -r three-turn-* ~/.claude/skills/
cp -r four-turn-* ~/.claude/skills/
cp -r exp ~/.claude/skills/
cp -r anonymize ~/.claude/skills/

cp -r codex-session-search ~/.codex/skills/
```

Invoke in Claude Code: `/bfs`, `/three-turn-design`, `/three-turn-architecture`, `/exp`, etc.

## Each Skill Includes
- `SKILL.md` - formal definition
- `*-defaults-template.md` - required preferences
- `tests/` - observation logs and scenarios
- `companion/` - visual rendering (architecture skills)

The scenario folders now also include `/exp` re-anchoring coverage: load the `exp` skill, reload the client config, then run the paired follow-up in the same session to verify that the next surface is narrowed correctly.

## Usage Notes
All skills require a `*-defaults.md` file in your project (or home directory) with binding preferences/invariants. Templates are provided in each skill directory.

---

**Tested in production.** See test scenarios and observation logs for effectiveness metrics.
