# Scenario 05 - `/exp` re-anchor after a completed design pass

**`live_subagent_creation`:** true

Tests that `/exp` finds the next unresolved visual seam after the three-turn pass ships, instead of reopening already-approved composition choices.

## Setup

- Real UI project with `design-defaults.md` present.
- `exp` skill installed and client config reloaded before the session starts.
- Choose a page where the three-turn pass can ship the main visual change while leaving one clearly parked polish item, such as a secondary empty-state treatment or a deferred motion note.

## User prompt

> The idle state of our display page feels dead. Can you do a three-turn pass to fix it?

## Expected behavior before `/exp`

- The normal three-turn-design arc completes.
- The accepted mockup ships.
- One adjacent polish seam remains explicitly parked or deferred.

## Expected user reply

> /exp

## Expected `/exp` behavior

- Reuses the just-completed design pass as the successful anchor
- Filters out already-approved palette, layout, and motion choices
- Names exactly one unresolved next surface, such as the deferred empty-tile treatment or a parked grace note
- Includes live subagent creation because this is an `/exp`-driven run
- Does not reopen the chosen fork or ask for more visual exploration

## Anti-patterns this catches

- `/exp` suggesting a new palette or layout fork after the user already picked
- `/exp` reopening settled defaults from `design-defaults.md`
- `/exp` giving a multi-branch redesign instead of one next seam
