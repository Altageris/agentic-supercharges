# anonymize - test scenarios

Run these scenarios in a fresh session and log every drift in `observation-log.md`.

## Prerequisite: load `/exp`

Before running any scenario in this folder:

1. Install or copy the `exp` skill into your active client skill directory.
2. Reload the client config so `/exp` is discoverable in a fresh session.
3. Verify `/exp` responds before starting the anonymize prompt.

The goal is to test the pairing:

- primary skill does the work
- `/exp` re-anchors from the completed work
- `/exp` names the next unresolved surface without reopening settled edits

## How to run

1. Pick a scenario file and satisfy the **Setup** section.
2. Open a fresh session in the target project.
3. Set `live_subagent_creation` from the scenario header.
4. Paste the scenario's **User prompt** verbatim.
5. Follow the **Expected user reply** lines exactly.
6. When the scenario calls for `/exp`, send that as the next user message in the same session.
7. Append a run report to `observation-log.md`.

## What the scenarios cover

| Scenario | Tests |
|---|---|
| 00-credential-redaction | Redacts secrets, paths, and domain terms while preserving the logic pattern |
| 01-doc-anonymization | Redacts code comments and prose explanations without flattening the instructional pattern |
| 02-over-redaction-guard | Keeps generic logic readable instead of turning the output into placeholder soup |
| 03-exp-reanchor | `/exp` should point to the next unresolved leakage surface instead of reopening already-settled replacements |

## Anti-pattern signals to watch for

Across every scenario, log if the skill:

- Leaves one real credential, host, username, or path behind
- Redacts control flow or data shape instead of only sensitive identifiers
- Uses inconsistent placeholder names for the same concept
- Over-explains the pattern instead of shipping a compact shareable example
- Uses `/exp` to reopen already-correct substitutions instead of naming one unresolved adjacent seam
- Ignores the `live_subagent_creation` toggle

Repeated drifts mean `SKILL.md` or the scenario itself needs tightening. Append a `Skill change` entry to the observation log when you update the skill.
