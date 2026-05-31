---
name: goal-pivot-ledger
description: Track and enforce major conversation goal changes by recording goal pivots, evaluating dependency state, and only launching redirected subagent work when prerequisite paths are satisfied or explicitly rerouted. Use when the user wants to drastically change the main goal of an active thread, preserve a ledger of goals, force work back onto blocked dependencies, or hand an accepted pivot into subagent-coordinator for launch.
---

# Goal Pivot Ledger

Use this skill when the task is not just a refinement of the current thread but a deliberate goal change. Treat the pivot as a transition with state, dependencies, and launch consequences, not as a casual topic switch.

Runtime scaffold:

- [`scripts/goal-ledger.mjs`](scripts/goal-ledger.mjs) stores normalized goal-pivot entries in a JSONL ledger.
- [`scripts/build-goal-pivot-plan.mjs`](scripts/build-goal-pivot-plan.mjs) decides whether the pivot should `allow`, `block`, `defer`, or `reroute`.
- [`scripts/launch-goal-pivot.mjs`](scripts/launch-goal-pivot.mjs) records the pivot and forwards accepted work into `subagent-coordinator`.

## Workflow

1. Confirm that the user is changing the thread's main goal, not asking for a small adjacent step.
2. Record the requested goal, prior goal, pivot reason, and dependency state.
3. Check hard prerequisites before widening:
   - If a required dependency is still open, block the pivot and force the thread back onto that dependency.
   - If the surface for the new goal is still unclear, defer instead of launching speculative branches.
4. If live downstream work would be invalidated, reroute rather than pretending the old branch plan is still correct.
5. Only hand the new work to `subagent-coordinator` after the pivot is accepted.

Use `skill-router` first if the value of a pivot is still unclear or if the traffic cost of extra skill passes needs to be measured before changing direction.

## Decision Order

Apply decisions in this order:

1. `block`
   Use when a hard dependency, blocker, or invariant is still open.
2. `reroute`
   Use when the new goal is acceptable but would invalidate active downstream branches or overlapping write scopes.
3. `defer`
   Use when the dependency relation or execution surface is still too unclear to launch safely.
4. `allow`
   Use when the new goal is clear enough and no open prerequisite should force the thread back on path.

## Dependency Model

Treat these dependency kinds as meaningful pivot gates:

- `prerequisite`
- `contract`
- `blocker`
- `external_wait`
- `owner_handoff`
- `validated_artifact`
- `invariant`
- `contact_surface`
- `resume_anchor`

Mark a dependency as hard when it should stop the pivot unless the user explicitly overrides it. Hard unresolved dependencies should force a `block`.

Useful dependency states:

- `unknown`
- `open`
- `blocked`
- `pending`
- `validated`
- `resolved`
- `satisfied`

Only `validated`, `resolved`, and `satisfied` count as closed.

## Ledger Model

Each pivot entry should preserve:

- prior goal
- requested goal
- active goal after the decision
- pivot reason
- dependency state
- hard constraints
- blockers
- resume anchor
- decision and reasons
- forwarded execution plan
- launch results

The ledger is append-only. A pivot should never silently rewrite the prior goal state.

Default ledger path:

- `C:\Users\jeanj\.codex\memories\skills\goal-pivot-ledger\GOAL_LEDGER.jsonl`

## Execution Contract

Accepted pivots forward a coordinator-compatible task set shaped like `subagent-coordinator` input:

```json
{
  "taskAnchor": "goal pivot enforcement baseline",
  "delegationAllowed": true,
  "surfaceClear": true,
  "branches": [
    {
      "id": "pivot-A",
      "task": "inspect the accepted pivot surface",
      "shape": "bounded_write",
      "taskKind": "analysis",
      "scope": [
        "C:/Users/jeanj/.codex/skills/goal-pivot-ledger"
      ],
      "forbiddenScope": [],
      "validation": "",
      "ambiguity": "low",
      "risk": "low",
      "crossCutting": false,
      "shellHeavy": false,
      "needsResume": false
    }
  ]
}
```

Use `build-goal-pivot-plan.mjs` when you only need the gate decision and coordinator payload. Use `launch-goal-pivot.mjs` when you want the gate decision, ledger append, and subagent launch path together.

## js_repl Helper

Use this in `js_repl` when you want the pivot wrapper to launch accepted work through the current coordinator tunnel:

```javascript
const {launchGoalPivot} = await import("file:///C:/Users/jeanj/.codex/skills/goal-pivot-ledger/scripts/launch-goal-pivot.mjs");

const input = {
  taskAnchor: "conversation orchestration scaffold",
  requestedGoal: "goal pivot enforcement baseline",
  pivotReason: "Switch the thread onto a dedicated goal-change control surface.",
  policyMode: "permissive",
  surfaceClear: true,
  dependsOn: [
    {
      kind: "validated_artifact",
      target: "goal-pivot-ledger scaffold",
      state: "satisfied",
      hard: true,
    },
  ],
  activeBranches: [],
  requestedExecution: {
    taskAnchor: "goal pivot enforcement baseline",
    delegationAllowed: true,
    surfaceClear: true,
    branches: [
      {
        id: "pivot-A",
        task: "inspect the accepted goal pivot surface and report missing runtime pieces",
        shape: "bounded_write",
        taskKind: "analysis",
        scope: ["C:/Users/jeanj/.codex/skills/goal-pivot-ledger"],
        forbiddenScope: [],
        validation: "",
        ambiguity: "low",
        risk: "low",
        crossCutting: false,
        shellHeavy: false,
        needsResume: false,
      },
    ],
  },
};

const result = await launchGoalPivot(input, {
  spawnAgent: (request) => codex.tool("spawn_agent", request),
});

console.log(JSON.stringify(result, null, 2));
```

## Output Format

Report pivots in this shape:

- `Pivot:` prior goal, requested goal, decision, reason
- `Dependencies:` open hard dependencies, blockers, resume anchors
- `Coordinator Plan:` forwarded branches, routed skills, launch policy
- `Launch:` branch ids, launch decisions, spawned agents if any
- `Next Action:` the immediate path the thread should follow
