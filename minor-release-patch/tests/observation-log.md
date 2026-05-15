# Observation log

Append a run report after every test scenario execution. Honest deviations drive iteration — a passing log with papered-over failures teaches nothing.

Each run lives in its own file under `runs/`. Add a one-line entry to the index below when a run completes.

## Run report template

```markdown
### Run YYYY-MM-DD-NN — scenario-XX

**Scenario:** scenario-XX-<slug>.md
**Project:** <repo or path>
**Defaults files present:** design | architecture | performance | none
**Model:** Opus 4.X | Sonnet 4.X | Haiku 4.X
**User-facing turns consumed:** N (target: 3 for multi-track, 1 for single-track delegation)

#### Triage (silent, before Turn 1)
- Tracks identified: arch | design | perf
- Tracks parked (with reason): <list or none>
- Minor scope gate applied: Y/N — if Y, which track and why
- Dependency order stated: arch → design → perf (or deviation noted)
- Deviation from dependency order: Y/N — if Y, what order was used and what rationale

#### Turn 1
- Triage report shown: Y/N
- Execution order stated with rationale: Y/N
- Cross-track dependency risk named: Y/N | n/a
- Per-track artifacts rendered separately (not merged): Y/N
- User-facing questions: N (target: 1)

#### Turn 2
- Unified spec written to: <path>
- Estimated scope per track stated: Y/N
- Commitment ladder shown: Y/N
- User-facing questions: N (target: 1)

#### Turn 3
- Tracks executed in declared dependency order: Y/N
- Each track completed before next started: Y/N
- Build count per track: <arch N | design N | perf N>
- Perf before/after delta reported: Y/N | n/a
- Hard-stop fired (arch build_count ≥ 3 or perf escape): Y/N
- Parked tickets listed at end: Y/N
- Scope additions outside declared tracks: Y/N (should be N)

#### Overall
- Skill deviation type: none | easy-first-ordering | merged-artifacts | extra-question | scope-creep | park-failure | escalation-missed
- Skill change needed: Y/N
- If Y, change description: <one line>
```

---

## Run index

| Run | Scenario | Result | File |
|-----|----------|--------|------|
| 2026-05-14-01 | scenario-00-easy-first-ordering | PASS | [run-01-scenario-00.md](runs/run-01-scenario-00.md) |
| 2026-05-14-02 | scenario-01-single-domain-routing | PASS | [run-02-scenario-01.md](runs/run-02-scenario-01.md) |
| 2026-05-14-03 | scenario-02-minor-scope-gate | PASS | [run-03-scenario-02.md](runs/run-03-scenario-02.md) |
| 2026-05-14-04 | scenario-03-perf-escalates-to-arch | PASS | [run-04-scenario-03.md](runs/run-04-scenario-03.md) |
| 2026-05-14-05 | scenario-04-dependency-order-enforced | PASS | [run-05-scenario-04.md](runs/run-05-scenario-04.md) |
| 2026-05-15-06 | scenario-05-missing-design-defaults | PASS | [run-06-scenario-05.md](runs/run-06-scenario-05.md) |
