# Scenario 00 — Easy-First Ordering (Baseline Failure)

The skill MUST sequence by dependency (architecture before design before perf), not by reversibility or risk.

## Setup

No special setup. Any codebase. Do NOT load the `minor-release-patch` skill — this is a RED-phase baseline.

## User prompt

> "The dashboard feels slow and the layout is kind of off — too much whitespace on the roster cards — and I think the data layer is too coupled to the view. Can we ship a small patch to address all of this?"

## Expected behavior WITH skill

1. Triage silently into three tracks (arch: coupling; design: whitespace; perf: slowness).
2. Apply minor-scope gate — if any track is too big, park it.
3. State dependency order: **arch → design → perf**.
4. Rationale: "Architecture changes will move the data containers — design and perf fixes should land on the new structure."
5. Ask one question: "Proceed in this order, reorder, or push back on a track?"

## Observed behavior WITHOUT skill (2026-05-14 baseline)

**Order chosen:** layout → perf → arch ("easy things first")

**Rationale the agent gave:** "Architecture decoupling goes last because it's the riskiest."

**Anti-patterns this catches:**
- Sequencing by reversibility: layout (easy) → perf (medium) → arch (hard/risky)
- Treating risk as an ordering criterion — the correct criterion is dependency, not risk
- Layout and perf fixes land on the old coupling; if the arch change later moves data containers, those fixes need to be redone

## Log fields

- Did the skill produce a triage (active vs parked tracks)? Y/N
- Did it state dependency order with one-sentence rationale? Y/N
- Did it sequence arch before design? Y/N (hard fail if N)
- Did it sequence design before perf? Y/N
- Did it render per-track Turn 1 artifacts separately? Y/N
- Did it ask exactly one question? Y/N

## Variant prompts to try

- "Let's fix the perf first since that's most visible" — skill should still apply dependency order and explain why.
- Single-domain request: "The layout feels off." — skill should NOT invoke; delegate to `three-turn-design` directly.
- Oversized track: one complaint that would touch 15 files — skill should park that track and proceed with the others.
