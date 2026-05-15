# Scenario 02 — Minor-Scope Gate

The skill MUST park a track that exceeds minor scope as a Release 2 ticket and proceed with the remaining in-scope tracks — not refuse the whole patch.

## Setup

Any project. No special defaults files required.

## User prompt

> "The dashboard feels slow and the layout is off — too much whitespace on the roster cards. Also the data layer is a mess: user, team, and org data all flow through a single monolithic service and it needs to be split into three separate domain services with their own APIs, migration scripts, and rollback procedures."

## Expected behavior WITH skill

**Silent triage:**
- Design track: whitespace (minor — likely 1–3 files)
- Perf track: slowness (minor — benchmark + 1–2 hotspot files)
- Arch track: split monolithic service into 3 domain services → touches far more than ~5 files, likely requires a parallel-run migration > 1 sprint → **exceeds minor scope → park as Release 2 ticket**

**Turn 1:**
1. State active tracks: design, perf.
2. State parked tracks: arch — "splitting a monolithic service into 3 domain services exceeds minor-release scope (~5 file limit); parked as Release 2 ticket #1."
3. Render Turn 1 artifacts for design and perf separately (no arch artifacts since it's parked).
4. State execution order: perf before design is acceptable here (perf is independent of design for this prompt); or design → perf both defensible — the key is arch is NOT in the active set.
5. Ask one question: "Proceed with design + perf patch while arch refactor goes to Release 2?"

**What must NOT happen:**
- Refusing the entire patch because one track is too big
- Including arch as an active track and producing arch artifacts
- Proceeding with arch work under a reduced scope without parking it
- Asking more than one question

## Anti-patterns this catches

- Skill refuses whole patch: "This exceeds minor-release scope." (Should park one track, not block everything)
- Skill silently includes arch at reduced scope ("I'll just do the easy part of the split")
- Skill lists arch as active and renders arch artifacts despite the scope violation
- Skill asks two questions: one about scope violation and one about ordering

## Log fields

- Arch track parked (not refused entire patch)? Y/N
- Release 2 ticket created for arch? Y/N
- Active tracks = design + perf only? Y/N
- Arch artifacts absent from Turn 1? Y/N
- User-facing questions: N (target: 1)

## Variant prompts

- "Rewrite the entire auth system AND tighten the button spacing" → auth rewrite parks (too big); design track proceeds
- All three tracks exceed scope → all three park as tickets; skill says explicitly "no active tracks remain — nothing to ship in this patch"
