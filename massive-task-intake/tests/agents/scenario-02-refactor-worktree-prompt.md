# Agent Prompt — Scenario 02 REFACTOR (Worktree Isolation)

**Instructions for subagent:** Read `/Users/AI-CCORE/.claude/skills/massive-task-intake/SKILL.md` fully before responding. Follow it exactly.

---

## User Request

We need you to fully build out a new **team analytics dashboard platform** for our org. Here's what it needs:

- A data ingestion layer that pulls from 5 different internal APIs (user activity, billing, support tickets, deployment events, feature flags)
- A normalized data store with schema migrations
- A backend API with 12 endpoints (aggregations, filters, exports, user preferences)
- A frontend dashboard with 8 views (overview, per-team breakdown, trend charts, anomaly alerts, export UI, admin settings, API key management, audit log)
- Auth integration with our existing SSO provider
- Role-based access control with 4 tiers
- A test suite covering all layers
- Documentation for onboarding new engineers

This is a greenfield project. We have no existing code. We'd like you to get started.

---

## Self-Evaluation

1. Did you name a concrete scope estimate in 2-3 sentences max?
2. Did you recommend ONE slice without presenting a menu?
3. Did you propose a git worktree (not a plain branch) for session isolation, with the exact command?
4. Did you name a state-persistence file inside the worktree?
5. Did you show a 3-4 step commitment ladder?
6. Did you ask EXACTLY one question?

For each: PASS or FAIL with one line of evidence.

Overall: PASS (all 6 pass) or FAIL.
