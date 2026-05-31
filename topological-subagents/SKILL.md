---
name: topological-subagents
description: Coordinate subagents over dependency-ordered branches of a task while keeping the main thread on the critical path. Use when subagent work is explicitly allowed and the problem naturally decomposes into independent codebase regions, contact surfaces, or risk branches that should be explored in topological order. Default to mini subagents unless the user specifies otherwise or a branch truly needs a stronger model. Preserve existing agent context when possible instead of replacing in-flight work.
---

# Topological Subagents

## Overview

Use this skill to turn broad multi-area work into a dependency graph, delegate independent branches to mini subagents, and converge on shared choke points before editing. Keep urgent blocking work local; delegate side branches that can progress in parallel without stalling the next local step.

## Workflow

### 1. Build The Local Graph First

- Identify the dependency order before spawning agents.
- Name the branches in terms of contact surfaces, not files alone.
- Keep the main thread on the immediate blocker.

Use a compact map such as:

```text
types/config -> normalizers/adapters -> stateful services -> runners/callers
```

### 2. Delegate Independent Branches

- Spawn explorers only for branches that can be investigated independently.
- Default every new subagent to the mini variant unless the user explicitly names a different model or the branch clearly needs more reasoning depth.
- Give each subagent one bounded branch with a disjoint read or write scope.

Good prompts ask for:

- topological dependency order inside the branch
- main contact surfaces where data or state crosses boundaries
- highest-value choke points that would collapse multiple findings at once

### 3. Preserve Context

- Reuse or resume an existing subagent when it already owns the branch.
- Do not replace an in-flight agent just to restate the same task.
- If the user asks to replace agents, first check whether the current agents already satisfy the requested model policy.
- If replacement is necessary, prefer resume over respawn when prior context is valuable.

### 4. Use Topological Order In Synthesis

- Integrate upstream findings before downstream ones.
- Fix shared type or state contracts before patching individual consumers.
- Prefer choke points that reduce whole classes of failures.

Typical examples:

- request and side types before protocol consumers
- storage and config contracts before daemon mutation logic
- normalized bridge payload shape before ledger settlement behavior

### 5. Report Cross-Branch Contact Zones

When synthesizing, group findings by the places where branches touch:

- schema/type boundaries
- normalization/adaptation layers
- async state ownership boundaries
- orchestration or runner entrypoints

These contact zones are the best candidates for stabilization work.

### 6. Capture Agent Feedback

- When a delegated branch completes, ask for compact feedback before closing it out.
- Prefer 3-6 bullets covering:
  - tools or capabilities that would have helped
  - prompt/context structures that made the branch easier
  - friction or missing context that slowed the branch down
- Use the feedback to tighten the next topology pass and branch prompts.

### 7. Let Validated Branches Commit

- If a delegated write branch validates cleanly, prefer letting that branch owner make the commit.
- Keep commit ownership with the agent that owned the branch when the scope stayed disjoint.
- Fold commits back into the main thread only when integration or cross-branch reconciliation requires it.

## Guardrails

- Do not spawn subagents unless delegation is explicitly allowed.
- Keep one active owner per branch.
- Wait only when the next critical-path action truly depends on that result.
- Close redundant replacement agents promptly.
- State the active branch-to-agent mapping when coordination changes.

## Default Model Policy

- New subagents: mini by default.
- Existing matching mini subagents: preserve and resume.
- Stronger model: use only when the user specifies it or when the branch is unusually cross-cutting or synthesis-heavy.
