---
name: massive-task-intake
description: Use when a user submits a request the agent estimates will take more than one session (days, weeks, months of work) — any scope that cannot be fully delivered in a single ~2-4 hour session
---

# Massive Task Intake

## Overview

When a request exceeds one session's worth of work, never accept full scope, never ask the user to pick from a menu, and never produce a roadmap without a shippable slice. Instead: recommend one slice, propose state persistence, show the commitment ladder, ask one question.

## Trigger

Any request where your honest estimate of total effort exceeds ~4 hours (one session).

Red flags that trigger this skill:
- "Build out the entire X platform"
- "Implement all Y features"
- "Migrate the whole codebase"
- "Set up everything from scratch"
- Any multi-week or multi-sprint framing

## The Protocol (follow in order)

### 1. Surface the scope honestly (2-3 sentences max)

Name the real effort. Be concrete: "This is roughly N weeks of engineering work." Do NOT pad this with reassurance or apology. Do NOT dive into code.

### 2. Recommend one deliverable slice (do not ask the user to pick)

Pick the slice that:
- Can be completed and tested in this session (~2-4 hours)
- Unblocks the most downstream work
- Produces something runnable, not a skeleton

State it as a recommendation: "I recommend starting with X because it unblocks Y." The user can redirect; do not ask them to choose from a list.

### 3. Isolate the session with a worktree (not a plain branch)

Each session's slice gets its own git worktree — a separate directory that holds a short-lived branch. Main stays untouched and no other work can collide with the session branch mid-build.

**If the repo already exists:**
```bash
git worktree add ../project-session-1 -b session/slice-name
# work happens in ../project-session-1
# when the slice is reviewed and merged:
git worktree remove ../project-session-1
git branch -d session/slice-name
```

**If this is a greenfield project (no repo yet):**
```bash
git init project-name && cd project-name
# then proceed with worktree per session above
```

**If git is unavailable (rare):** fall back to a shadow copy:
```bash
cp -r project/ project-session-1/
# track state manually in project-session-1/tasks/project-state.md
```

Name the worktree path and branch name explicitly before starting any code. Never create a long-lived feature branch — worktrees are removed after each slice merges.

### 4. Name a state-persistence mechanism

Before any code exists, name how work will survive session boundaries. One of:
- A `CLAUDE.md` entry in the project root with current state + next step
- A `tasks/project-state.md` file listing completed work + exact next step
- A memory file at `.claude/memory/project-state.md`

The state file lives in the worktree directory and is committed with the slice — so any future session can read it without conversation context.

Propose one concretely. Ask the user to confirm the repo/directory first if unknown.

### 5. Show the commitment ladder (3-4 steps max)

Compact sequence of sessions with one deliverable per step:

```
Session 1: [specific deliverable] → runnable, testable
Session 2: [specific deliverable] → unblocks [X]
Session 3: [specific deliverable] → unblocks [Y]
```

No more than 4 steps. Anything beyond is too far to plan — name it as "TBD after session 3" rather than fabricating a schedule.

### 6. Ask exactly one question

The one question that unblocks session 1. Typically the tech-stack or target-directory fork. Do NOT ask about sessions 2-N. Do NOT ask for permission to start. Just ask the one blocking question.

## Forbidden Behaviors

- Starting code without knowing the answer to the blocking question
- Asking more than 1 question
- Presenting a menu of slice options and asking the user to pick
- Producing a giant bullet-point roadmap as the main deliverable
- Accepting full scope without naming session limits
- Saying "I'll get started" and listing everything you'll do
- Skipping state-persistence — if the session ends with no state artifact, the work is lost
- Creating a long-lived feature branch instead of a worktree — long branches accumulate conflicts across sessions
- Suggesting `git checkout -b` without `git worktree add` — checkout switches the main working tree, blocking other work

## Common Rationalizations — STOP

| Rationalization | Why it fails |
|---|---|
| "I'll just stub everything out" | Stubs with no persistence are orphaned when context ends |
| "The user seems to know what they want" | They want it done — scope is still your job to bound |
| "I'll ask a few clarifying questions first" | One question. Not a few. |
| "A roadmap helps us align" | A roadmap without a shippable slice is a deliverable-free session |
| "I can do more than one slice if I'm fast" | Commit to one. Deliver it. Then advance the ladder. |
| "I'll just branch off main" | A plain branch on main accumulates conflicts from other work mid-session. Use a worktree. |
| "Worktrees are overkill for a small slice" | Even a small slice changes files main depends on. Worktrees prevent silent collisions. |

## Format

```
**Scope:** [honest 2-sentence estimate]

**Recommendation for session 1:** [one slice, one rationale sentence]

**Session worktree:**
```bash
git worktree add ../project-session-1 -b session/[slice-name]
```

**State persistence:** [specific mechanism — file path inside the worktree]

**Commitment ladder:**
- Session 1: [deliverable]
- Session 2: [deliverable]
- Session 3: [deliverable]
- Beyond: TBD after session 3 review

**One question:** [the single blocking question]
```
