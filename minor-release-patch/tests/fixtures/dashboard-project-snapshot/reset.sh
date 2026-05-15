#!/usr/bin/env bash
# Restore the fixture project to its original state from the snapshot.
# Run between test scenarios to prevent state bleed.

FIXTURE_DIR="$(cd "$(dirname "$0")/dashboard-project" && pwd)"
SNAPSHOT_DIR="$(cd "$(dirname "$0")/dashboard-project-snapshot" && pwd)"

if [ ! -d "$SNAPSHOT_DIR" ]; then
  echo "ERROR: snapshot not found at $SNAPSHOT_DIR"
  echo "Run: cp -r dashboard-project dashboard-project-snapshot"
  exit 1
fi

rm -rf "$FIXTURE_DIR"
cp -r "$SNAPSHOT_DIR" "$FIXTURE_DIR"
echo "Reset complete: dashboard-project restored from snapshot."
