---
name: subagent-coordinator
description: Coordinate multiple Codex subagents across preidentified coding tasks by choosing the right branch shape, model tier, reasoning effort, and branch-local context packet. Use when delegation is explicitly allowed and the task list is already known well enough to assign bounded owners, validations, and integration checkpoints.
---

# Subagent Coordinator

Coordinate a group of Codex agents around already identified coding tasks. Keep the main thread on the critical path, assign one owner per branch, and send each agent only the context needed to act independently.

Executor scaffold: [`scripts/build-execution-plan.mjs`](scripts/build-execution-plan.mjs) converts a preidentified task set into a deterministic execution plan with model choice, reasoning effort, context packets, and permitted routed skills.
Launch scaffold: [`scripts/launch-execution-plan.mjs`](scripts/launch-execution-plan.mjs) wraps that plan in a permissive launch layer and can actually spawn branches when used from a Codex JS runtime with `codex.tool`.

## Workflow

1. Confirm the task list is preidentified.
2. Use `skill-router` first to decide whether delegation is worth the traffic.
3. If the surface is still ambiguous, use `exp` first when the ambiguity is about learning from prior completed work or reusing a proven local path; use `expand-skill` as the generic fallback before spawning agents.
4. Split the work into one of these shapes:
   - single bounded write branch
   - multiple independent branches
   - dependency-ordered branches
   - resume or revisit branch
5. Assign one owner per branch.
6. Choose the lightest model that can reliably finish that branch.
7. Send a branch-local context packet, not the whole transcript.
8. Keep local ownership of urgent blockers and integration.
9. Wait only when the next critical-path step depends on that branch.
10. Synthesize results by branch owner, validation status, and contact surface.

## Model Baseline

Use the current local agent surface as a tiered model policy:

- `gpt-5.4-mini`
  Use for read-only exploration, low-risk analysis, shortlist generation, and small bounded worker branches.
  Avoid for ambiguous debugging, large refactors, or branches where a wrong turn is expensive.

- `gpt-5.1-codex-mini`
  Use for tiny code-edit branches where Codex-oriented speed matters more than breadth.
  Avoid for cross-file synthesis, unstable branches, or anything likely to require recovery.

- `gpt-5.2-codex`
  Use as the default coding worker for normal implementation, medium edits, and branch-local validation.
  This is the baseline coding model when a branch is real work but not unusually hard.

- `gpt-5.3-codex`
  Use for harder coding branches that need more synthesis, ambiguity handling, or broader local reasoning than the default worker tier.
  Prefer this before escalating to max when the branch is still bounded.

- `gpt-5.1-codex-max`
  Use for the hardest debugging, shell-heavy multi-step work, or branches that stay cross-cutting after decomposition.
  Do not spend this on routine cleanup or cheap exploratory passes.

Keep the parent thread on its inherited default unless there is a concrete reason to override it.

## Reasoning Baseline

- `medium`
  Default for most branches.

- `high`
  Use when the branch is ambiguous, cross-file, or integration-heavy.

- `xhigh`
  Reserve for one hard blocker, one synthesis branch, or one branch that resists decomposition.

- `low`
  Use only for quick lookups or trivial passes where latency matters more than depth.

## Branch Shapes

### Single Bounded Write

Use one mini or default coding worker when:

- the write scope is isolated
- one owner can validate it locally
- integration risk is low

### Multiple Independent Branches

Use balanced mini workers when:

- branches are disjoint
- file ownership is clean
- one branch does not dominate the total work

Balance by expected file count, reasoning difficulty, and integration risk.

### Dependency-Ordered Branches

Use topological delegation when:

- one branch depends on upstream contracts
- the shared choke point is known
- downstream work should wait for upstream shape

Fix upstream contracts before downstream consumers.

### Resume Or Revisit

Reuse an existing agent or artifact when:

- the branch already has an owner
- prior validation exists
- restating the whole branch would waste context

Prefer `thread-memory-bridge`, `session-reload`, or branch artifacts before respawning fresh agents.

## Context Packet Baseline

Send every delegated agent the minimum set that lets it finish independently:

- branch objective
- exact file or module scope
- allowed write boundary
- branch owner
- validation target
- forbidden scope

Add only the extra context the branch actually needs:

- for exploratory branches:
  - task anchor
  - candidate surfaces
  - smallest safe next surface

- for bounded write branches:
  - exact files
  - invariant to preserve
  - local validation command

- for balanced parallel branches:
  - branch weight
  - exact file slice
  - branch-specific goal
  - branch-local test target

- for dependency-ordered branches:
  - upstream prerequisite
  - input and output contract
  - contact surfaces
  - choke points

- for resume-sensitive branches:
  - handoff artifact
  - validated commit or diff summary
  - last open risks
  - exact session or thread anchor

Avoid sending:

- repo-wide dumps
- unrelated history
- overlapping write scopes
- extra files "just in case"

## Spawn Pattern

Use a compact branch ledger before spawning:

```text
branch A | bounded write | model gpt-5.2-codex | effort medium | owner worker | validate pytest tests/foo.py
branch B | read-only explore | model gpt-5.4-mini | effort medium | owner explorer | validate none
branch C | hard blocker | model gpt-5.1-codex-max | effort high | owner worker | validate cargo test crate_x
```

For each branch, send:

```text
Objective:
Write scope:
Forbidden scope:
Validation:
Why this model:
Why this reasoning effort:
```

For a deterministic baseline, run the executor script on a JSON task set and then use the output as the branch ledger plus spawn packet source.
For launch-ready orchestration, use the launch scaffold. In plain Node it returns a dry-run launch bundle; in a Codex JS runtime it can execute the approved `spawn_agent` calls.

## Guardrails

- Do not delegate unless the user explicitly allows it.
- Do not spawn agents for urgent blockers that should stay local.
- Keep one active owner per branch.
- Preserve existing owners when branch continuity matters.
- Do not widen scope early just because more context exists.
- Do not wait by reflex.
- Close redundant agents promptly.

## Executor Input

The executor expects a JSON object with this shape:

```json
{
  "taskAnchor": "parser and cli stabilization",
  "delegationAllowed": true,
  "surfaceClear": true,
  "branches": [
    {
      "id": "A",
      "task": "fix bounded parser bug",
      "shape": "bounded_write",
      "taskKind": "implementation",
      "scope": ["src/parser.ts"],
      "forbiddenScope": ["test/parser.test.ts"],
      "validation": "pnpm test parser",
      "ambiguity": "medium",
      "risk": "medium",
      "crossCutting": false,
      "shellHeavy": false,
      "needsResume": false
    }
  ]
}
```

Use branch `shape` values:

- `exploratory`
- `bounded_write`
- `independent_parallel`
- `dependency_ordered`
- `resume_or_revisit`

Use branch `taskKind` values:

- `analysis`
- `implementation`
- `tests`
- `debugging`
- `refactor`

## Launch Layer

The launch scaffold uses a permissive policy by default:

- deny only when delegation is disabled or the branch task is missing
- defer exploratory branches that should still route through `exp` or `expand-skill`
- allow bounded worker branches even if they are slightly underspecified, while marking the reason in the permission layer

Use `strict` only when missing validation or missing explicit scope should defer execution instead of allowing a launch.

The launch bundle returns:

- top-level permission decision
- per-branch permission decision and reasons
- launch-ready `spawn_agent` request payloads
- telemetry aligned to `skill-router`'s permission model

### js_repl Helper

Use this in `js_repl` when you want the launch scaffold to actually execute approved branches through Codex:

```javascript
const {launchExecutionPlan} = await import("file:///C:/Users/jeanj/.codex/skills/subagent-coordinator/scripts/launch-execution-plan.mjs");

const input = {
  taskAnchor: "parser and cli stabilization",
  delegationAllowed: true,
  surfaceClear: true,
  branches: [
    {
      id: "A",
      task: "fix bounded parser bug",
      shape: "bounded_write",
      taskKind: "implementation",
      scope: ["src/parser.ts"],
      forbiddenScope: ["test/parser.test.ts", "src/cli.ts"],
      validation: "pnpm test parser",
      ambiguity: "medium",
      risk: "medium",
      crossCutting: false,
      shellHeavy: false,
      needsResume: false,
    },
  ],
};

const result = await launchExecutionPlan(input, {
  launchPolicy: "permissive",
  spawnAgent: (request) => codex.tool("spawn_agent", request),
});

console.log(JSON.stringify(result, null, 2));
```

Use `buildExecutionPlan` instead when you only want the dry-run plan and launch packets without executing them.

## Output Format

Report coordination in this shape:

- `Task Map:` branch id, task, owner, model, reasoning, validation
- `Context Packets:` what each branch received
- `Critical Path:` what stays local and what can run in parallel
- `Blockers:` unresolved dependencies or risky contact surfaces
- `Next Action:` the immediate branch or integration step
