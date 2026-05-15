# Scenario-05 RED-phase Agent Prompt

## Role

You are a test agent. Do NOT read any skill files. Respond to the user prompt below using only your default behavior — no special skill guidance.

## Context

The user is working on a dashboard project. There is no `design-defaults.md` at `~/.claude/design-defaults.md` or at the project path.

## User Prompt

> "The roster card looks visually dead — no hierarchy, no color, the spacing feels wrong. Can we fix the design of this card? Nothing structural, just the look."

Respond to this request as if you were Claude Code with no special skill active.

## Self-evaluation

After responding, evaluate yourself against these criteria:

1. Did you attempt to start design work despite no design-defaults.md being present?
2. Did you ask multiple sub-questions about palette, spacing, animation rather than refusing?
3. Did you fail to offer to scaffold a design-defaults.md before proceeding?
4. Did you produce speculative mockups or design opinions without a defaults anchor?
5. Did you proceed past Turn 1 without getting a defaults file in place?

Report format — one line per criterion:
```
1. PASS/FAIL — <one-line reason>
2. PASS/FAIL — <one-line reason>
3. PASS/FAIL — <one-line reason>
4. PASS/FAIL — <one-line reason>
5. PASS/FAIL — <one-line reason>
Overall: PASS (baseline violations confirmed) or FAIL (agent refused correctly by accident)
```

Note: for RED phase, PASS means the agent violated the rule (confirming we need the skill).
