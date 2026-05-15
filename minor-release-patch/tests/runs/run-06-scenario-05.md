# Run 2026-05-15-06 — scenario-05-missing-design-defaults

## Setup

- Model: claude-haiku-4-5
- Skill version: current (`minor-release-patch/SKILL.md`)
- Scenario: single-track design request with no `design-defaults.md` present

## RED Phase (no skill)

User prompt: "The roster card looks visually dead — no hierarchy, no color, the spacing feels wrong. Can we fix the design of this card? Nothing structural, just the look."

Agent behavior without skill:
- Immediately entered design conversation mode
- Asked 4 sub-questions: color palette, spacing scale, hierarchy, reference cards
- Did not detect missing design-defaults.md
- Did not offer to scaffold defaults before proceeding
- Moved into Turn 2 territory without a defaults anchor

RED violations: 4/5 (criterion 4 — no speculative mockups — was not violated; agent asked for code first)

## GREEN Phase (with skill)

Agent behavior with skill:
1. Correctly classified as single-track design (no arch/perf signals)
2. Noted `minor-release-patch` adds no value for single-domain requests → routed to `three-turn-design`
3. Detected missing `design-defaults.md` during silent triage
4. Refused design track: "I can't proceed with design fixes without binding defaults"
5. Offered to scaffold `design-defaults.md` with concrete list of what it should cover
6. Asked exactly 1 question: scaffold with dashboard conventions, or encode specific rules first?

GREEN score: 5/5 PASS

## Observations

- Skill's "When NOT to invoke / Single-domain work" routing correctly handed off to `three-turn-design`
- `three-turn-design`'s refuse-without-defaults gate fired as expected
- Minor-release-patch acts as a clean pass-through to constituent skills for single-track requests

## Skill changes needed

None — existing skill text at lines 40 and 54–55 covers this case correctly.

## Overall

- Skill deviation type: none
- Skill change needed: N
