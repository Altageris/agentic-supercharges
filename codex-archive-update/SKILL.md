---
name: codex-archive-update
description: Archive the current Codex install as a zip before updating or reinstalling. Use when handling Codex CLI upgrades, package-manager reinstalls, or any workflow that should keep older Codex versions compressed instead of deleted.
---

# Codex Archive Update

## Overview

Archive the active Codex install tree into a timestamped zip before any update. Keep the source install intact.

## Workflow

1. Resolve the current package root from the active config or `CODEX_PACKAGE_ROOT`.
1. Resolve the archive root from `CODEX_ARCHIVE_ROOT` or the default `~/CodexArchives`.
1. Read the installed package version from `package.json`.
1. Write `codex-<version>-<timestamp>.zip` to the archive root.
1. Leave the original install untouched.

## Use This Skill For

- `codex update`
- `codex upgrade`
- reinstalling the Codex CLI
- preserving an old install before replacing it with a newer package

## Script

Run [`archive_current_codex.ps1`](scripts/archive_current_codex.ps1) with the package root and archive root set from the current environment. Use the script output as the archive record.
