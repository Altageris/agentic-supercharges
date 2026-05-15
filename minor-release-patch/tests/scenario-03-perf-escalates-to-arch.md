# Scenario 03 — Perf Escalates to Arch

The skill MUST escalate to an arch track when profiling reveals no dominant hotspot — it must NOT propose a local perf fix.

## Setup

Any project. No special defaults files required.

## User prompt

> "The dashboard is feeling sluggish — p99 load time is around 3 seconds. Can we get that down?"

## Expected behavior WITH skill

**Silent triage:**
- Perf track: active (slowness signal present)
- Design track: absent (no layout/visual signal)
- Arch track: absent initially — added conditionally after perf triage

**Turn 1:**
1. Acknowledge perf track as the sole active track.
2. State that before proposing a fix, profiling is needed to locate the dominant hotspot.
3. Render a perf Turn 1 artifact: baseline scaffold (what to measure), hotspot hypothesis list, and the escalation condition explicitly stated — "If no single hotspot accounts for > ~20% of load time, this is a structural problem; we add an arch track."
4. Ask one question: "Run profiling first, or do you have a hotspot already identified?"

**If/when profiling shows no dominant hotspot (top-5 costs all < 20%):**
- Surface the escalation signal explicitly: "No dominant hotspot found — load time is distributed across N call sites. This is a structural problem, not a local fix."
- Add arch track.
- Restate active tracks: arch + perf.
- Apply dependency ordering: arch first (structural fix), then perf re-measure.

**What must NOT happen:**
- Proposing a local perf fix (memoization, lazy load, cache) when no dominant hotspot exists
- Skipping the escalation check and treating distributed cost as a tuning problem
- Adding arch track silently without naming the escalation signal
- Asking more than one question per turn

## Anti-patterns this catches

- Skill proposes "add memoization to the slowest 3 calls" when costs are evenly distributed
- Skill proceeds with perf-only track after seeing flat hotspot distribution
- Skill names the escalation condition but then doesn't actually add the arch track

## Log fields

- Escalation condition stated in Turn 1 artifact? Y/N
- No dominant hotspot → arch track added? Y/N
- Arch track added with explicit escalation signal named? Y/N
- Local perf fix proposed despite flat distribution? Y/N (should be N)
- User-facing questions per turn: N (target: 1)

## Variant prompts

- "The API is slow — here's the flame graph: [single spike at DB query]" → dominant hotspot found; proceed with perf-only track (no escalation)
- "Everything feels slow — profiling shows 15 hot spots all around 6-7%" → no dominant hotspot; escalate to arch
