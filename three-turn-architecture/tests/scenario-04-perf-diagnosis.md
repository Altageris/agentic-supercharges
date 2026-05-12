# Scenario 04 — Performance constraint, grounded in measurement

Tests the skill's discipline on **constraint diagnosis**. When the user says "perf is bad", the skill must ground the perf envelope in actual measurement (or a measurement plan) — not a hand-waved estimate.

## Setup

- Project with a slow endpoint and at least some observability (logs, metrics, or even just a benchmark script).
- `architecture-defaults.md` present with latency budgets (p50, p99) and the "load test required for perf-sensitive paths" rule.

## User prompt

> /three-turn-architecture our search endpoint p99 is too high. I think it's the query fanout. Skeleton a fix.

## Expected behavior per turn

### Turn 1

The skill should:
- Read the search endpoint code. Confirm the fanout pattern (or refute it).
- **Ground the constraint in evidence** before sketching:
  - If metrics exist: pull current p50/p99 from the metric source.
  - If not: name the gap and propose a one-line measurement step as part of the sketch (not a 4th turn).
- Constraint sentence: "p99 is bounded by fanout latency × number of shards; current p99 = X ms, budget from defaults = Y ms; gap = X − Y ms."
- Two sketches:
  - **Option A**: scatter-gather with bounded concurrency + per-shard timeout < global timeout / 2 (defaults the per-shard timeout from invariants).
  - **Option B**: precomputed materialized index updated async on write, with the search endpoint reading from a single source (eliminates fanout entirely; introduces a write-path side effect).
- Each sketch shows: typed interfaces, sequence (happy + slow-shard failure), failure-mode table, perf envelope **with a math sketch** (not "this will be faster" — actual numbers from defaults' budgets).
- Recommend based on which sketch's envelope clears the budget with margin.
- Ask: "A, B, or push back?"

**Expected user reply:** "A"

### Turn 2

- Apply defaults (per-shard timeout, concurrency cap, retry policy).
- Decide slice scope: refactoring the existing endpoint with bounded fanout = one boundary, plan B (skeleton + slice).
- Write the spec with:
  - Perf envelope: predicted p50/p99 after the change + the measurement step that confirms it
  - Migration: feature flag for the new fanout path, parallel-run window (run both, compare p99), rollback path
  - Slice plan: implement the bounded-fanout search end-to-end behind the flag
- Park: shard-warmup, cache layer between fanout and shards, alert thresholds, dashboard panel, exact concurrency tuning value.
- Ask: "Ship slice, ship skeleton-only, or one tweak?"

**Expected user reply:** "Ship slice"

### Turn 3

- Implement the new fanout logic behind the flag, with the typed interface, the per-shard timeout, the bounded concurrency, the retry-on-slow-shard fallback, and the metric/log emissions per defaults.
- Run type check, contract test at the fanout boundary, build, smoke test that exercises the new path under the flag, and a **load test** (or a benchmark script run) per defaults' "perf-sensitive paths" rule — capture the new p99 in the report.
- Restart the service.
- Report: files touched, interfaces, new p99 from the load test, parked tickets.

## Signals of compression failure

- Skill sketches without grounding in current p99 — accepts the user's hypothesis ("I think it's the fanout") without verification.
- Skill skips the load test in Turn 3 because "smoke is enough" — defaults require it for perf-sensitive paths.
- Skill burns Turn 1 asking "do you have current p99 numbers?" — should pull them itself or include the measurement step in the sketch.
- Skill predicts "faster" without numbers — perf envelope must be quantified.

## Variant prompts to try

- "p99 is high, not sure why." (Diagnosis missing — skill should propose Option A = "instrument and measure", Option B = "best-guess optimization with rollback" and recommend A. This is borderline-exploratory; if the skill routes to systematic-debugging instead, that's acceptable.)
- "Make it faster, no measurement, just skeleton it." (User explicitly opts out of measurement — skill should warn that the perf envelope is then a guess and proceed only with the warning logged in the spec.)
