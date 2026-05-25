---
name: background-agents
description: Use when planning a multi-agent fan-out where the parent should not interactively manage workers — first hydrates each subagent prompt with prior-session context via session-search, dispatches all workers with run_in_background, then dispatches synthesis itself as a background agent that consumes only the collected structured outputs. Sibling of balanced-subagents. Trigger phrases include "background fan-out", "fire and collect", "background-synthesize the agents", "don't interrupt me while these run", "run these agents in the background and synthesize".
---

# Background Agents

Variant of `balanced-subagents` optimized for **fire-and-collect** fan-out. The parent hydrates prompts from session memory, dispatches every worker in the background, and refuses to peek at in-flight output. When all workers return, synthesis itself is dispatched as a background agent — the parent only ever consumes structured final reports.

> **Sibling skill.** Inherits every rule from `balanced-subagents` (model-tier table, output schema, JSON-only preamble, ≤6 fan-out, subscription-safety, failure handling). This skill only documents the deltas. When in doubt, walk the `balanced-subagents` checklist first.

## Core Principle

**As long as subagent context does not re-enter the parent early, total work scales without inflating parent context.** Many subagents can spawn, do immense work, and write durable artifacts to disk — none of that lands in the parent's reasoning surface as long as the parent only consumes structured final returns, not transcripts, not partial results, not raw worker outputs.

**Measured on 2026-05-18 (this skill's own first compliant run):** a Sonnet synthesis subagent executed the full five-step `/synthesis` protocol over 6 worker reports + a Haiku judgment. **Internal usage: 27,418 tokens. Returned to parent: 317 tokens. Durable artifact on disk: 4,380 tokens. Containment ratio: 86.5 : 1.** Of every 86.5 tokens the synthesis spent, only 1 landed in the parent's reasoning context. The other 85.5 stayed inside the closed subagent session or on disk for future use.

**The corollary:** the parent's context is reserved for hydration before dispatch and synthesis after collection — nothing in between. Polling, peeking, or course-correcting mid-flight defeats containment: it re-introduces the parent into the critical path, blocks on partial output, and forces decisions on incomplete evidence. If you need to interactively steer agents, use `balanced-subagents`. This skill is for batches you trust to run unattended.

## When To Use This Variant vs balanced-subagents

| Situation | Use |
|---|---|
| Need to see intermediate findings, plan the next dispatch live | `balanced-subagents` |
| One-shot batch — fire all workers, collect all output, synthesize once | **`background-agents`** |
| Output of one worker should redirect another mid-flight | `balanced-subagents` (chain) |
| You have prior sessions with proven patterns for this task | **`background-agents`** (session-search hydration pays off) |
| Exploratory, unclear what to search for | `balanced-subagents` (single agent first) |
| User has stepped away or asked for unattended execution | **`background-agents`** |

If you reach for this skill but find yourself wanting to peek, you picked wrong — cancel and re-dispatch via `balanced-subagents`.

## The Three Phases

```
Phase 1 — Hydrate    →   Phase 2 — Dispatch (bg)   →   Phase 3 — Collect + bg synthesis
(parent works)            (parent waits, no peek)         (parent works briefly,
                                                           then waits again)
```

---

### Phase 1 — Hydrate via session-search

Before drafting any subagent prompt, retrieve prior-session context for each partition.

**Procedure:**

1. **Walk the `balanced-subagents` decision checklist first.** No exceptions. If that checklist says "don't fan out," this skill does not apply.

2. **For each named partition / agent role, run session-search** for the keywords that identify its work. Pick keywords likely to surface prior decisions, schema choices, and known pitfalls — not the task's generic verbs.

   Preferred: invoke the `session-search` skill (`/session-search <keywords>`) or the underlying index directly:
   ```bash
   python3 ~/.claude/skills/index-sessions/scripts/query-index.py <kw1> <kw2> --limit 3
   ```

3. **Triage each session-search hit.** Keep only:
   - The first user message (intent).
   - Durable decisions / findings (linked files, commit hashes, schema choices, benchmark numbers).
   - Pitfalls the prior session explicitly named.

   Cap each agent's hydration block at **≤400 words**. Too much prior context drowns out the partition-specific instructions.

4. **Embed the hydration block at the top of the subagent prompt.** Format:

   ```
   ## Prior-session context (read-only — do not re-derive)
   Source: <session_id_or_resume_path>
   - <decision / finding / pitfall> — evidence: <file:line or commit>
   - <decision / finding / pitfall>

   ## Your partition
   <partition-specific instructions>
   ```

   The agent sees prior context as **constraints already settled**, not as suggestions to revisit.

5. **If session-search returns nothing**, mark the agent prompt `Prior-session context: none — cold start.` Do not fabricate context. Do not expand the date window past 30 days unless the user asked for archival mining.

6. **Sessions older than 30 days** get an explicit `STALE — verify before relying` tag in the hydration block. Stale context that masquerades as current is worse than none.

**Why this phase is non-optional:** background dispatch removes the parent's chance to course-correct. Cold-start prompts re-invent schema choices, re-discover known pitfalls, and produce findings that contradict already-settled work. Hydration is how you front-load the corrections the parent would otherwise make mid-flight.

---

### Phase 2 — Dispatch all workers with run_in_background: true

Every worker subagent is launched as a background task.

**Rules:**

- **All workers in one message.** Send all `Agent(...)` tool calls in a single response so they actually run concurrently. Sequential dispatches across messages defeat the point.
- **Set `run_in_background: true` on every dispatch.** No exceptions. Mixed foreground/background fan-outs re-create the polling problem for the foreground subset.
- **Do not call Monitor on workers. Do not sleep. Do not poll.** Harness-tracked background work notifies on completion. Polling burns parent context and the prompt cache.
- **Do not dispatch dependent work in this phase.** If agent B's prompt depends on agent A's output, B does not belong in this fan-out — chain them via `balanced-subagents` instead.
- **Reserve parent capacity for synthesis prep.** While workers run, the parent may: draft the synthesis prompt scaffold, pre-create the durable output filename, and prepare any shell snippets the synthesis agent will reference.

**Forbidden during Phase 2:**

- Reading any worker's transcript before completion notification.
- Spawning a "checker" agent to peek at workers.
- Asking the user "should I steer agent N?" — if you want to steer, you picked the wrong skill.
- Telling the user "agent 3 is taking a while, let me look" — wait for the notification.

If a worker fails to return inside the declared wall-clock budget (default 10 minutes, or whatever you committed to before dispatch — whichever is shorter), treat it under `balanced-subagents` §7 failure handling: mark coverage gap, continue with the rest, surface in synthesis.

### Phase 2 parent self-preamble (paste verbatim into working notes at dispatch time)

The no-peek contract is discipline, not harness enforcement — a 2026-05-17 Haiku review classified it as `leaky` because nothing mechanically blocks a parent from calling `Monitor`, sleeping, or re-reading transcripts mid-flight. To close that gap with the same shape `balanced-subagents` §3 uses for its strict-output preamble, the parent pastes this block into its own working notes at the moment all background dispatches are out, and re-reads it before any tool call until Phase 2 ends:

```
NO-PEEK SELF-RULES — Phase 2 (read before any tool call):
- I will not Read any worker's transcript file before its completion notification.
- I will not call Monitor on a worker.
- I will not sleep, set a wakeup, or otherwise poll.
- I may: draft the synthesis prompt scaffold, pre-create the durable
  output filename, prepare shell snippets the synthesis subagent will reference.
- If I feel pulled to peek, I cancel and re-dispatch under /balanced-subagents.
- Phase 2 ends when all completion notifications have arrived (or the
  declared budget elapses, whichever is first).
```

**Why this works without harness enforcement:** the same reason the strict-output preamble works for JSON-shaped Haiku output — copy-paste discipline at the exact moment the rule needs to fire is harder to forget than a rule buried in a table elsewhere in the skill. If the rule is broken anyway, the violation is now legible (the preamble was either pasted or it wasn't), which makes after-action review tractable.

---

### Phase 3 — Collect, then dispatch background synthesis

When all workers have notified completion (or timed out per §7):

1. **Collect the N structured reports.** Validate each against the schema from `balanced-subagents` §3. Flag malformed ones; do not silently regex-extract.

2. **Do not synthesize inline in the parent.** Even though the parent now has all outputs, the synthesis itself is dispatched as one background agent. This keeps the parent's context clean for the final user-facing summary and avoids accumulating N × per-agent-budget words in the parent transcript.

3. **Dispatch synthesis as a background agent.** Use the `synthesis` skill's five-step protocol, executed inside a subagent:

   ```
   subagent_type: general-purpose
   model: sonnet
   run_in_background: true
   ```

   The synthesis prompt must include:
   - All N structured worker reports inlined (drop appendices to shrink; keep top-k findings per agent).
   - The `synthesis` SKILL.md five-step protocol pasted in full (conflict audit → symptom/cause → DAG → impact×cost → runnable actions).
   - A durable output target (e.g. `docs/<topic>_synthesis.md` or `~/<project>/<area>/<topic>_synthesis.md`). Synthesis must write the report to disk before returning.
   - The strict-output preamble (from `balanced-subagents` §3) so the synthesis return value itself is parseable.

4. **Wait for synthesis completion.** Same rules as Phase 2: no polling, no peeking. Notification-driven.

5. **Consume only the synthesis output.** When synthesis returns, the parent reads only its structured report and the durable file it wrote. The parent does not re-open the raw worker reports to second-guess synthesis unless synthesis itself flagged an unresolved conflict.

6. **Deliver to the user.** The parent's final user-facing message references:
   - The durable synthesis file path.
   - The top-k action items from synthesis.
   - Any coverage gaps from Phase 2 (workers that timed out or schema-broke).

---

## The No-Peek Contract

This is the load-bearing discipline of this skill. Violating it collapses the design.

| Action | Allowed? |
|---|---|
| Read a worker's stdout before its completion notification | NO |
| Call Monitor on a worker | NO |
| Sleep then check | NO |
| Add a "watcher" subagent | NO |
| Reply to user mid-flight with worker findings | NO |
| Reply to user mid-flight with "I dispatched N agents, waiting" | YES (describe what was sent, not what they've found) |
| Prep the synthesis prompt scaffold during Phase 2 | YES |
| Pre-create the durable output filename and any shell scaffolding | YES |
| Re-partition AFTER all workers return but BEFORE synthesis | YES (rare — usually means hydration was wrong) |

If you find yourself wanting to peek, the honest move is to cancel and re-dispatch under `balanced-subagents`. Do not retroactively rationalize "I'll just check this one."

---

## Hydration Quality Checks

Cold-start fan-outs fail more often than hydrated ones. Before Phase 2, verify each agent prompt has:

- [ ] A `Prior-session context` block — even if it reads `none — cold start`.
- [ ] Hydration ≤400 words per agent.
- [ ] No `[needs research]` / `[TBD]` / `<fill in>` placeholders left from the scaffold.
- [ ] Pitfalls from prior sessions named explicitly, not paraphrased.
- [ ] File paths and commit hashes from prior sessions are absolute, not relative.
- [ ] Sessions older than 30 days tagged `STALE — verify before relying`.

If any one agent prompt fails the check, fix it before dispatching the whole fan-out. One under-hydrated agent contaminates the synthesis.

---

## Worked Example — Fire-and-collect transcript mining

Situation: same 30 MB transcript corpus as `balanced-subagents` Example A, but the user has stepped away and asked for the result on their desk by EOD.

**Phase 1 — Hydrate (parent works ~3 min):**
- For each of 6 partition keywords, run session-search; surface 1–3 prior sessions per partition.
- Embed prior schema choices (the canonical findings JSON shape from `balanced-subagents` §3), prior known-bad partition axes ("by file" failed for the 6.3 MB outlier), and known false positives.
- Pre-slice the 6.3 MB outlier with `jq` so no partition exceeds 1 MB.

**Phase 2 — Dispatch (parent waits, ~3–8 min wall time):**
- Single message containing 6 `Agent(...)` calls. All `run_in_background: true`. All Haiku (`claude-haiku-4-5-20251001`), effort `low`.
- Strict JSON schema; ≤500 words per agent.
- Parent drafts the synthesis prompt scaffold and pre-creates `docs/skill_mining_synthesis.md` as an empty file.

**Phase 3 — Collect + bg synthesis (parent works briefly, ~2 min, then waits again):**
- All 6 reports return on completion notifications. Validate schemas; 5 clean, 1 malformed → one retry per `balanced-subagents` §7, succeeds.
- Dispatch 1 Sonnet synthesis agent, `run_in_background: true`, effort `medium`, with the 6 reports inlined and the five-step protocol.
- Synthesis returns its summary and writes the durable file.
- Parent's final user-facing message: `Synthesis at docs/skill_mining_synthesis.md. Top 3 action items: ... Coverage gaps: none.`

Total parent attention: ~5–6 minutes spread across two work windows. Total wall time: ~15–20 minutes (Phase 2 dominates).

---

## Anti-Patterns Specific To This Skill

- **Polling masquerading as "checking progress."** Sleep loops, `Monitor` on workers, re-reading transcripts. Re-introduces the parent into the critical path.
- **Foreground hydration but background synthesis** (or vice versa). Commit to fire-and-collect end-to-end, or use `balanced-subagents`. Half-measures hit both downsides.
- **Inline synthesis "to save a hop."** The parent then accumulates N × per-agent-budget words plus the synthesis reasoning. The point of background synthesis is to keep that out of the parent.
- **Skipping hydration because "session-search returned nothing."** Empty return is a signal, not a license. Mark cold-start explicitly and tighten the worker prompts to compensate.
- **Hydration from sessions >30 days old without the STALE tag.** Stale context that looks current is worse than none.
- **`effort: max` on background workers.** Workers can't be steered after dispatch — high effort just inflates cost without buying interactivity.
- **Citing a prior session that doesn't exist.** session-search hits must be verified before being embedded. A hydration block that references a fictitious session contaminates every downstream finding.

---

## Red Flags — STOP and Redesign

- You're about to dispatch with `run_in_background: false` "just for this one."
- You wrote a prompt that references "wait for agent N before proceeding."
- You called `Monitor` or `sleep` on a background worker.
- You're synthesizing inline because "the workers are already done."
- Hydration block is >400 words for a single agent.
- A worker prompt cites a prior session you have not actually verified exists.
- You're tempted to read a worker's partial transcript "just to see."

Any one of these: stop, re-evaluate, switch to `balanced-subagents` if needed.

---

## Inherited Rules (do not re-litigate)

From `balanced-subagents`, unchanged:
- Decision checklist (8 items) must pass before any fan-out.
- Default ≤6 workers; partition axes; pre-processing of oversized inputs.
- Model-tier defaults: Haiku for triage, Sonnet for synthesis, Opus only with cause.
- Output budgets, JSON schema, strict-output preamble.
- Subscription-safety: no Anthropic SDK / API curl inside any subagent.
- Failure handling (§7): one retry, then surface coverage gaps.
- Serial-vs-parallel discipline: do not parallelize a pipeline.

If this skill seems to relax one of those rules, treat it as a documentation bug — `balanced-subagents` wins.

---

## Testing Status

Derivative of `balanced-subagents` (validated) plus `session-search` and `synthesis` (validated). Background-specific deltas — hydration block format, the no-peek contract, background synthesis dispatch — should be exercised on a real fan-out before being relied on for high-stakes batches. The transcript-mining example above is a faithful candidate scenario.
