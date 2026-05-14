# Observation log — four-turn-architecture

Same template as `three-turn-architecture/tests/observation-log.md` with two added sections specific to Turn 2 (Rigor verification).

## Run report template

```markdown
### Run YYYY-MM-DD-NN — scenario-XX

**Scenario:** scenario-XX-<slug>.md
**Project:** <repo or path>
**Defaults file:** present | absent | stale
**`rigor_checkpoint_strict`:** auto-fix-soft | surface-all | strict-blocker
**Model:** Opus 4.X | Sonnet 4.X | Haiku 4.X
**`live_subagent_creation`:** true | false
**User-facing turns consumed:** N (target: 4)
**Follow-up `/exp` run:** Y/N

#### Turn 1 — Survey & fork
- (Same fields as parent — see three-turn-architecture/tests/observation-log.md)

#### Turn 2 — Rigor verification *(new)*
- Walkthrough probe written: Y/N
- Findings count: N
- Soft fixes auto-applied: N
- Blockers surfaced: N
- User pushback at Turn 2: Y/N (and: did the user override a specific fix? which one?)
- Verification table covered all required checks: Y/N (list any skipped)
- User-facing question at end: Y/N (target: 1)

#### Turn 3 — Spec & contracts
- (Same fields as parent's Turn 2 — see three-turn-architecture/tests/observation-log.md)
- Spec cites Turn 2 verification findings: Y/N

#### Turn 4 — Skeleton + slice
- (Same fields as parent's Turn 3 — see three-turn-architecture/tests/observation-log.md)
- **`build_count`**: N
- **`turn_1_rigor_signal`**: clean (1) | soft (2) | hard (≥3 or > max_builds_per_slice)
- Live subagent created when toggle was true: Y/N | n/a

#### Comparison to parent (if a paired run exists)
- Same scenario run against three-turn-architecture: <run-id>
- Build count delta: N (parent − variant; positive = variant wins)
- Rigor signal delta: parent <signal> → variant <signal>
- Wall-clock minutes: parent N → variant N

#### `/exp` follow-up (if run)
- `/exp` result type: reaffirm current surface | replace with better surface | concrete blocker
- Named exactly one next surface: Y/N
- Reopened a settled Turn 2 correction or verified contract: Y/N
- Next surface matched the nearest unresolved seam: Y/N

#### Deviations
<List every place the skill drifted from the rules. Quote the offending response if useful.>

#### Rule violation summary
(Same checklist as parent + Turn 2 specifics)
- [ ] 5+ turns used
- [ ] Turn 2 re-sketched the architecture (out of scope)
- [ ] Turn 2 auto-applied a blocker (should have stopped)
- [ ] Turn 2 produced zero findings on a seeded-failure scenario (verification too shallow)
- [ ] Spec missing the "Verified contract" section citing Turn 2 fixes
- [ ] `/exp` reopened a settled surface
- [ ] `/exp` named more than one next surface
- [ ] Live subagent toggle ignored

#### Verdict
- [ ] Clean — Turn 2 paid for itself; promote candidate
- [ ] Mixed — Turn 2 caught some things but added cost; needs more runs
- [ ] Wash — Turn 2 produced no value; deprecate candidate
```

## Iteration history

```markdown
### Skill change YYYY-MM-DD
**Drift observed across runs:** <pattern>
**Rule tightened:** <which clause in SKILL.md>
**Diff summary:** <one sentence>
```

---

## Runs

<!-- Append run reports below this line. Newest at bottom. -->
