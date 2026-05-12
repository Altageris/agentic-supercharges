# Agentic Supercharges

Custom Claude Code skills for architectural and design validation in high-stakes development environments.

## Skills

### three-turn-design
Compresses UI/design work into exactly 3 user-facing turns: Diagnose → Compose → Ship.
- Requires `design-defaults.md` with binding rules
- Delivers mockups, spec, and implementation in single session
- Ideal for museum display, real-time systems, visual-heavy features

### three-turn-architecture
Compresses architectural decisions into exactly 3 user-facing turns: Survey → Spec → Skeleton+Slice.
- Requires `architecture-defaults.md` with binding invariants
- Delivers typed interfaces, sequence diagrams, failure modes
- Ideal for boundary-crossing changes, state ownership, failure-mode analysis

### four-turn-architecture
Extended architecture skill for complex multi-layer systems.
- One additional turn for elaborate specifications
- Suited for distributed systems, complex state machines
- Same contract-first approach as three-turn-architecture

## Usage

Copy skills to `~/.claude/skills/` and invoke via `/skill-name` in Claude Code.

Each skill includes:
- `SKILL.md` — formal skill definition
- `*-defaults-template.md` — required preferences file template
- `tests/` — observation logs, scenarios, test results
- `README.md` — usage guide and examples

## Observation Logs

Test results and effectiveness metrics are stored in each skill's `tests/` directory:
- `observation-log.md` — session effectiveness metrics
- `scenario-*.md` — test scenarios and results

---

**Created:** 2026-05-12  
**Author:** Altageris / AI-CCORE
