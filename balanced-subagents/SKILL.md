---
name: balanced-subagents
description: Spread delegated work evenly across subagents while keeping branches comparable in size and independence. Use when subagent work is explicitly allowed and the task has multiple parallelizable branches that should be balanced so one agent does not become a bottleneck. Default to mini subagents unless the user specifies otherwise or one branch clearly needs a stronger model.
---

# Balanced Subagents

## Overview

Use this skill when the main challenge is not only dependency order but workload shape. Partition work into branches of similar size, complexity, and urgency so parallel effort stays productive instead of leaving one overloaded branch and several idle agents.

## Workflow

### 1. Estimate Branch Weight Before Delegating

- Split the task into branches that are independent enough to run in parallel.
- Estimate each branch by:
  - expected file count
  - expected reasoning complexity
  - expected integration risk
  - critical-path urgency

Use a compact ledger such as:

```text
branch A: medium files, medium reasoning, low integration
branch B: medium files, medium reasoning, low integration
branch C: small files, high reasoning, medium integration
```

### 2. Balance Before Spawning

- Prefer 2-4 branches of comparable weight over one giant branch plus many trivial ones.
- Split oversized branches before delegating them.
- Merge undersized branches when they naturally belong together.
- Keep one clear owner per branch.

### 3. Default To Mini Agents

- Spawn mini subagents by default.
- Use a stronger model only when a branch is unusually synthesis-heavy, cross-cutting, or hard to decompose further.
- If an existing mini agent already owns the branch, preserve and resume it.

### 3.5. Send Targeted Context, Not Full History

- Treat `fork_context=true` as an exception path, not a normal option.
- Do not default to `fork_context=true` or other full-thread context cloning.
- Start each branch from a narrow local packet built around the exact file, seam, or symbol that owns the branch.
- Treat subagent exploration like a small BFS:
  - begin from one concrete anchor file or function
  - allow a small adjacent search surface
  - expand only when the next hop is justified by the current branch
- Pass only the minimum context needed to start productively:
  - branch goal
  - owned files or starting files
  - expected output format
  - nearby search hints when useful
- Use broad thread history only when the branch genuinely depends on prior thread-only decisions that cannot be restated compactly.
- Before using `fork_context=true`, ask whether the needed context could be rewritten as a short branch packet instead.
- If the context packet starts getting large, compress it before spawning instead of falling back to a full-history fork.

### 4. Rebalance During Execution

- Reassess when one branch becomes clearly heavier than the others.
- If a branch expands, split it by contact surface or file slice.
- If a branch collapses quickly, reuse that agent on the next independent branch instead of spawning a new one.
- Keep the branch map current when ownership changes.
- Prefer keeping agents running while you report progress; do not stop them just to provide an update unless the user explicitly asks or the branch is clearly off track.

### 5. Synthesize By Weight And Contact

- Integrate the heaviest or most central branch first.
- Use lighter branches to confirm or constrain the shared design.
- Report where work was evenly distributed and where the graph resisted balancing.

### 6. Capture Agent Feedback

- When a delegated branch completes, ask for a compact feedback block before closing the loop.
- Prefer 3-6 bullets covering:
  - tools or capabilities that would have helped
  - prompt/context shapes that made the branch easier
  - friction or missing context that slowed the branch down
- Feed that signal into the next branch plan instead of treating it as retrospective noise.

### 7. Let Validated Branches Commit

- If a delegated write branch is validated, prefer letting that branch owner make the commit.
- Keep commit ownership aligned with branch ownership when the write scope stayed clean and disjoint.
- Pull commits back into the main line only when integration requires it or when validation is still mixed.

## Heuristics

- Good balance:
  - each agent can finish with one coherent result
  - no branch dominates the total elapsed time
  - integration depends on a few clear contact surfaces

- Bad balance:
  - one branch owns most of the critical state
  - multiple branches touch the same files
  - several agents wait on the same unresolved upstream fact

## Guardrails

- Do not spawn subagents unless delegation is explicitly allowed.
- Do not force equal size when the graph is naturally lopsided; rebalance only within the constraints of correctness.
- Keep urgent blocking work local when delegation would stall the next step.
- Close redundant or replacement agents promptly.
- Do not send full conversation history by habit; make narrow context packets the default.
- When the user asks for updates mid-run, report current branch status without interrupting agents unless interruption is necessary.

## Default Model Policy

- New subagents: mini by default.
- Existing matching mini subagents: preserve and resume.
- Stronger model: use only when the branch truly requires more synthesis than a mini agent should handle.
