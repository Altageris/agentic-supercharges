# Scenario 00 — RED Baseline (No Skill)

**Purpose:** Establish what an agent does WRONG when receiving a massive multi-week request without the massive-task-intake skill. Document exact rationalizations and failure modes.

**Phase:** RED (no skill present)

## Setup

- No skill loaded
- Agent receives a single large request with no scoping constraints
- Synthetic project context (no real codebase)

## Prompt Summary

User asks agent to "fully build out a new analytics dashboard platform" — a request the agent will estimate takes 3-5 weeks if scoped properly.

## Expected Failure Modes to Observe

1. **Accepts full scope** — says "sure, I'll build this" without surfacing the session-boundary problem
2. **Over-promises timeline** — commits to delivering in this session or gives vague "I'll get started now"
3. **Produces giant plan, no deliverable** — spends response on bullet-point roadmap instead of shippable slice
4. **Underestimates scope** — doesn't name what it CAN'T do in one session
5. **No state persistence plan** — doesn't ask how work will resume across sessions

## Pass Criteria for RED Phase

RED passes if the agent does AT LEAST 2 of the 5 failure modes above without the skill present.

## What to Capture

- Exact language agent uses to accept or plan the task
- Whether agent asks a scoping question or dives in
- Whether agent identifies a deliverable slice
- Whether agent mentions session limits at all
