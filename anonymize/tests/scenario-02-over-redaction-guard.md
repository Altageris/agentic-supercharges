# Scenario 02 - Over-redaction guard

**`live_subagent_creation`:** false

Tests the opposite failure mode: the skill must not destroy readability by replacing every useful term with placeholders.

## Setup

- Use a snippet where the sensitive surface is narrow:
  - one path
  - one domain-specific collection name
  - otherwise generic helpers like `load`, `filter`, `write`
- Load `exp`, then reload client config before starting the session.

## User prompt

> /anonymize Make this safe to share publicly, but do not turn it into placeholder soup. Keep generic helpers readable.

## Expected behavior

- Keeps universal helper names readable
- Redacts only the proprietary details
- Produces consistent placeholder names where placeholders are needed

## Expected user reply

> /exp

## Expected `/exp` behavior

- If the anonymization is already tight, reaffirms the current surface
- If not, names one specific over-redaction or under-redaction seam

## Anti-patterns this catches

- Turning `load`, `filter`, or `write` into abstract placeholders
- Naming multiple redo targets after `/exp`
- Reopening settled replacements that were already correct
