# Observation log

Append a run report after every test scenario execution. The log drives iteration on the skill itself — repeated drifts point to rules that need tightening.

## Run report template

Copy this block per run. Fill in honestly. The skill improves from honest deviations, not from passing scenarios.

```markdown
### Run YYYY-MM-DD-NN — scenario-XX

**Scenario:** scenario-XX-<slug>.md
**Project:** <repo or path>
**Defaults file:** present | absent | stale
**Model:** Opus 4.X | Sonnet 4.X | Haiku 4.X
**User-facing turns consumed:** N (target: 3)

#### Turn 1
- Constraint named: <one-line>
- Sketches shown: N (target: 2)
- Each sketch had typed interfaces: Y/N
- Each sketch had a sequence diagram (happy + failure): Y/N
- Each sketch had a failure-mode table: Y/N
- Each sketch had a perf envelope: Y/N
- Recommendation given with defaults-rooted rationale: Y/N
- Hidden questions bundled (transport / persistence / versioning / observability / failure-modes): list
- User-facing questions: N (target: 1)

#### Turn 2
- Consolidated architecture spec written to: <path>
- Slice scope decision: B (skeleton+slice) | A (skeleton-only, auto-degraded)
- Auto-degrade reason (if A): <one-line>
- Parked tickets count: N (target: 5–10)
- Migration plan includes rollback: Y/N
- User-facing questions: N (target: 1)
- Sub-decisions re-surfaced as questions: list

#### Turn 3
- Files touched: N
- Interfaces landed (signatures): list
- Contract tests at new boundaries: Y/N (and: did they exercise the actual boundary logic, or just liveness?)
- **`build_count`**: N (how many builds it took to ship clean)
- For each build > 1: what broke, and did it match the Turn 1 typed interface? (Y = implementation mistake; N = Turn 1 rigor failure)
- **`turn_1_rigor_signal`**: clean (1) | soft (2) | hard (≥3 or > `max_builds_per_slice`)
- Build run: Y/N
- Smoke test against slice (if B) or stubs (if A): Y/N
- Service restarted (if applicable): Y/N
- Permission asked for any lifecycle action: Y/N
- Parked items re-surfaced: list

#### Deviations
<List every place the skill drifted from the rules. Quote the offending response if useful.>

#### Rule violation summary
- [ ] 4+ turns used
- [ ] 3+ architectural sketches shown
- [ ] Boxes-and-lines without contracts
- [ ] Migration without rollback
- [ ] Boundary without timeout + retry + idempotency
- [ ] Observability gap at a new boundary
- [ ] Slice shipped that should have auto-degraded
- [ ] Permission asked for build / migration / restart
- [ ] Re-questioned settled decision
- [ ] Invariant treated as consultative
- [ ] Tangent surfaced instead of parked
- [ ] Scope expansion ("while I was in there…")

#### Verdict
- [ ] Clean compression — no skill changes needed
- [ ] Soft drift — note for next iteration
- [ ] Hard drift — skill rule needs tightening before next run
```

## Iteration history

Append a section here each time the skill itself is modified based on observed drifts. Keep it brief — date, what changed, why.

```markdown
### Skill change YYYY-MM-DD
**Drift observed across runs:** <pattern>
**Rule tightened:** <which clause in SKILL.md>
**Diff summary:** <one sentence>
```

---

## Runs

<!-- Append run reports below this line. Newest at bottom. -->

### Run 2026-05-12-01 — scenario-bonus (vendor-selection refusal)

**Scenario:** ad-hoc (not in `tests/`) — pick 1 of 11 Hugging Face Spaces for pixel-art sprite generation, framed as "make an informed choice based on /three-turn-architecture"
**Project:** AICCORE Dicer (browser-side sprite pipeline)
**Defaults file:** absent (did not matter — refusal happened on scope check, before defaults check)
**Model:** Opus 4.X
**User-facing turns consumed:** 1 (target: 0 — should refuse cleanly without entering the arc)

#### Turn 1
- The skill correctly refused to enter the three-turn arc.
- Named the scope mismatch in one sentence: vendor / tool selection is not architecture (no boundary in user-owned code, no contract to design, no failure modes to map, no slice to ship).
- Did not invent a defaults check, a topology survey, or a sketch fork for an external service.
- Gave a direct vendor recommendation outside the three-turn frame (#2 Gameboy Pixel Art Diffusion) with concrete rationale: status, input shape, memory safety, cost, execution steps.

#### Deviations
None on the SKILL.md rules — refusal was clean and the alternative answer was substantive.

**Latent gap surfaced:** the SKILL.md refuse list did not *explicitly* enumerate "vendor / tool / model selection" as a refuse-case at the time of the run. The agent extrapolated the existing rule ("one component deep with no boundary crossed → just do it") correctly, but extrapolation across agents/models is brittle. Made the rule explicit immediately after — see Skill change entry below.

#### Rule violation summary
- [ ] 4+ turns used
- [ ] 3+ architectural sketches shown
- [ ] Boxes-and-lines without contracts
- [ ] Migration without rollback
- [ ] Boundary without timeout + retry + idempotency
- [ ] Observability gap at a new boundary
- [ ] Slice shipped that should have auto-degraded
- [ ] Permission asked for build / migration / restart
- [ ] Re-questioned settled decision
- [ ] Invariant treated as consultative
- [ ] Tangent surfaced instead of parked
- [ ] Scope expansion ("while I was in there…")

#### Verdict
- [x] Clean compression — no skill changes needed on the rules themselves
- [x] Soft drift — refuse list tightened so the same correct behavior is reliably reproducible across models

### Skill change 2026-05-12
**Drift observed across runs:** Vendor / tool / model-selection prompts triggered correct refusal via extrapolation, but the refuse list did not explicitly cover this case. Reliance on extrapolation is model-dependent.
**Rule tightened:** `SKILL.md` § "When to refuse" — added an explicit bullet covering vendor / tool / model selection prompts, instructing the skill to make a direct recommendation outside the three-turn frame rather than invent contracts/sketches for an external service.
**Diff summary:** One new bullet under refuse list — vendor/tool/model selection is procurement, not architecture; refuse cleanly and answer directly.

### Run 2026-05-12-02 — scenario-bonus (parallel streaming refactor, full arc)

**Scenario:** ad-hoc — refactor the streaming pipeline for parallel animation under same-agent action collision (AICCORE arena-stream); spec the contract, ship the slice
**Project:** AICCORE Dicer / arena-stream
**Defaults file:** absent at start; agent scaffolded inline (at WRONG path: project root, not `.claude/`)
**Model:** Opus 4.X
**User-facing turns consumed:** 3 (target: 3) — preserved the budget despite scaffold-and-proceed

#### Turn 1 (scaffold + survey + fork)
- Constraint named: "Multiple actions enqueued on the same agent within overlapping animation windows lack a strategy for intensity scaling and animation state management." Good one-sentence diagnosis.
- Topology survey: rendered as inline prose, not the structured `topology_survey` panel via the companion.
- Sketches shown: 2 (target: 2) ✓
- Per-sketch artifacts:
  - Interfaces: pseudo-typed code blocks (not the typed-interface panel from the companion). Partially structured.
  - Sequence: happy path only — failure path mentioned in one prose sentence, not a diagram with failure transitions.
  - Failure-mode table: ✗ missing. One prose sentence per fork instead of the structured table.
  - Perf envelope: ✗ missing. 800ms timing mentioned inline; no p50/p99/throughput/memory panel. For an animation pipeline targeting 60fps that's a real miss — frame budget IS the perf envelope here.
- Recommendation: given with defaults-rooted rationale ✓
- User-facing questions: 1 (target: 1) ✓

#### Turn 2 (consolidated spec)
- Consolidated architecture spec written to `docs/architecture/specs/2026-05-12-arena-per-agent-queues-arch.md` ✓ (canonical path)
- Slice scope decision: B (skeleton + slice) — correctly chosen (one boundary, fits the slice budget)
- Slice feasibility panel: ✗ not rendered (companion still not invoked)
- Parked tickets: 8 (target: 5–10) ✓
- Migration plan: present (file is 269 lines — assumed to include parallel-run + flag + rollback per spec template)
- User-facing questions: 1 ("Ship slice / skeleton-only / one tweak?") ✓

#### Turn 3 (skeleton + slice)
- Implementation: complete end-to-end refactor of `useBattleStream.ts` + `app/arena-stream/page.tsx` integration ✓
- Type check: ran; caught a `Map` vs object-property error; fixed in-arc ✓
- Build: ran ✓
- **`build_count`: 2** — first build failed (`agentQueuesRef[agent]` indexing on a `Map`, not an object). Turn 1's typed interface declared the field as `Map<"blue" | "red", BattleAction[]>` BUT the contract pseudo-code used object-property access (`agentQueuesRef.current[agent]`). The interface and the example disagreed with each other → Turn 1 rigor failure (N).
- **`turn_1_rigor_signal`: soft (2 builds)** — within the default `max_builds_per_slice = 2` ceiling. Tighten Turn 1 interface discipline: typed signature and example code must be string-consistent (Map.get vs object indexing matters).
- Contract test at new boundary: ✗ **missing**. The "smoke test" was `curl http://localhost:3000/arena-stream | head -5` — that's a page-load liveness check, not a test of the new `enqueueAction → processNext → onActionComplete → processNext` queue chain. A real contract test would have triggered a battle and asserted queue depth / event order from the console logs.
- Smoke test against deployed slice: ✓ (the curl above counts as smoke)
- Service restart: ✓ (pkill + npm start, no permission asked — correct per SKILL.md)
- Report: files touched ✓, interfaces ✓, slice status ✓, parked tickets ✓
- Defaults path: spec summary still references project-root location ✗ (operator moved the file to `.claude/` post-hoc)

#### Deviations (consolidated)
1. **Scaffold to wrong path.** Agent wrote `architecture-defaults.md` at project root, not `.claude/` subdir. Operator moved post-hoc. → Rule tightened (see Skill change below).
2. **Companion never rendered across any turn.** All three turns used inline markdown instead of the structured HTML companion. The specific panels missed: topology survey, full per-sketch artifact set, failure-mode diff (Turn 1), slice feasibility (Turn 2).
3. **No structured failure-mode table.** In-process boundary, but SKILL.md didn't carve out a path — agent improvised with single prose sentences.
4. **No structured perf envelope.** Frame budget (16.7ms p99 for 60fps) was the relevant metric; not surfaced.
5. **Turn 3 contract test missing.** Liveness curl ≠ contract test. → Rule tightened (see Skill change below).

#### Rule violation summary
- [ ] 4+ turns used (actually 3 — budget preserved)
- [ ] 3+ architectural sketches shown
- [x] Boxes-and-lines without contracts (sketches were prose-with-pseudo-code, not the four-panel structure)
- [ ] Migration without rollback
- [x] Boundary without timeout + retry + idempotency (no structured failure-mode table at all; in-process carve-out wasn't documented)
- [x] Observability gap at a new boundary (no metric/log registration for the queue boundary; only console.log)
- [ ] Slice shipped that should have auto-degraded (slice was genuinely feasible)
- [ ] Permission asked for build / migration / restart
- [ ] Re-questioned settled decision
- [ ] Invariant treated as consultative
- [ ] Tangent surfaced instead of parked
- [ ] Scope expansion ("while I was in there…")

#### Verdict
- [ ] Clean compression — no skill changes needed
- [x] Soft drift — multiple structural-rigor misses; rules tightened to make the companion + in-process carve-out + contract test all explicit
- [ ] Hard drift — skill rule needs tightening before next run

#### Empirical evidence on scaffold-and-proceed vs hard-stop
This run ALSO surfaced a framing question: should the agent scaffold defaults and proceed (this run, 3 turns total) or scaffold and stop (4 turns total)? The user pushed back on the hard-stop framing — "isn't the whole build a 3 turn?" — and the empirical run shipped successfully in 3 interactions with no information loss. Decision: relax to scaffold-and-proceed with guardrails (canonical path, audit summary, push-back-includes-defaults). See Skill change below.

### Skill change 2026-05-12 (b)
**Drift observed:** Scaffold rule was too strict (hard-stop after scaffold), causing first-time-per-project arcs to take 4 user interactions when 3 was achievable. Empirical dogfood run shipped cleanly in 3 turns by scaffolding inline.
**Rule relaxed:** `SKILL.md` § "When to refuse" — removed the "no defaults file" refuse bullet. Replaced with a Turn 1 setup step (step 0) that scaffolds inline and proceeds. Guardrails added: canonical path enforced, inferred-invariants audit summary required, push-back includes "defaults are wrong."
**Rule tightened (separate):** `SKILL.md` § Turn 3 step 4 — explicit: a contract test exercises the actual new-boundary logic; for in-process boundaries this means trigger producer + assert consumer fires in expected order. A page-load curl is not a contract test. Also separated contract test (step 4) from smoke test (step 6) — they answer different questions.
**Diff summary:** Three SKILL.md edits — softened scaffold rule + Turn 3 contract-test definition + smoke vs contract separation.

### Run 2026-05-12-03 — scenario-bonus (confidence-crits architecture, run by a separate agent)

**Scenario:** ad-hoc — validate architecture for confidence-triggered critical-hit mechanics (per-turn accumulation state ownership, turn-reset timing, confidence-data provenance from battle converter)
**Project:** AICCORE Museum Arena Dashboard (`aiccore/dashboard/museum-arena-dashboard/`)
**Primary source log (other agent):** `aiccore/dashboard/museum-arena-dashboard/docs/SKILL_OBSERVATION_LOG.md`
**Defaults file:** present (project-level, scaffolded in run 02; this run reused it)
**Model:** unknown (different session, different agent)
**User-facing turns consumed:** 3 (target: 3) ✓

#### Turn 1 — Survey & fork
- Two sketches shown: Fork A (skeleton-only) vs Fork B (skeleton + slice) — note: this framing collapsed the structural fork into the *shipping choice*, which is a different drift than Run 02. Worth examining whether the agent confused "Turn 1 fork" (architectural alternatives) with "Turn 2 ship choice" (commitment level).
- Companion not rendered (consistent drift across all three runs).
- Failure modes documented inline ("Failure modes documented" — but not as the structured table).
- Recommendation given, defaults-rooted.
- ⚠️ **User-facing menu drift:** the user responded "A x B" — an off-menu hybrid. Agent interpreted as "ship slice" (hybrid skeleton+slice). This is empirical evidence the 3-option Turn 2 menu is too narrow or mislabeled.

#### Turn 2 — Spec & contracts
- Spec written to `docs/architecture/specs/2026-05-12-confidence-crits-arch.md` ✓
- Parked decisions: 8 (target 5–10) ✓
- Typed interfaces for AgentCard state included ✓
- Question presented: standard "Ship slice / skeleton-only / one tweak?" — user said "ship slice"

#### Turn 3 — Skeleton + slice
- Implementation completed: AgentCard with `cumulativeDeltaThisTurn`, useBattleStream with parallel per-agent queuing, three useEffect hooks for turn boundary detection, crit calculation, 20 golden stars + 16 particles burst, screen shake ±2px for 200ms.
- Files modified: agent-arena-battle.tsx, useBattleStream.ts, arena-stream/page.tsx
- **`build_count`: 2** — type error caught (Map initialization), fixed in-arc.
- **Runtime error post-ship:** 1 (Map methods on plain object) — the type error was caught at build but a related runtime issue manifested at execution, suggesting the build-time fix didn't fully resolve the access-pattern inconsistency.
- **`turn_1_rigor_signal`: soft** — same as Run 02. Same root cause (Map/object access-pattern mismatch in Turn 1's typed interface vs example code).

#### Deviations
1. **Map/object access-pattern drift — repeats Run 02 exactly.** Two-for-two across independent runs is a pattern, not an anecdote.
2. **"A x B" off-menu user response.** Turn 2 menu is too narrow or mislabeled. Promoted to skill change (see below).
3. **Fork-vs-shipping-choice confusion** in Turn 1. Sketches were labeled "Fork A: skeleton-only" / "Fork B: skeleton+slice" — that's a *commitment level* fork, not an *architectural* fork. The actual architecture was already settled before sketching. This is a different drift than Run 02; logged for tracking.
4. **Companion never rendered.** Consistent across all 3 runs. Reaching the point where this is a hard-drift pattern, not soft.

#### Cross-reference — independent validation of `four-turn-architecture` hypothesis
The other agent's recommendation #1 in `SKILL_OBSERVATION_LOG.md`: **"Pre-Turn-2 Type Check: Run `tsc --noEmit` after spec, before implementation, to catch interface mismatches early."** This is **exactly the Turn 2 rigor verification mechanic** that motivates `four-turn-architecture`. Two independent agents looking at the same drift class converged on the same fix.

The `four-turn-architecture` hypothesis is no longer "one agent's intuition" — it's externally re-derived. Strong evidence for the experimental sibling skill earning a real paired-run comparison.

#### Rule violation summary
- [ ] 4+ turns used (3 — budget held)
- [ ] 3+ architectural sketches shown
- [x] Boxes-and-lines without contracts (sketches were prose-with-pseudo-code per the other agent's log)
- [ ] Migration without rollback
- [x] Boundary without structured failure-mode table (consistent drift across runs)
- [x] Observability gap at new boundary (consistent drift across runs)
- [ ] Slice shipped that should have auto-degraded
- [ ] Permission asked for build / migration / restart
- [ ] Re-questioned settled decision
- [ ] Invariant treated as consultative
- [ ] Tangent surfaced instead of parked
- [ ] Scope expansion

#### Verdict
- [ ] Clean compression
- [x] Soft drift — same Map/object pattern + new menu-too-narrow pattern; rules tightened (see Skill change below)
- [ ] Hard drift

### Skill change 2026-05-12 (c)
**Drift observed across runs:** (1) Map/object access-pattern mismatch in Turn 1 typed interfaces — two-for-two across Run 02 and Run 03. (2) Turn 2 menu's three options ("ship slice / skeleton-only / one tweak") provoked an off-menu user response ("A x B" hybrid) — labels don't clearly convey that slice ⊃ skeleton.
**Rules tightened:**
1. `architecture-defaults-template.md` — added a new "Typed-interface discipline" section requiring Map/Set declarations and example code to use the same access methods. Default invariant: `.get/.set/.has/.delete` for Maps; never `obj[key]` indexing.
2. `SKILL.md` Turn 2 step 6 (and `four-turn-architecture` Turn 3 step 6) — replaced 3-option menu with 4-option commitment ladder: **"Ship slice / Ship skeleton, defer slice / Ship spec, defer code / Tweak first?"** Labels make the commitment level explicit.
**Diff summary:** Two SKILL.md edits (menu wording in both skills) + one defaults-template edit (Map/Set discipline invariant).
