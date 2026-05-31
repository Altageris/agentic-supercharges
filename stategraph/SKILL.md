---
name: stategraph
description: State-surface and async-settlement analysis for TypeScript services. Use when Codex needs to trace durable mutable state roots, identify post-await mutations, reason about settlement blocks, or restore canonical state by id instead of mutating captured objects.
---

# Stategraph

Use the repo-native stategraph tool first. It is the primary way to group async mutation risk by durable root and settlement block.

## Repo-Native Commands

In `pokemon-showdown`, prefer:

```text
npm run stategraph -- --types server/model-league/types.ts --file server/model-league/daemon.ts
npm run stategraph -- --types server/model-league/types.ts --file server/browser-model-bridge.ts --json
```

Use:
- `--types` to point at durable state interfaces
- `--file` for each target source file
- `--json` when another tool or artifact should ingest the result

## Workflow

### 1. Discover The Roots

Run `stategraph` against the relevant `*State`, `*Job`, or `*Progress` type files first. Do not hand-enumerate roots if the tool already emits them.

### 2. Group By Settlement Block

Read the output as:

```text
root -> function -> await trigger -> post-await writes
```

Prefer block-level reasoning over raw line counting.

### 3. Fix In `frontier -> settled` Form

Default repair shape:
- capture ids before `await`
- re-read live state after `await`
- guard missing or replaced entries
- mutate only the settled object

### 4. Re-run After Meaningful Edits

Use the same `stategraph` command after a settlement refactor to verify that captured-post-await writes collapsed.

## Fallback

If the repo-native tool misses a root:
- supplement with `rg` or `Select-String`
- keep the report grouped by root and block
- feed the missing root back into the next tool improvement pass

## Output Rules

- Report by durable root and settlement block.
- Prefer `frontier -> settled` summaries.
- Avoid line-by-line prose unless the user explicitly wants line anchors.
