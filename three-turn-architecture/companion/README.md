# Architecture companion

The visual sibling of `three-turn-design`'s browser companion — adapted for architecture.

The design companion renders pixel mockups. This one renders **executable contracts**: typed interfaces, mermaid sequence diagrams, failure-mode tables, perf envelopes, migration plans, and slice tickets. Side-by-side in Turn 1, consolidated in Turn 2.

## How it works

Zero-dependency Python (stdlib only) + a single self-contained HTML template (mermaid via CDN). The renderer:

1. Reads a JSON describing the turn's sketch(es).
2. Substitutes the JSON into `template.html` at a single placeholder (`__DATA_JSON__`).
3. Writes the result to `/tmp/three-turn-arch-turn<N>-<pid>.html`.
4. Prints the `file://` URL.
5. (`--open`) Opens it in the default browser.

No server, no install, no build step. The HTML is self-contained — copy it anywhere, it still renders.

## Usage

```bash
# Render Turn 1 (two sketches side by side) and open in browser:
python3 ~/.claude/skills/three-turn-architecture/companion/render.py \
  ~/.claude/skills/three-turn-architecture/companion/example-turn1.json --open

# Render Turn 2 (one consolidated sketch + migration + slice tickets + parked):
python3 ~/.claude/skills/three-turn-architecture/companion/render.py \
  ~/.claude/skills/three-turn-architecture/companion/example-turn2.json --open

# From stdin:
cat sketch.json | python3 .../render.py - --open

# Write to a specific output path:
python3 .../render.py sketch.json --out /tmp/arch.html --open
```

The skill invokes this in Turn 1 with two sketches, and again in Turn 2 with one consolidated sketch plus the `consolidated` block (migration plan, slice tickets, parked items).

## JSON shape

### Turn 1 (two sketches, fork question)

```jsonc
{
  "turn": 1,
  "constraint": "one-line diagnosis of the actual constraint",
  "topology_evidence": [
    "file:line — what was read to ground this (no assumptions)",
    "architecture-defaults.md — relevant invariant clause"
  ],
  "sketches": [
    {
      "label": "A",
      "title": "...",
      "summary": "one-line summary",
      "interfaces": "typed interface signatures — TS/Python/Go, real code, not pseudo",
      "sequence_mermaid": "sequenceDiagram\n  ... happy + failure path ...",
      "failure_modes": [
        {
          "call": "<from>→<to>",
          "timeout_ms": 500,
          "retries": 3,
          "backoff": "expo | linear | jitter | n/a",
          "idempotency": "required | recommended | n/a",
          "dead_letter": "where it goes / what the fallback is"
        }
      ],
      "perf_envelope": {
        "p50_ms": 100,
        "p99_ms": 400,
        "throughput": "200 req/s",
        "memory_mb": 64
      }
    },
    { "label": "B", "...": "..." }
  ],
  "recommendation": "A — one-line rationale rooted in a defaults invariant",
  "question": "A, B, or push back?"
}
```

### Turn 2 (one consolidated sketch + extras)

```jsonc
{
  "turn": 2,
  "constraint": "...",
  "topology_evidence": [...],
  "sketches": [
    {
      "label": "A",
      "title": "...",
      "summary": "...",
      "interfaces": "...",
      "sequence_mermaid": "...",
      "failure_modes": [...],
      "perf_envelope": {...}
    }
  ],
  "consolidated": {
    "migration": "numbered step-by-step migration with parallel-run + flag + rollback",
    "slice_tickets": [
      "Slice (Turn 3): the one vertical thread to implement",
      "Ticket #2: ...",
      "Ticket #3: ..."
    ],
    "parked": [
      "sub-decision 1 — with current default + when to revisit",
      "sub-decision 2 — ..."
    ]
  },
  "spec_path": "docs/architecture/specs/YYYY-MM-DD-<topic>-arch.md",
  "question": "Ship slice, ship skeleton-only, or one tweak?"
}
```

## What the rendered page shows

**Turn 1** — two-column layout:
- **Topology survey** panel at the top (optional, see below).
- Per sketch: title with label badge, interfaces code block, mermaid sequence, failure-mode table, perf envelope grid.
- **Failure-mode diff** table beneath the two sketches (auto-derived from each sketch's `failure_modes`).
- Recommendation banner below.

**Turn 2** — single-column layout (one sketch + extras):
- **Topology survey** panel at the top (optional).
- Same sketch sections as Turn 1.
- **Slice feasibility** panel (optional, inside the extras section).
- Migration plan (code block).
- Slice plan (numbered list).
- Parked tickets (numbered list).
- Footer: spec path + the user-facing question.

## Topology survey panel

When `topology_survey` is present in the JSON, a **Current topology** panel renders above the sketch columns in both Turn 1 and Turn 2. It shows the ground truth the skill read before sketching — the "before" picture the user confirms before looking at the proposals.

Four sub-sections:
- **Call graph slice** — ordered call sites at the boundaries being changed (`file:line — caller → callee — purpose`)
- **Data ownership** — which boundary owns which entity/table/state today (table: owner, entity, kind)
- **Current contracts** — existing interface signatures verbatim from the codebase, not the proposed shape
- **Defaults invariants in play** — specific clauses from `architecture-defaults.md` that constrain the fork

```jsonc
"topology_survey": {
  "call_graph": [
    "app/api/checkout/route.ts:51 — handleCheckout → notify.send — awaited; offload candidate"
  ],
  "ownership_map": [
    { "owner": "/checkout handler", "entity": "Order",    "kind": "table" },
    { "owner": "lib/jobs/worker.ts", "entity": "JobQueue", "kind": "queue" }
  ],
  "current_contracts": "export async function send(orderId: string): Promise<void>;",
  "defaults_invariants": [
    "no-net-new-infra — net-new infra requires explicit approval",
    "flag-gate-required — every behavior change ships behind a feature flag"
  ]
}
```

When `topology_survey` is absent the panel is removed from the DOM entirely. The legacy `topology_evidence` string array is retained and renders in the header as before whenever `topology_survey` is not present.

## Failure-mode diff view (Turn 1)

When Turn 1 has exactly two sketches both with at least one failure-mode row, the companion renders a **failure-mode diff table** between the two sketches and the recommendation banner.

The table has one row per unique call name across both sketches. Each row shows the five failure-mode fields side-by-side (Sketch A columns, then Sketch B columns) and a **Δ significance** verdict.

| Verdict | Trigger |
|---|---|
| `same` (muted) | All five fields are string-identical between A and B. |
| `minor` (amber) | Only `backoff` differs; OR `retries` differ by exactly 1; OR `timeout_ms` differs by < 20% of the larger value. |
| `material` (red) | `idempotency` differs; OR `dead_letter` differs in *kind* (DLQ vs fail-soft vs 5xx); OR `retries` differ by ≥2; OR `timeout_ms` differs by ≥20%; OR the call exists in only one sketch. |

**No schema change.** The diff is computed at render time from `sketches[0].failure_modes` and `sketches[1].failure_modes`.

Graceful degradation: when `sketches.length !== 2`, or both failure-mode arrays are empty, the diff section does not render.

Call matching is exact string equality on `call`. If A names a step `worker→notify` and B names its analogous step `consumer→notify`, both appear as `(A only)` / `(B only)` rows rather than a fuzzy-matched diff — preserves the architectural signal that they're different mechanisms.

## Slice feasibility report (Turn 2)

The `consolidated.slice_feasibility` block is an **optional** Turn 2 field. When present, a "Slice feasibility" panel renders immediately before the Migration plan section. It makes the auto-degrade decision (B = skeleton+slice vs A = skeleton-only) visible: blast radius, boundaries crossed vs threshold, per-step risk, fixture dependencies, verdict.

```jsonc
"consolidated": {
  "slice_feasibility": {
    "files_touched": [
      { "path": "app/api/checkout/route.ts", "reason": "Add enqueue call behind flag" }
    ],
    "boundaries_crossed": 1,   // integer
    "threshold": 1,             // degrade fires when boundaries_crossed > threshold
    "migration_steps": [
      { "step": 1, "description": "...", "risk": "low" }  // risk: "low" | "medium" | "high"
    ],
    "fixture_dependencies": ["Seeded order record for smoke test"],
    "verdict": {
      "status": "feasible",   // "feasible" | "degraded"
      "reason": "One boundary crossed; all fixtures creatable inline."
    }
  },
  "migration": "...",
  "slice_tickets": [...],
  "parked": [...]
}
```

**Verdict resolution.** The `verdict` field is explicit-primary. A derived fallback (`boundaries_crossed > threshold`) exists for minimal data but cannot detect three of the four SKILL.md degrade triggers (unfinished parallel-run, missing fixtures, implicitly-bundled slices). The skill should always populate `verdict` explicitly.

**Consistency rule.** The `verdict.status` must align with `slice_tickets[0]`:
- `"feasible"` → `slice_tickets[0]` starts with `"Slice (Turn 3):"`
- `"degraded"` → `slice_tickets[0]` does NOT start with `"Slice (Turn 3):"` (it's a deferred ticket)

**Visual behavior.** Boundary count renders as a colored pill (green when within limit, red when exceeded). Migration steps use per-step risk color (low=green, medium=amber, high=red). The verdict block is green-tinted for feasible, red-tinted for degraded — degraded state is prominent so the user notices the slice didn't ship as planned.

## What it deliberately doesn't do

- **No live server.** Each render produces a static file. The skill writes a new file per turn rather than mutating one in place.
- **No interactive editing.** This is a viewer, not a tool — the JSON is the source of truth; the HTML is just a presentation of it.
- **No persistence across sessions.** Output goes to `/tmp`. If you want a permanent artifact, render with `--out` to a stable path or commit the JSON to `docs/architecture/specs/`.

## Failure modes (recursive!)

- Mermaid CDN unreachable → diagrams fail silently. Fallback: read the `sequence_mermaid` field directly from the JSON.
- Browser can't render `file://` (some hardened configs) → use `python3 -m http.server` in the output dir and open `http://localhost:8000/<file>.html`.
- JSON malformed → `render.py` raises `json.JSONDecodeError` with line/column. Fix the JSON; the skill is the producer.
