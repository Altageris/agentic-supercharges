# Scenario 01 - Code plus docstring anonymization

**`live_subagent_creation`:** false

Tests whether the skill redacts surrounding prose and inline comments without stripping away the teaching value.

## Setup

- Use a snippet with:
  - a docstring mentioning a timeline, product name, or internal workflow
  - inline comments that reveal domain context
  - one small helper function and one queue/filter pattern
- Load `exp`, then reload client config before starting the session.

## User prompt

> /anonymize Convert this implementation and its comments into a public example. Keep the structure, remove the private context, and keep the explanation to a few sentences.

## Expected behavior

- Docstrings lose dates, release names, and private jargon
- Inline comments are rewritten around the universal logic pattern
- Helper names stay readable unless they are domain-coupled
- Explanation stays short and specific

## Expected user reply

> /exp

## Expected `/exp` behavior

- Points to one unresolved comment or naming seam if one still leaks context
- Does not turn the pass into a broad retrospective

## Anti-patterns this catches

- Leaving product names or dates in comments
- Flattening all comments into vague filler
- `/exp` widening scope into a new anonymization pass on already-clean code
