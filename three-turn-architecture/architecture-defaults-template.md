# Architecture defaults — template

Copy this to `~/.claude/architecture-defaults.md` (or `<project>/.claude/architecture-defaults.md` for per-project overrides) and fill in your invariants. The three-turn-architecture skill reads this on entry and treats every entry as **binding**, not consultative.

Per-project files override the home file when both exist.

---

## Boundary policy

> What defines a cut. The skill won't ask again.

- A boundary is: `package` | `module` | `process` | `service` — pick one: `_______`
- Cross-boundary calls go via: `function call` | `in-proc queue` | `HTTP` | `gRPC` | `message bus` — list allowed: `_______`
- Forbidden: shared databases across boundaries, shared mutable global state, sync chains > N hops — pick N: `_______`

## Data ownership

> Persistence rules. The skill enforces these silently.

- Each boundary owns its own persistence — no other boundary reads/writes its tables directly.
- Cross-boundary reads go through: `API call` | `read replica` | `event projection` — pick: `_______`
- Eventual consistency is acceptable across boundaries: `yes` | `no` — pick: `_______`
- Shared schemas are versioned and additive-only: `yes` | `no` — pick: `_______`

## Failure-mode discipline

> Every cross-boundary call carries these. The skill writes them in; doesn't ask.

- Default timeout: `_______ ms` (override per call only with a comment explaining why)
- Default retries: count `_______`, backoff `linear | exponential | jitter` — pick: `_______`
- Idempotency: every write across a boundary carries an idempotency key — `required` | `recommended` — pick: `_______`
- Dead-letter destination for unrecoverable failures: `_______`
- Circuit-breaker threshold: `_______ %` error rate over `_______ s` window
- Behavior on partial failure: `fail-fast` | `degrade-gracefully` — pick per tier: `_______`

## Performance envelope

> Hard budgets the skill respects when sizing slices.

- Request path latency p50: `_______ ms`, p99: `_______ ms`
- Background path latency: best-effort or named SLO: `_______`
- Memory ceiling per component: `_______ MB`
- Throughput target (peak): `_______ req/s` or `_______ msg/s`
- Allowed in request path: `disk I/O` Y/N, `network fanout` Y/N, `unbounded loop` Y/N

## Observability budget

> Every new boundary the skill adds emits these. No exceptions.

- [ ] At least one latency metric (histogram) per boundary
- [ ] At least one error/rate metric per boundary
- [ ] One structured log line per request (correlation id + outcome)
- [ ] Trace span at every cross-boundary call
- Metric naming convention: `_______` (e.g., `<svc>_<verb>_<resource>_latency_seconds`)
- Log fields required: `_______` (e.g., `request_id`, `actor`, `outcome`)

## Versioning policy

> Contract evolution rules.

- Default policy: `additive-only` | `semver` | `versioned URL/header` — pick: `_______`
- Breaking changes require: `parallel-run window` | `consumer migration ack` | `feature flag` — pick: `_______`
- Deprecation window minimum: `_______ days`

## Migration cadence

> What ships with every refactor.

- [ ] Parallel-run window before cutover — minimum: `_______ days/hours`
- [ ] Feature flag for the cutover — naming: `_______`
- [ ] Rollback path documented in the same PR as the migration
- [ ] No irreversible writes (DROP, destructive ALTER) in the cutover PR — those are isolated PRs with their own rollback
- [ ] Backfill scripts are idempotent and resumable

## Testing discipline

> The skill must do these silently, not ask permission.

- [ ] Contract test at every new boundary (consumer + producer). A contract test exercises the actual boundary logic (producer triggers → consumer fires in expected order with expected payload), NOT a liveness curl on the served URL.
- [ ] Smoke test for the first vertical slice (separate from the contract test — answers "does it respond at all" rather than "is the boundary correct").
- [ ] Load test (or budget estimate) when perf envelope is non-trivial
- [ ] Chaos test (timeout / dropped connection) when failure-mode discipline says so

## Build-count discipline

> Build count in Turn 3 is a leading indicator of Turn 1 rigor — clean typed interfaces in Turn 1 build clean in Turn 3.

- **`max_builds_per_slice`**: `_______` (default: 2)
- Soft drift threshold: 2 builds (log + continue).
- Hard drift threshold: > `max_builds_per_slice` (stop, surface one-line diagnosis of which Turn 1 interface was wrong vs which was an implementation mistake, wait for user instruction).
- When a build > 1 happens, the Turn 3 report MUST note (a) what broke and (b) whether it matched the Turn 1 typed interface (Y = implementation mistake; N = Turn 1 rigor failure).

## State-mutation policy

> What the skill is allowed to write to.

- ALLOWED: API routes (POST/PATCH/DELETE) via curl or fetch with admin auth
- ALLOWED: migration scripts run via the project's migration runner
- FORBIDDEN: direct SQL on app databases outside of migrations (e.g. `sqlite3 app.db UPDATE …`)
- FORBIDDEN: editing application state via file system writes outside the app's API

## Forbidden patterns

> The skill must never propose:

- [ ] Shared databases across services
- [ ] Sync chains > N hops (N from boundary policy above)
- [ ] Hot loops in the request path
- [ ] Irreversible writes alongside schema changes in the same PR
- [ ] Cross-boundary calls without timeout + retry policy
- [ ] New boundaries without contract tests
- [ ] Migrations without rollback
- [ ] Observability gaps at new boundaries

## Slice auto-degrade triggers

> The skill silently degrades from skeleton+slice (B) to skeleton-only (A) when:

- [ ] The slice would cross more than one new boundary
- [ ] The slice depends on a migration mid-parallel-run
- [ ] The slice needs fixtures or seed data that don't exist
- [ ] The user's request bundles two slices ("the read AND the write path")

When degrading, the slice becomes ticket #1 in the spec with the trigger noted.

## Project glossary (optional)

> Domain terms the skill should use when speaking your language.

| Skill term | Your term |
|---|---|
| boundary / cut | _______ |
| slice / vertical thread | _______ |
| migration / cutover | _______ |
| consumer / producer | _______ |

## Tangent policy

When mid-session a bug or behavior issue surfaces that is NOT the topic:

- [ ] Park to a one-paragraph note under `docs/architecture/specs/YYYY-MM-DD-<topic>-note.md`
- [ ] Return the path in the response
- [ ] Do NOT derail the current 3-turn arc

---

## Last updated

> Update this line whenever you change defaults so the skill can detect staleness.

`updated: YYYY-MM-DD`
