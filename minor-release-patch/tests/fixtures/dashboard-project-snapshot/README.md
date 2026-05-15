# dashboard-project (test fixture)

Minimal fake dashboard codebase for multi-turn skill tests. Agents read and modify these files during Turn 2–3 execution.

## Structure

```
src/
  dashboard.js          — entry point; sequential fetches (perf hotspot)
  data/
    data-layer.js       — monolithic data module (arch track target)
  components/
    RosterCard.js       — renders team members; per-card fetch (perf hotspot)
  styles/
    RosterCard.css      — excessive padding/margin (design track target)
```

## Resetting between tests

```bash
# First time: create the snapshot (only needed once)
cp -r dashboard-project dashboard-project-snapshot

# Before each test run
bash fixtures/reset.sh
```

## What each track touches

| Track | Target files |
|-------|-------------|
| Arch  | src/data/data-layer.js, src/dashboard.js |
| Design | src/styles/RosterCard.css |
| Perf  | src/dashboard.js, src/components/RosterCard.js |
