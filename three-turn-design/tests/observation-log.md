# Observation log

Append a run report after every test scenario execution. The log drives iteration on the skill itself — repeated drifts point to rules that need tightening.

## Run report template

Copy this block per run. Fill in honestly. The skill improves from honest deviations, not from passing scenarios.

```markdown
### Run YYYY-MM-DD-NN — scenario-XX

**Scenario:** scenario-XX-<slug>.md
**Project:** <repo or path>
**Preferences file:** present | absent | stale
**Model:** Opus 4.X | Sonnet 4.X | Haiku 4.X
**User-facing turns consumed:** N (target: 3)

#### Turn 1
- Diagnosis surfaced: <one-line>
- Mockup count: N (target: 2)
- Mockup scale: target | thumbnail | other
- Recommendation given: Y/N
- Hidden questions surfaced (palette / scope / composition / animation): list
- User-facing questions: N (target: 1)

#### Turn 2
- Consolidated mockup at target scale: Y/N
- Spec written to: <path>
- Parked items count: N
- User-facing questions: N (target: 1)
- Sub-decisions re-surfaced as questions: list

#### Turn 3
- Files touched: N
- Build run: Y/N
- Server restarted: Y/N
- Permission asked for any lifecycle action: Y/N
- Grace notes applied (if requested): Y/N
- Parked items re-surfaced: list

#### Deviations
<List every place the skill drifted from the rules. Be specific — quote the offending response if useful.>

#### Rule violation summary
- [ ] 4+ turns used
- [ ] 3+ visual options shown
- [ ] Permission asked for build/restart
- [ ] Re-questioned settled decision
- [ ] Preference rule treated as consultative
- [ ] Tangent surfaced instead of parked
- [ ] Grace-note triggered Turn 4

#### Verdict
- [ ] Clean compression — no skill changes needed
- [ ] Soft drift — note for next iteration
- [ ] Hard drift — skill rule needs tightening before next run
```

## Iteration history

Append a section here each time the skill itself is modified based on observed drifts. Keep it brief — date, what changed, why.

```markdown
### Skill change YYYY-MM-DD
**Drift observed across runs:** <pattern>
**Rule tightened:** <which clause in SKILL.md>
**Diff summary:** <one sentence>
```

---

## Runs

<!-- Append run reports below this line. Newest at bottom. -->
