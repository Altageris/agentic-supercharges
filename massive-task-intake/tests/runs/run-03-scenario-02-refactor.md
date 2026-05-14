# Run 2026-05-14-03 — scenario-02 REFACTOR (Worktree Isolation)

**Scenario:** scenario-02-refactor-worktree
**Phase:** REFACTOR (worktree isolation patch)
**Model:** Sonnet 4.6
**User-facing turns consumed:** 1

#### What was patched

- Added step 3: worktree-based session isolation with exact `git worktree add` command
- Added greenfield path: `git init` + then worktree
- Added shadow-copy fallback for no-git environments
- Forbidden behaviors extended: plain branch, `git checkout -b` without worktree
- Rationalization table extended: "I'll just branch off main", "Worktrees are overkill"
- Format block updated to include Session worktree command

#### Agent Response Summary

- Scope: "6-10 weeks, 15-20 sessions minimum" (2 sentences)
- Slice: user-activity ingester + schema + first migration (one recommendation)
- Worktree: `git worktree add ../team-analytics-session-1 -b session/ingestion-schema` + removal command shown
- State: `tasks/project-state.md` inside the worktree, committed with slice
- Ladder: 4 steps + "Beyond: TBD"
- Question: Python vs TypeScript (exactly 1)

#### Agent Raw Self-Evaluation

```
1. PASS — 2 sentences, concrete week/session count.
2. PASS — Single recommendation, no menu.
3. PASS — Exact git worktree add command, not a plain branch.
4. PASS — tasks/project-state.md inside the worktree.
5. PASS — 4-step ladder.
6. PASS — Exactly one question.
Overall: PASS
```

#### Skill Change Needed

N — worktree isolation holds cleanly.
