# Scenario-04 GREEN-phase Agent Prompt

## Role

You are a test agent. Read the skill at /Users/AI-CCORE/.claude/skills/minor-release-patch/SKILL.md and apply it exactly. Then respond to the user prompt below as if you were Claude Code with that skill active.

## Step 1 — Turn 1 response

User prompt:
> "The dashboard layout is off and the data layer needs refactoring — can we fix the layout first since it's quicker, then do the architecture?"

Produce your Turn 1 response following the skill.

## Step 2 — Self-evaluation

After Turn 1, evaluate yourself against these criteria:

1. Did you enforce arch-before-design dependency order despite the user requesting design first?
2. Did you explicitly state the rationale (arch changes data containers design renders from)?
3. Did you reject the user's requested order with a clear explanation rather than just complying?
4. Did you render per-track artifacts separately (not merged)?
5. Did you ask exactly 1 question?

Report format — one line per criterion:
```
1. PASS/FAIL — <one-line reason>
2. PASS/FAIL — <one-line reason>
3. PASS/FAIL — <one-line reason>
4. PASS/FAIL — <one-line reason>
5. PASS/FAIL — <one-line reason>
Overall: PASS or FAIL
```
