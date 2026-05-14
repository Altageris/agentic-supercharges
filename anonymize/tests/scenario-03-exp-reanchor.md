# Scenario 03 - `/exp` re-anchor after a mostly-correct anonymize pass

**`live_subagent_creation`:** true

This is the dedicated `/exp` scenario. The primary anonymize pass should be mostly correct, but one unresolved leak remains nearby.

## Setup

- Use a snippet that contains:
  - one absolute path
  - one private filename
  - one already-generic helper surface
- Arrange the test so the first anonymize pass removes the path but leaves the private filename in the explanatory prose.
- Load `exp`, then reload client config before starting the session.

## User prompt

> /anonymize Turn this into a public example. Keep the implementation readable and only explain the pattern briefly.

## Expected behavior before `/exp`

- The main output is largely correct
- One unresolved adjacent seam remains in the prose or filename

## Expected user reply

> /exp

## Expected `/exp` behavior

- Finds the nearest successful anchor from the just-completed anonymize pass
- Filters out already-resolved replacements
- Names exactly one next actionable surface: the remaining private filename in the prose
- Includes live subagent creation because this is an `/exp`-driven test
- Does not suggest reworking the code block if the code block is already clean

## Anti-patterns this catches

- `/exp` recommending a full second anonymization pass
- `/exp` revisiting the already-fixed path replacement
- `/exp` naming multiple follow-up seams
