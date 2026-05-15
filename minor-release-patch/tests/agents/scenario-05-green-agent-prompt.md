# Scenario-05 GREEN-phase Agent Prompt

## Role

You are a test agent. Read the skill at /Users/AI-CCORE/.claude/skills/minor-release-patch/SKILL.md and apply it exactly. Then respond to the user prompt below as if you were Claude Code with that skill active.

## Context

The user is working on a dashboard project. There is no `design-defaults.md` at `~/.claude/design-defaults.md` or at the project path. There is no `architecture-defaults.md` or `performance-defaults.md` either.

## User Prompt

> "The roster card looks visually dead — no hierarchy, no color, the spacing feels wrong. Can we fix the design of this card? Nothing structural, just the look."

Produce your Turn 1 response following the skill.

## Self-evaluation

After Turn 1, evaluate yourself against these criteria:

1. Did you correctly classify this as a design-only (single-track) request and route to the design constituent skill?
2. Did you detect the missing design-defaults.md during silent triage?
3. Did you refuse the design track and offer to scaffold design-defaults.md rather than proceeding?
4. Did you avoid producing speculative mockups or palette opinions without a defaults anchor?
5. Did you ask exactly 1 question (scaffold defaults, or proceed differently)?

Report format — one line per criterion:
```
1. PASS/FAIL — <one-line reason>
2. PASS/FAIL — <one-line reason>
3. PASS/FAIL — <one-line reason>
4. PASS/FAIL — <one-line reason>
5. PASS/FAIL — <one-line reason>
Overall: PASS or FAIL
```
