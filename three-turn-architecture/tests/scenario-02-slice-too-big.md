# Scenario 02 — Slice too big → auto-degrade to skeleton-only

Tests the skill's discipline on slice scope. When the user's request implicitly bundles multiple slices or crosses multiple new boundaries, the skill must auto-degrade from B (skeleton + slice) to A (skeleton-only) silently — not by asking, not by burning a fourth turn.

## Setup

- Project with a monolithic module that owns both reading and writing of an entity, plus its analytics.
- `architecture-defaults.md` present with the slice-auto-degrade triggers section filled in (multi-boundary, mid-migration, missing fixtures, bundled slices).

## User prompt

> /three-turn-architecture extract Orders into its own service. Skeleton the read path AND the write path, and make sure analytics still get the events.

## Expected behavior per turn

### Turn 1

- Read the current Orders module — confirm the call sites for reads, writes, and the analytics emit.
- Constraint named: "monolith owns Orders end-to-end; extraction needs three cuts (read API, write API, analytics events) and the user is asking for two of them shipped at once."
- Two sketches:
  - **Option A**: extract Orders with a façade — both read and write go through one new HTTP boundary; analytics piggybacks on writes via an event emitted post-commit.
  - **Option B**: extract Orders with CQRS-style split — separate read service (replica-backed) and write service (authoritative); analytics consumes a write-event stream.
- Each sketch with typed interfaces, sequence (happy + failure), failure-mode table, perf envelope.
- Recommend A for fewer boundaries; B if defaults allow event-sourcing and the team has the appetite.
- Ask: "A, B, or push back?"

**Expected user reply:** "A"

### Turn 2

- Apply defaults silently.
- Slice scope decision: the user's request bundles **two slices** (read AND write) → **auto-degrade to A (skeleton-only)**.
- Write the spec: full skeleton for both read and write boundaries + analytics event topic, migration plan with parallel-run window and rollback, but slice plan lists:
  - Ticket #1: vertical slice for the **write** path (the higher-risk one)
  - Ticket #2: vertical slice for the **read** path
  - Ticket #3: analytics consumer end-to-end
- Park additional sub-decisions (cache TTL on the read replica, idempotency key format, exact metric names, alert thresholds).
- Ask: "Ship skeleton-only with these tickets, or one tweak?"

**Expected user reply:** "Ship"

### Turn 3

- Implement the skeleton: typed interfaces for read API, write API, analytics event; migration scripts (registering the new service boundaries, no destructive changes); feature flags for both cutovers; metric/alert registration.
- Run type check, contract tests at every new boundary (stubs returning typed defaults), build, smoke against the stubs.
- Report: files touched, interface signatures, "shipped skeleton; slice degraded to tickets #1–#3 because the user's request bundled two slices."

## Signals of compression failure

- Skill ships a slice anyway (tries to implement write end-to-end) — that's the auto-degrade case being violated.
- Skill asks the user "should I ship read first, write first, or both?" — should auto-pick and degrade.
- Skill burns a fourth turn explaining why it's degrading — degrade is silent in Turn 2 and reported in Turn 3.
- Skill ships migrations without rollbacks (bigger refactor, easier to skip rollback under pressure).

## Variant prompts to try

- "Just the read path." (Single slice — should NOT degrade; ship the read slice end-to-end in Turn 3.)
- "Extract Orders and Payments." (Two extractions — far too big for one arc; skill should push back in Turn 1 and propose splitting into two skill invocations.)
