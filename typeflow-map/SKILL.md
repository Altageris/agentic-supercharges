---
name: typeflow-map
description: Type-flow and normalization seam mapping for TypeScript codebases. Use when Codex needs to trace raw-to-normalized data shapes, locate union-field access sites, map downstream consumers of a normalized contract, or collapse repeated type errors into one seam fix.
---

# Typeflow Map

Use the repo-native typeflow tool first. It is the primary way to find union-field sites, narrowing frontiers, and raw-to-normalized seams.

## Repo-Native Commands

In `pokemon-showdown`, prefer:

```text
npm run typeflow -- field-sites --type ChoiceRequest --field active
npm run typeflow -- narrowing-sites --from SideID --to PlayerID
npm run typeflow -- seams --from SideRequestData --to RLChoiceTarget
```

Useful flags:
- `--json` for machine-readable output
- `--save` to persist a branch-local artifact under `tools/typeflow-map/artifacts/`
- `--root <path>` to override repo-root discovery

## Workflow

### 1. Pick The Raw Edge

Start from:
- a union type plus field
- a repeated diagnostic
- a raw adapter input
- a normalized downstream contract

### 2. Query The Right Route

- `field-sites` for unsafe union-field access
- `narrowing-sites` for conversion and guard frontiers
- `seams` for raw-to-normalized contract boundaries

### 3. Collapse The Drift At The Seam

Prefer this ledger:

```text
raw type -> narrowing guard -> normalized shape -> downstream consumers
```

Fix one shared seam before patching many consumers.

### 4. Save When The Branch Will Continue

Use `--save` when the seam map should survive delegation, compaction, or follow-up validation.

## Fallback

If the repo-native query is too shallow:
- supplement with `rg`
- keep the same seam table shape
- convert the missed case into a tool-improvement note

## Output Rules

- Prefer a compact seam table over prose.
- State the invariant directly: before vs after.
- When the seam feeds multiple consumers, lead with the seam, not the consumers.
