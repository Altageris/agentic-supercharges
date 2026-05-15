# Run 2026-05-14-04 — scenario-03

**Scenario:** scenario-03-perf-escalates-to-arch.md
**Project:** synthetic (no codebase — triage from prompt only)
**Defaults files present:** none
**Model:** Sonnet 4.6
**User-facing turns consumed:** 2 (Turn 1 perf triage + Turn 2 escalation)

#### Triage (silent, before Turn 1)
- Tracks identified: perf
- Tracks parked: arch (no structural signal yet), design (no layout signal)
- Minor scope gate applied: N
- Dependency order stated: n/a (single track initially)
- Deviation from dependency order: N

#### Turn 1
- Triage report shown: Y (perf-only active; no multi-track overhead)
- Escalation condition stated explicitly: Y — "A flat distribution across 5+ callsites (<20% each) is a structural signal and would escalate this to an architecture track"
- Per-track artifacts rendered: Y — perf proposal block (baseline scaffold, hotspot TBD, projection, escalation condition)
- User-facing questions: 1 ✓

#### Turn 2 (escalation response)
- Escalation signal named explicitly before adding arch track: Y
- Arch track added: Y
- Local perf fix proposed despite flat distribution: N ✓
- Active tracks restated: arch + perf ✓
- Dependency order enforced: arch → perf re-measure ✓
- Cross-track dependency risk named: Y
- User-facing questions: 1 ✓

#### Overall
- Skill deviation type: none
- Skill change needed: N
