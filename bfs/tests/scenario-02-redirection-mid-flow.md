# Scenario 02 — Redirection Mid-Flow (User Interruption Test)

**Type:** Interactive mode with user interruption
**Goal:** Verify bfs honors user redirection ("jump to X") without re-deriving or pausing.
**Difficulty:** Medium

## Setup

This is a two-part scenario. You'll start a normal bfs explanation, then interrupt it.

### Part 1: Initiate explanation

**User prompt:**

```
Explain the concept of "adaptive pressure" as used in the Dicer game vision.
```

**Expected:** Skill delivers Section 1 (Core idea) and asks "Continue? Or jump to a specific part…"

### Part 2: User interrupts with redirection

**User response (after Section 1):**

```
Jump to mental model.
```

**Expected behavior:**

- Skill skips directly to Section 5 (Mental model).
- No re-derivation or "let me recap" preamble.
- Delivers the mental model crisply.
- **Does NOT** ask to continue again (we're at the last section).

## Deviations to log

- Skill delivers Section 2 and 3 before jumping → Redirection not honored
- Skill says "let me re-explain from the top" → Control lost
- Skill asks "did you want to skip sections 2-4?" → Should just do it
- Skill jumps to Section 5 but prefixes with recap → Unnecessary verbosity

## Success criteria

- Redirection is immediate (Section 1 ends with pause → User says "jump to X" → Section X delivered)
- No intermediate sections delivered.
- No second-guessing or asking for permission.
