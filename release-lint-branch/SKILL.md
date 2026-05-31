---
name: release-lint-branch
description: Branch-scoped release stability validation over a repo-native release analyzer. Use when Codex needs compact blocker buckets, owner lookup, branch summaries, commit-readiness checks, or a validation loop around a branch delta instead of only repo-wide lint output.
---

# Release Lint Branch

Use the repo-native release analyzer in branch mode first. Treat it as the commit-readiness gate for the current delta.

## Repo-Native Commands

In `pokemon-showdown`, prefer:

```text
npm run lint:release -- --limit 120
npm run lint:release:branch -- --changed-files server/browser-model-bridge.ts,sim/tools/protocol-state-tracker.ts --limit 40
```

Branch mode already supports:
- `--scope branch`
- `--changed-files <comma-separated repo paths>`
- `--bucket-manifest tools/release-buckets.json`
- `--limit <count>`

Use repo-relative paths in `--changed-files`.

## Workflow

### 1. Discover The Frontier

Identify:
- changed files
- target bucket
- current bucket owner from `tools/release-buckets.json`

### 2. Run The Smallest Honest Gate

- Use repo scope when triaging broad debt.
- Use branch scope when validating the current owned delta.
- Re-run after a meaningful fix set, not after every tiny edit.

### 3. Read The Summary By Bucket And Owner

Lead with:

```text
scope -> findings -> top buckets -> owner_counts -> next buckets
```

Treat individual findings as supporting detail.

### 4. Decide Readiness

- `clean`: no branch-scope findings
- `advisory`: remaining findings are outside the owned branch scope
- `blocked`: owned bucket still active

### 5. Keep Commit Ownership Aligned

If a delegated branch validates cleanly, prefer letting that branch owner commit.

## Output Rules

- Lead with buckets, owners, and counts.
- Include the exact command you ran.
- Separate owned blockers from background debt.
