---
name: stakeholder
description: Run evidence-backed stakeholder reviews of evolving systems, prototypes, creative pipelines, experiments, launches, or technical plans. Use when the user invokes /stakeholder or asks for a stakeholder review, system review, quality review, risk review, product/technical assessment, decision memo, or next-investment recommendation grounded in artifacts and observed behavior.
---

# Stakeholder Review

## Core Contract

Produce a pragmatic stakeholder review, not a status summary. Anchor claims in observed artifacts, command results, screenshots, manifests, logs, code, or generated outputs. Clearly separate:

- Verified facts: what was directly inspected or run.
- Inferences: what the evidence suggests.
- Judgments: quality, risk, readiness, or investment recommendations.
- Unknowns: what still needs validation.

Prefer direct, decision-useful language. Avoid optimism that is not supported by evidence.

## Workflow

1. Identify the stakeholder decision.
   - What must be decided now: continue, pause, invest, pivot, ship, repair, compare, or collect more data.
   - Who the review is for: user/operator, technical owner, product stakeholder, reviewer, or future agent.

2. Gather evidence.
   - Read the smallest relevant artifacts first: manifests, scorecards, logs, hub/viewer state, screenshots, recent outputs, test results, and source files.
   - If evidence is stale or missing, say so. Do not present memory or assumptions as current verification.

3. Assess the system in stakeholder categories.
   - Value: what the system can now do that matters.
   - Quality: output quality, reliability, repeatability, and failure modes.
   - Operability: one-command paths, metadata, privacy, cost, observability, and recovery.
   - Risk: safety, privacy, legal/policy, data quality, model dependency, and user-friction risk.
   - Leverage: which next changes compound future progress.

4. Score only when useful.
   - Use a 1-5 score for dimensions that are actually observable.
   - Include short evidence notes for every score.
   - If a score would be speculative, mark it `not scored`.

5. Recommend next actions.
   - Lead with the highest-leverage next move.
   - Keep actions concrete and sequenced.
   - Separate quick wins from architecture/model changes.

## Output Shape

Use this shape unless the user asks for a different format:

```markdown
**Stakeholder Decision**
One sentence naming the decision this review supports.

**Current State**
Short factual summary of what exists and what was verified.

**Assessment**
- Value:
- Quality:
- Operability:
- Risk:
- Leverage:

**Scorecard**
| Dimension | Score | Evidence |
| --- | ---: | --- |
| ... | ... | ... |

**Recommendation**
Short ordered list of next moves.

**Unknowns**
Any important evidence gaps.
```

## Review Standards

- Put weak assumptions under `Unknowns`.
- Name concrete artifacts when available.
- Call out whether an output is production-ready, demo-ready, research-useful, or only diagnostic.
- Preserve useful failures as data when they reveal model behavior or pipeline behavior.
- Do not let a working pipeline imply quality is solved.
- Do not recommend a larger model or new architecture unless the current evidence shows the current path cannot meet the quality bar.
- For creative generation systems, distinguish controllability from prompt steering. A model that follows text metadata is not equivalent to a model with hard pose/depth/mask/reference control.

## Optional Reference

Read `references/scorecard-template.md` when a structured scoring table or reusable review artifact is needed.
