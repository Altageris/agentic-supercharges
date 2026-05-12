# Scenario 04 — Grace notes inside Turn 3

Tests the skill's discipline on the final turn: small polish requests should fit *inside* Turn 3, not extend to Turn 4.

## Setup

Run scenarios 01 or 02 first to land in the post-spec state. Then introduce the grace-notes prompt as the Turn 3 reply.

## User prompt sequence

After Turn 2 ("Ship as-is, or one tweak?"):

> Ship it, but let the confetti animation finish when someone closes the winner banner. Don't abruptly cut it off.

## Expected behavior

Turn 3 (the only turn after the polish request) should:

- Implement the main feature (whatever was specified in Turn 2's spec).
- ALSO implement the grace-note: two-phase close so the card fades while motion runs to completion.
- Build, restart server.
- Report both: main feature + grace note.

It should NOT:
- Ask a clarifying question about the grace-note ("how long should the confetti run for?").
- Treat the grace-note as a Turn 4 ("I'll do that next turn").
- Skip the main feature to focus on the grace-note.

The preferences file's `grace-notes-pass` rule explicitly lists motion-finishes-on-user-initiated-close. The skill should apply that without asking.

## Anti-patterns this catches

- Skill adds a fourth turn for the grace-note ("let me make sure I have the timing right before shipping").
- Skill ignores the grace-note because it's "out of scope for Turn 3."
- Skill asks the user to confirm timing values before applying defaults (preferences file gives defaults).

## What to log

- Was Turn 3 truly the last turn? Y/N
- Was the grace-note implemented alongside the main feature? Y/N
- Did the skill calculate the motion-finish duration from the existing animation values (not from asking)? Y/N
- Did the build + restart still happen with the grace-note included? Y/N

## Variant prompts to try

- "Ship it but make the dismissal feel softer." (vague polish — does the skill default to easing + fade rather than ask?)
- "Ship it, but the X button should also let the animation finish on Y." (one specific polish — fits in 3.)
- "Ship it, but also redesign the leaderboard." (NOT a grace note — that's new scope. Skill should refuse to fit it in 3.)
