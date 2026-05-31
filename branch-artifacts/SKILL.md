---
name: branch-artifacts
description: Persistent branch-local maps for delegated work, including topology, seams, ownership, validated commits, and feedback deltas. Use when Codex needs to reload or compact multi-turn branch context instead of rediscovering the same graph on every pass.
---

# Branch Artifacts

Use the repo-native branch-artifact helper first. It is the durable working-memory surface for delegated branches and long stabilization threads.

## Repo-Native Commands

In `pokemon-showdown`, prefer:

```text
npm run branch-artifact -- init --task bridge-snapshot-boundary --owner Hubble --seams "[{\"from\":\"browser payload\",\"to\":\"BattleSnapshot\",\"contract\":\"typed snapshot merge\"}]"
npm run branch-artifact -- update --artifact tools/branch-artifacts/state/pokemon-showdown/codex-model-feature-added/bridge-snapshot-boundary.json --data "{\"openRisks\":[\"request validation still uses loose AnyObject edges\"]}"
npm run branch-artifact -- load --artifact tools/branch-artifacts/state/pokemon-showdown/codex-model-feature-added/bridge-snapshot-boundary.json
```

Primary commands:
- `init`
- `update`
- `load`

The helper stores artifacts under `tools/branch-artifacts/state/<repo>/<branch>/` by default.

## Workflow

### 1. Initialize One Artifact Per Real Branch Task

Name the task after the invariant or bucket, not just a file.

### 2. Record Only Durable Working Memory

Keep:
- topology
- seams
- owner
- open risks
- validated commits
- feedback deltas

### 3. Update After Validation

Append what changed:
- what dropped
- what remained
- which commit became validated
- whether the tool used in the branch helped

### 4. Reload Before Re-Exploring

Read the artifact first. Re-open only unresolved seams or risks.

## Output Rules

- Prefer machine-readable state plus one short human summary.
- Store feedback as deltas, not transcripts.
- Treat the artifact as working memory, not a changelog.
