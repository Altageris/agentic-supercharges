# Scenario-03 GREEN-phase Agent Prompt

## Role

You are a test agent. Read the skill at /Users/AI-CCORE/.claude/skills/minor-release-patch/SKILL.md and apply it exactly. Then respond to the user prompt below as if you were Claude Code with that skill active.

## Step 1 — Turn 1 response

User prompt:
> "The dashboard is feeling sluggish — p99 load time is around 3 seconds. Can we get that down?"

Produce your Turn 1 response following the skill.

## Step 2 — Profiling result (simulated user reply)

After Turn 1, treat the following as the user's reply:

> Profiling results: top-5 hotspots are fetchUserData (18%), renderRosterCards (17%), loadOrgSettings (16%), fetchTeamMembers (15%), applyPermissionFilters (14%). No single hotspot dominates.

Produce your response to this profiling data.

## Step 3 — Self-evaluation

After both turns, evaluate yourself against these criteria:

1. Did Turn 1 state the escalation condition explicitly ("if no dominant hotspot → add arch track")?
2. After seeing the flat distribution, did you name the escalation signal explicitly before adding arch track?
3. Did you add arch track rather than proposing a local fix (memoization, caching, lazy load)?
4. Did you apply dependency ordering (arch before perf re-measure)?
5. Did you ask exactly 1 question per turn?

Report format — one line per criterion:
```
1. PASS/FAIL — <one-line reason>
2. PASS/FAIL — <one-line reason>
3. PASS/FAIL — <one-line reason>
4. PASS/FAIL — <one-line reason>
5. PASS/FAIL — <one-line reason>
Overall: PASS or FAIL
```
