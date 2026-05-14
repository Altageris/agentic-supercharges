# Observation log

Append a run report after every test scenario execution. The log drives iteration on the skill itself.

## Run report template

```markdown
### Run YYYY-MM-DD-NN - scenario-XX

**Scenario:** scenario-XX-<slug>.md
**Project:** <repo or path>
**Model:** Opus 4.X | Sonnet 4.X | Haiku 4.X
**`live_subagent_creation`:** true | false
**`/exp` loaded and config reloaded:** Y/N
**User-facing turns consumed before `/exp`:** N

#### Primary pass
- Sensitive paths removed: Y/N
- Domain terms genericized consistently: Y/N
- Credential providers redacted: Y/N
- Control flow preserved: Y/N
- Explanation stayed compact: Y/N
- Live subagent created when toggle was true: Y/N | n/a

#### `/exp` pass
- `/exp` result type: reaffirm current surface | replace with better surface | concrete blocker
- Reopened already-resolved edits: Y/N
- Named exactly one next surface: Y/N
- Next surface was genuinely unresolved: Y/N

#### Deviations
<List every place the skill drifted from the rules. Quote the offending response if useful.>

#### Rule violation summary
- [ ] Sensitive detail leaked
- [ ] Control flow redacted instead of preserved
- [ ] Placeholder naming drifted
- [ ] Explanation bloated into tutorial mode
- [ ] `/exp` reopened a settled surface
- [ ] `/exp` named more than one next surface
- [ ] Live subagent toggle ignored

#### Verdict
- [ ] Clean compression - no skill changes needed
- [ ] Soft drift - note for next iteration
- [ ] Hard drift - skill rule needs tightening before next run
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
