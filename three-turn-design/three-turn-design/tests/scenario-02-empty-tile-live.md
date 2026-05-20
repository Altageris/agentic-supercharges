# Scenario 02 — Empty tile during live state

Stress-tests the skill's ability to handle a *partial* state problem rather than a wholly-empty one. The live mode has content but some areas are empty.

## Setup

- Project with a live / active mode that renders multiple participant tiles.
- Empty tiles render as dot-grid or similar placeholder.
- `design-defaults.md` present.

## User prompt

> When a challenge is running but no one's actively building, the participant tiles look like dead dot-grids. Just like the idle state we already fixed. Run three-turn-design to give them the same ambient treatment we added to attract mode, but make sure it doesn't fight real flows when builders start working.

## Expected behavior per turn

### Turn 1

The skill should:
- Recognize that an ambient layer already exists (from the prior session) and read its component.
- Diagnose the live-empty problem in one sentence.
- Show two mockups:
  - Option A: shared backdrop ambient layer behind the tile grid; tiles with content cover it.
  - Option B: per-tile scoped ambient with handoff when content arrives.
- Recommend based on perf (shared layer = fewer composited layers, simpler).
- Ask: "A, B, or push back?"

**Expected user reply:** "A"

### Turn 2

The skill should:
- Apply preferences (animation budget, memory cap, banner discipline N/A here).
- Render one consolidated mockup: live mode with one builder building (tile content visible, no ambient under it) and three empty tiles (ambient glowing through).
- Write the spec, return the path.
- Park: per-tile color identity, transition handoff when first node lands, fade-out timing.
- Ask: "Ship as-is, or one tweak?"

**Expected user reply:** "Ship"

### Turn 3

- Implement in the live component.
- Build, restart server.
- Report.

## Signals of compression failure

- Skill asks "should it be per-tile or shared?" before showing mockups (that's the fork; it must visualize it).
- Skill asks user to confirm the fade-out timing before shipping (parked item leaked).
- Skill rebuilds the existing ambient component instead of reusing it (didn't read code first).

## Variant prompts to try

- "And let's make it actually represent the participants per-tile." (a true scope change — the skill should bundle that into the recommendation or push back if it can't fit 3 turns.)
- "Don't touch the attract-mode ambient layer." (constraint injected mid-prompt.)
