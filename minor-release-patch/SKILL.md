---
name: minor-release-patch
description: Use when a user describes changes that span multiple concerns in one request — slow AND layout off AND too coupled — and the agent is tempted to handle them as one undifferentiated plan or to sequence by reversibility (easy first) rather than dependency (architecture first).
---

# Minor-Release Patch

A coordination layer over `three-turn-design`, `three-turn-architecture`, and `two-turn-performance` for patches that span multiple domains.

The skill does one thing its siblings don't: **triage + order**. The natural agent failure on a multi-domain request is to sequence by reversibility — layout fix first (easy), perf second (medium), decoupling last (risky). That order fails: design and perf fixes built on unfixed architecture have to be redone when the structural change finally lands. Dependency order is the correct order, and it runs the opposite direction.

## When to invoke

- The user bundles two or more complaints across design, architecture, and performance in one request.
- The user says "patch", "small fix", or "minor release" for work that visibly spans more than one domain.
- You're about to write a single undifferentiated plan for a multi-domain request.

## When NOT to invoke

- Single-domain work. Go directly to `three-turn-design`, `three-turn-architecture`, or `two-turn-performance`. This skill adds no value for single-domain requests.
- Open-ended exploration. Route to `superpowers:brainstorming`.
- Clearly major work (new subsystems, breaking APIs, multi-sprint migrations). Tell the user explicitly: "This exceeds minor-release scope" and name which track is too big.

## Silent triage (before any user-facing turn)

1. **Read ground truth** — relevant files, call graph, component tree. No assumption-based triage.
2. **Classify each complaint** into tracks:
   - **Arch** — coupling, blast-radius, data-ownership, deploy-independence, boundary
   - **Design** — layout, visual, spacing, palette, animation, component composition
   - **Perf** — latency, frame budget, memory, bundle size, throughput, OOM, jank
3. **Apply the minor-scope gate per track:**

   | Exceeds minor scope? | Action |
   |---|---|
   | Track touches > ~5 files | Park as Release 2 ticket #1, proceed without it |
   | > 1 new boundary cross in one track | Auto-degrade slice; ticket it |
   | Migration needs parallel-run > 1 sprint | Route that track to standalone `three-turn-architecture`; exclude from patch |
   | Breaking API change detected | Refuse that track: "Breaking change — not minor-release scope" |

4. **Check available defaults files:** `architecture-defaults.md`, `design-defaults.md`, `performance-defaults.md` at `~/.claude/` or `<project>/.claude/`. Note which are present. Handle missing files exactly as each constituent skill does: design refuses or scaffolds; arch and perf scaffold inline.
5. **Determine execution order** using the dependency rule.

## Dependency ordering rule — always enforce

**Architecture → Design → Performance.**

- Architecture changes redefine contracts and component structure. Design fixes landed before the structural change will need to be revisited.
- Performance verification is empirical — it must measure the shipped design, not a pre-design snapshot.

**Exception:** if tracks are verifiably independent (different components, no shared state, no boundary overlap), state that explicitly and allow user-priority ordering.

## Routing

### Single active track after triage
Announce: "This is a [arch/design/perf]-track patch. Delegating to [skill name]." Follow the constituent skill's protocol exactly.

### Multiple active tracks
Run the three-turn arc below.

---

## Turn 1 — Triage report & fork

1. State active tracks and parked tracks (one-line reason per park).
2. State execution order with one-sentence rationale for each ordering decision.
3. For each active track, render the **Turn 1 artifact its constituent skill produces** — separately, not merged:
   - Arch: two executable sketches (interfaces + sequence diagram + failure-mode table + perf envelope)
   - Design: two visual mockups at render scale
   - Perf: one proposal block (baseline median/p95/spread + hotspot + fix + projection)
4. Name one cross-track dependency risk if one exists (e.g., "architecture change will move the data containers — design track should land on the new structure, not patch around the old one").
5. Ask one question: **"Proceed in this order, reorder, or push back on a track?"**

Forbidden:
- Merging artifacts from different tracks into one diagram
- Asking sub-questions per track
- Ordering by file count, reversibility, or "risk" instead of dependency

---

## Turn 2 — Release spec & commitment ladder

After the user confirms order (or adjusts once):

1. For each active track, apply the Turn 2 defaults logic of its constituent skill silently (parked decisions, slice scope check, spec content).
2. Write one unified spec to `docs/superpowers/specs/YYYY-MM-DD-<topic>-patch.md` with per-track sections:
   - **Arch:** interfaces, migration plan, rollback path
   - **Design:** mockup reference, palette, parked sub-decisions
   - **Perf:** baseline numbers, hotspot, proposed fix, projection
3. State estimated file scope per track and total.
4. Ask one question — the release commitment ladder:

   | Choice | What ships |
   |---|---|
   | Ship patch | All active tracks executed in dependency order |
   | Ship [track] only | Execute one track; park the others as tickets |
   | Ship spec, defer code | Spec only; nothing implemented yet |
   | Tweak first | Adjust before committing |

---

## Turn 3 — Ordered ship

Execute active tracks **fully in dependency order** — complete each before starting the next.

**Arch track:** Follow `three-turn-architecture` Turn 3 exactly — skeleton, slice (or auto-degrade), type check, contract test, build, smoke test, build_count tracking.

**Design track:** Follow `three-turn-design` Turn 3 exactly — implement, `tsc --noEmit`, build, kill + restart server.

**Perf track:** Follow `two-turn-performance` Turn 2 exactly — apply fix, re-run baseline measurement apples-to-apples, verify delta against budget and projection, report.

**Unified report:**
- Files touched per track (count + key paths)
- Build count per track
- Perf before/after delta (if perf track ran)
- Parked tickets (numbered, all tracks combined)
- One-sentence release summary: "Patch shipped: [arch change], [design change], [perf delta]."

**Hard stops — do not absorb into a fourth interaction:**
- Arch `build_count` ≥ 3: stop after the failing build, surface the Turn 1 rigor failure.
- Perf escape Turn 3 fires: surface the miss and stop. Do not continue remaining tracks until the user decides.

---

## Cross-skill escalation signals

| Signal | Originating skill | Route to |
|---|---|---|
| No dominant hotspot (top 5 costs all < 20%) | `two-turn-performance` | `three-turn-architecture` — structural problem, not local |
| Layout fix requires moving a data container boundary | `three-turn-design` | Pause, escalate to arch track first |
| Perf fix requires restructuring the component tree | `two-turn-performance` | Pause, add arch track, re-triage |
| Arch change touches visual containers | `three-turn-architecture` | Add design track to verify visual correctness after ship |

Surface escalation signals explicitly before acting on them.

---

## Why this order matters (compression formula)

> **Dependency order + scope gate + constituent-skill delegation** > easy-first heuristics.

The easy-first ordering is a seniority trap: it feels productive (small wins early) but creates rework (architecture invalidates earlier design and perf fixes). The dependency order feels riskier up front but ships everything once.

## See also

- `three-turn-design` — pure UI/visual work
- `three-turn-architecture` — pure structural/boundary work
- `two-turn-performance` — pure perf work
- `four-turn-architecture` — escalate if arch `build_count` > 1 on 2+ consecutive runs
- `superpowers:brainstorming` — exploration before any track is scoped
