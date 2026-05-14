# Scenario 00 - Credential redaction and path scrub

**`live_subagent_creation`:** false

Tests the most dangerous failure class first: the output must preserve the code pattern while removing every credential, provider name, and machine-specific path.

## Setup

- Use a file or snippet that contains:
  - one real or synthetic API key helper such as `openrouter_key()` or `aws_secret_manager()`
  - at least one absolute path
  - one or two domain-specific collection names
- Ensure the snippet is still small enough to fit in one message.
- Load `exp`, then reload client config before starting the session.

## User prompt

> /anonymize Turn this Python snippet into a publicly shareable example without leaking secrets or our domain terms. Keep the logic pattern intact and explain it briefly.

## Expected behavior

- Replaces credential-fetching helpers with placeholders such as `<api_credential>()` or `<credential_provider>()`
- Removes real paths and filenames
- Replaces domain jargon consistently
- Preserves control flow and data shape
- Ends with a compact explanation of what the pattern does and how to adapt it

## Expected user reply

> /exp

## Expected `/exp` behavior

- Does not ask to re-open already-correct replacements
- Names one adjacent unresolved surface if leakage remains
- Otherwise reaffirms the current result as the right surface

## Anti-patterns this catches

- Leaving one credential helper or bearer token path untouched
- Replacing `if` / `for` / JSON shape with placeholders
- Renaming the same concept differently in two places
- `/exp` surfacing multiple edits instead of one next seam
