---
name: codegraph
description: TypeScript contact-graph and bucket-anchor workflow for repo analysis. Use when Codex needs to trace symbol, import, or caller relationships; map release buckets back to file and line anchors; identify branch contact surfaces before delegation; or find likely owner files for a stabilization task.
---

# Codegraph

Use the repo-native graph tool first. Fall back to ad hoc search only when the current repo does not provide a graph entrypoint.

## Repo-Native Commands

In `pokemon-showdown`, prefer:

```text
npm run codegraph -- contacts --file server/browser-model-bridge.ts
npm run codegraph -- callers --symbol settleLedgerEntry
npm run codegraph -- bucket --id bridge/ledger-settlement-state-machine
npm run codegraph -- clusters
```

Command meanings:
- `contacts`: imports, imported-by edges, symbols, outbound calls for one file
- `callers`: caller frontier for one symbol, optionally narrowed by `--file`
- `bucket`: resolve a release bucket to likely anchor symbols
- `clusters`: list known release-lint clusters

Use `--json` when another tool or artifact should consume the result.

## Workflow

### 1. Choose The Seed

Start from one of:
- a changed file
- a release-lint bucket
- a target symbol
- a user-named subsystem

Keep the frontier small.

### 2. Query The Smallest Graph That Answers The Next Decision

- Use `contacts` before delegation to see direct contact surfaces.
- Use `callers` before seam edits to find upstream pressure.
- Use `bucket` when release-lint reports a cluster and you need anchors, not raw lines.

### 3. Record The Ledger

Prefer:

```text
seed -> direct contacts -> shared choke point -> likely owner
```

For buckets:

```text
bucket -> anchors -> touched files -> owner
```

## Fallback

If the repo-native graph tool is missing or too coarse:
- use `rg` first
- then `Select-String` plus narrow file windows
- keep the same compact ledger shape

## Output Rules

- Lead with the graph, not prose.
- Include only contacts that affect branch split, seam choice, or owner choice.
- When a bucket already has anchors, do not rebuild the same graph manually.
