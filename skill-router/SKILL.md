---
name: skill-router
description: Advise which local Codex skill to use first, which additional skills to sequence next, and which skills to avoid for now. Use when a task could match multiple skills, when the user asks for the right skill order, when scope should stay narrow, when Codex should measure skill-traffic before widening, or when routing should act as a permission layer for additional skill passes before exploring or editing.
---

# Skill Router

Choose the smallest useful skill set for the task. Prefer one skill when one is enough, and treat routing as the permission layer for any extra skill pass.

## Workflow

1. State the task anchor in one short sentence.
2. Identify whether an exact skill match already exists.
3. Measure the likely traffic of adding skills:
   - prompt and context overhead
   - coordination or handoff overhead
   - tool churn or repeated discovery
   - drift risk from widening too early
4. Recommend the first skill to use.
5. Grant permission for follow-on skills only if they materially reduce risk or unlock the next step enough to justify the traffic.
6. Name any skills to avoid for now when they would widen scope, duplicate work, or add coordination overhead.
7. End with the smallest immediate surface to act on:
   - one file
   - one command
   - one branch
   - one artifact

## Routing Rules

- Prefer an exact-scope skill over a generic discovery skill.
- Prefer `goal-pivot-ledger` first when the user is intentionally changing the thread's main goal and the shift should be tracked, gated by dependencies, or launched as redirected work.
- Prefer an execution skill over an exploration skill when the next action is already clear.
- Prefer a continuity skill when the task is about prior threads, session ids, or saved context.
- Prefer a docs skill when the answer may have drifted and official guidance matters.
- Prefer `exp` first when the user wants to learn from what was already completed, reuse a proven local path, avoid repeating old mistakes, or re-anchor on prior completed work before acting.
- Measure traffic before widening. A skill pass is allowed only when its expected gain clearly exceeds its prompt, coordination, and tool overhead.
- Treat routing as permissioning, not just suggestion. Approve the minimum next skill set and defer the rest.
- Use `expand-skill` only after one anchor is clear and the next local surface is still ambiguous.
- Use `expand-skill` for generic scope widening, but use `exp` when the widening should be governed by prior completed work as evidence.
- Avoid multi-agent skills unless the user explicitly allows delegation and the branches are genuinely independent.
- If no skill materially improves the task, say so and proceed without forcing one.

## Telemetry Foundation

Treat this skill as the ground base for a future telemetry agent.

Scaffold: [`scripts/telemetry-foundation.mjs`](scripts/telemetry-foundation.mjs) defines the canonical record shape, field sets, permission decisions, structured immediate surface, and normalizer for routing telemetry.

- The telemetry agent should inherit the same routing gate: measure traffic first, then approve or defer skill passes.
- The telemetry agent should record permission decisions, not just raw tool or skill usage.
- The telemetry agent should preserve the smallest-action bias by tracking which skill pass was approved, which ones were deferred, and why.

Measure at least these fields:

- task anchor
- first approved skill
- approved follow-on skills
- deferred skills
- traffic reasons:
  - prompt or context overhead
  - coordination or handoff cost
  - tool churn
  - drift risk from widening
- immediate surface chosen:
  - file
  - command
  - branch
  - artifact

Use telemetry to explain routing decisions and improve later passes, not to justify widening by default.

## Common Sequences

### Session Resume

- Use `session-reload` first when the user wants to reopen an exact session or launch `codex resume <id>`.
- Use `thread-memory-bridge` before or after it only if the session context itself is unclear.
- Use `expand-skill` only if the right session, cwd, or handoff surface is still uncertain.

### Auth And Account Routing

- Use `openai-docs` first when the user needs current official auth or product behavior.
- Use `expand-skill` after that only if the local auth-state surface still needs to be found.
- Do not start with broad repo-analysis or delegation skills.

### Prior-Thread Continuity

- Use `thread-memory-bridge` first when the real problem is continuity across threads.
- Use `session-reload` next if reopening the prior session is the cleanest move.
- Use `expand-skill` only if the parent thread or exact artifact is not yet known.

### Learn From Completed Work

- Use `exp` first when the user wants the next move to be shaped by what already succeeded nearby.
- Use `expand-skill` only if the current anchor is clear but the local search surface is still ambiguous even after the experience pass.
- Use `thread-memory-bridge` only when the real blocker is missing cross-thread continuity rather than missing lessons from completed work.

### Goal Changes

- Use `goal-pivot-ledger` first when the user wants to drastically change the main goal of the conversation.
- Keep `skill-router` as the permission layer around that pivot only if traffic still needs to be measured before approving follow-on skill passes.
- Use `subagent-coordinator` only after the pivot has been accepted and turned into a bounded execution plan.
- Avoid `expand-skill` as the first move when the real problem is enforcement of prerequisites rather than discovery of adjacent surfaces.

### Repo Exploration

- Use the narrowest repo-specific skill first.
- Use `expand-skill` when there are several plausible files or branches and no immediate edit surface.
- Do not recommend subagent skills for mostly exploratory work unless the split is clean.

## Response Format

Return a short recommendation using this shape:

- `First:` the first skill to use
- `Traffic:` why the recommended path is cheap enough or worth the added cost
- `Permission:` which additional skill passes are approved now versus deferred
- `Next:` follow-on skills only if needed
- `Avoid for now:` skills that would widen scope or add noise
- `Immediate surface:` the next concrete file, command, branch, or artifact

Keep the explanation brief and decision-oriented.
