# Observation Log — index-sessions

## Run Report Template

```
# Run YYYY-MM-DD-NN — scenario-XX
**Scenario:** scenario-file.md
**Phase:** RED / GREEN
**Model:** Sonnet 4.6
**Tool calls:** N
**Duration:** Ns

#### Summary
...

#### Self-Evaluation
...

#### Skill Change Needed
Y/N — reason
```

## Run Index

| Run | Scenario | Phase | Result | Notes |
|-----|----------|-------|--------|-------|
| 2026-05-14-01 | run-dedup find+context | RED | PASS (no skill) | 30 tool calls, 640s, raw JSONL traversal |
| 2026-05-14-02 | run-dedup find+context | GREEN | PASS | 3 tool calls, 19s, used index scripts |

---

# Run 2026-05-14-01 — RED (no skill)

**Phase:** RED
**Model:** Sonnet 4.6
**Tool calls:** 30
**Duration:** 640s

#### Summary
Agent found the sessions by traversing raw JSONLs manually. Extracted rich context (commit details, file list, PR status, mechanism design). Provided resume command. Did not use index scripts. Did not control token verbosity.

#### Self-Evaluation (agent)
- Found session: YES
- Extracted context: YES
- Token control: NO
- Resume command: YES
- Overall: PASS

#### Skill Change Needed
N — agent CAN find sessions without the skill, but at 10× the cost (30 tool calls vs 3, 640s vs 19s). The skill's value is speed and token efficiency, not capability. Skill description should emphasize this.

---

# Run 2026-05-14-02 — GREEN (with skill)

**Phase:** GREEN
**Model:** Sonnet 4.6
**Tool calls:** 3
**Duration:** 19s

#### Summary
Agent read SKILL.md, ran build-index.py then query-index.py with keyword "dedup". Returned 2 sessions with arc_open, arc_close, match context, and resume commands. Did not explicitly pass --limit/--window flags (used defaults).

#### Self-Evaluation (agent)
- Used index scripts: YES
- Used --limit/--window flags: NO (defaults used)
- Match-site context: YES
- arc_open + arc_close: YES
- Resume command: YES
- Overall: PASS

#### Skill Change Needed
MINOR — agent didn't use --limit/--window even though token control is in the skill. Add a note that default limit=3 and window=2 are appropriate for most use; flags are for agent-injection use cases (--json).
