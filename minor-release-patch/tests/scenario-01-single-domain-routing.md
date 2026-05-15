# Scenario 01 — Single-Domain Routing

The skill MUST recognize a single-domain request and delegate immediately to the constituent skill — no triage report, no multi-track ordering question, no extra overhead.

## Setup

Any project. No special defaults file state required.

## User prompt

> "The roster cards have too much whitespace — padding looks way too big. Can we tighten that up?"

## Expected behavior WITH skill

**Turn 1 (and only turn from this skill):**

1. Triage silently: one track active (design). Arch and perf signals absent.
2. Announce in one sentence: "This is a design-track patch — delegating to `three-turn-design`."
3. Immediately follow `three-turn-design` Turn 1 protocol:
   - Read relevant code
   - Read `design-defaults.md` if present; refuse or scaffold if absent
   - Name what's there and what's missing in one sentence
   - Render two visual mockups at render scale
   - State a recommendation with one-line rationale
   - Ask one question: "A, B, or push back?"

**What must NOT happen:**
- A triage report listing three tracks (two empty tracks surfaced is overhead the user didn't ask for)
- An ordering question ("proceed in this order?") — there is only one track; no ordering decision exists
- A unified release spec for a single-track patch
- A commitment ladder — that's Turn 2 of the multi-track arc

## Anti-patterns this catches

- Skill wraps a single-domain request in multi-track scaffolding ("Active tracks: 1. Design. Parked tracks: 2. Arch (no coupling signal). 3. Perf (no slowness signal).")
- Skill asks "proceed in this order?" when there is no order
- Skill generates a release spec for what is a straightforward `three-turn-design` invocation

## Log fields

- Triage stayed silent (no multi-track report surfaced)? Y/N
- Delegation announced in ≤ 1 sentence? Y/N
- `three-turn-design` Turn 1 protocol followed (2 mockups, 1 question)? Y/N
- Multi-track overhead surfaced (ordering, commitment ladder, release spec)? Y/N (should be N)

## Variant prompts

- "This function is too slow, shave 200ms off it" → should delegate to `two-turn-performance`
- "The checkout flow hits three sync endpoints in sequence, p99 is awful" → should delegate to `three-turn-architecture`
- "The layout is off AND it's slow" → should NOT delegate; multi-track arc applies
