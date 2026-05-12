# Scenario 01 — Sync chain → async via a queue

The canonical case. A request path calls three downstream services synchronously; the user wants to cut p99 by moving the non-critical legs off the request path.

## Setup

- Project with a route handler that does, in order: validate input → call service A (write) → call service B (notify) → call service C (analytics) → return.
- Service B and C are not load-bearing on the response — they exist for side-effects.
- `architecture-defaults.md` present, with defaults like:
  - Async transport allowed: in-proc queue OR message bus
  - Default retries: 3, exponential backoff
  - Idempotency: required on cross-boundary writes
  - Observability: one latency metric + one error metric per new boundary
  - Migration cadence: parallel-run window before flag flip

## User prompt

> /three-turn-architecture POST /checkout calls service A, B, and C in series and p99 is 1.8s. A is the only one that has to be in the request path. Skeleton it.

## Expected behavior per turn

### Turn 1

The skill should:
- Read the actual route handler to confirm the sync chain (no assumption-based sketching).
- Diagnose the constraint in one sentence: "p99 is dominated by serial blocking; B and C are eligible for off-path."
- Show **two** sketches:
  - **Option A**: in-proc queue (channel / job runner) consuming B and C events after the handler returns.
  - **Option B**: external message bus (the project's already-existing bus, named from defaults) producing B and C events.
- Each sketch shows:
  - Typed interfaces (event payload, handler signature)
  - Sequence diagram with happy + failure path
  - Failure-mode table (timeout, retry curve, idempotency, dead-letter)
  - Perf envelope (new p99 estimate, throughput, memory)
- Recommend based on the defaults' transport-allowed list and existing bus presence.
- Ask: "A, B, or push back?"

**Expected user reply:** "A" (or whichever the skill recommended)

### Turn 2

The skill should:
- Apply preference defaults silently (retries=3 expo, idempotency=required, metrics named per convention).
- Decide slice scope: one new boundary (handler → queue) — fits, so plan B (skeleton + slice).
- Write the consolidated spec to `docs/architecture/specs/YYYY-MM-DD-checkout-async-arch.md`:
  - Components, typed interfaces, sequence, failure-mode table, perf envelope
  - Migration plan: feature flag name, parallel-run window, rollback path
  - Slice plan: implement the B event end-to-end (producer + handler + smoke test); leave C as ticket #2
- Park 5–10 sub-decisions (exact retry-curve constants, queue retention, alert thresholds, dashboard panel names, log field name for correlation id, dead-letter destination details, etc.)
- Ask: "Ship slice, ship skeleton-only, or one tweak?"

**Expected user reply:** "Ship slice"

### Turn 3

- Implement the skeleton: event types, producer interface, handler stub for B and C, migration registering the queue/topic, feature flag.
- Implement the slice for B end-to-end.
- Run type check, run contract test at the new boundary, run build, run smoke test that produces+consumes one B event under the flag.
- Restart the service.
- Report: files touched, interface signatures landed, slice status (B passing), parked tickets numbered.

## Signals of compression failure

- Skill asks "in-proc queue or bus?" before sketching (that's the fork; it must show both).
- Skill asks about timeout / retry / idempotency values (those are in defaults).
- Skill writes the migration without a rollback section.
- Skill ships C in the same slice as B (slice too big — should have left C as ticket #2).
- Skill asks permission to restart the service.

## Variant prompts to try

- "Move all three off the request path." (Slice now crosses A's persistence boundary too — should auto-degrade to A.)
- "Don't add a new bus, use what we have." (Constraint injected mid-prompt — should constrain Turn 1 to only Option B.)
