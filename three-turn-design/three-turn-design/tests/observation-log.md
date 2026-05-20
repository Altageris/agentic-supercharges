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

### Run 2026-05-14-01 — post-patch validation (dashboard fixture)

**Scenario:** synthetic — roster card density + hierarchy complaint
**Project:** `/Users/AI-CCORE/.claude/skills/minor-release-patch/tests/fixtures/dashboard-project/`
**Preferences file:** present (created for test: `design-defaults.md`)
**Model:** Sonnet 4.6
**User-facing turns consumed:** 3 (target: 3)

**Patches under test (applied this session before run):**
- Turn 1 committed decision replacing "A, B, or push back?" question
- Push back definition added (valid vs. invalid signals)
- Mockup count changed from hard-2 to judgment-based 2–4
- Implement-all option added for additive options
- Turn 2 "Ship as-is, or one tweak?" replaced with committed default-to-ship

#### Turn 1
- Diagnosis surfaced: card padding (48px 40px) and margin-bottom (32px) violate design-defaults ceiling; team label span missing from JS template entirely
- Mockup count: 2 (correct — one clean fork: muted label vs. pill accent)
- Mockup scale: ASCII at realistic card width ✓
- Recommendation given: Y — Mockup A, one-line rationale tied to design-defaults
- Hidden questions surfaced: none ✓
- Committed close: "Proceeding with Mockup A — push back if you want a different direction." ✓
- User-facing questions: 0 (target: 0 after patch) ✓

#### Turn 2
- Consolidated mockup at target scale: Y — one mockup with all values annotated ✓
- Spec written to: `docs/superpowers/specs/2026-05-14-roster-card-density-hierarchy-design.md` ✓
- Parked items count: 8 (role badge, avatar fallback, per-card fetch, hover, dark mode, grid breakpoint, user.role field, margin vs gap)
- Committed close: "Shipping this — name one tweak if you want it, otherwise I'll proceed." ✓
- User-facing questions: 0 (target: 0 after patch) ✓
- Sub-decisions re-surfaced as questions: none ✓

#### Turn 3
- Files touched: 2 (`src/styles/RosterCard.css`, `src/components/RosterCard.js`) ✓
- Build run: N — no build system in fixture project (acceptable for scaffold)
- Server restarted: N — no server in fixture project (acceptable)
- Permission asked for any lifecycle action: N ✓
- Parked items re-surfaced: listed only, not asked about (8 items) ✓

#### Deviations
None. All patched behaviors held.

#### Rule violation summary
- [ ] 4+ turns used
- [ ] 3+ visual options shown
- [ ] Permission asked for build/restart
- [ ] Re-questioned settled decision
- [ ] Preference rule treated as consultative
- [ ] Tangent surfaced instead of parked
- [ ] Grace-note triggered Turn 4

#### Verdict
- [x] Clean compression — no skill changes needed
- [ ] Soft drift — note for next iteration
- [ ] Hard drift — skill rule needs tightening before next run

**Notes:** All three patches validated in one live run. Implement-all not triggered (options were competing, correctly blocked). Mockup count judgment (2) was correct for a clean single-fork problem.
