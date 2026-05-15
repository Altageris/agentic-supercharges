# minor-release-patch — test scenarios

Each scenario exercises one coordination rule. Run them in a fresh session, follow the prompts in order, and log every deviation in `observation-log.md`.

## How to run

1. Pick a scenario file. Read its **Setup** section — note which defaults files should be present or absent.
2. Open a fresh session in any readable project.
3. Paste the scenario's **User prompt** verbatim.
4. Follow the **Expected user reply** lines exactly when the skill asks one question.
5. After the session, append a run report to `observation-log.md` using the template there.

## What the scenarios cover

| Scenario | Tests |
|---|---|
| 00-easy-first-ordering | Dependency ordering: arch → design → perf must win over easy-first (layout → perf → arch) |

## Planned scenarios

| Scenario | What to test |
|---|---|
| 01-single-domain-routing | Single-domain request must delegate to sub-skill directly — no wrapping overhead |
| 02-minor-scope-gate | Track exceeding ~5 files must be parked as Release 2 ticket, not refused entirely |
| 03-perf-escalates-to-arch | No-dominant-hotspot signal must escalate to arch track, not propose a local fix |
| 04-design-before-arch-caught | If user orders design before arch, skill must enforce dependency order with rationale |
| 05-missing-design-defaults | Design track without `design-defaults.md` must refuse that track (not the whole patch) |

## Anti-pattern signals to watch for

Across every scenario, log if the skill:

- Sequenced by reversibility (easy/safe first) instead of dependency (arch first)
- Treated a single-domain request as multi-domain and added wrapping overhead
- Parked an entire patch when only one track exceeded minor scope
- Merged artifacts from different tracks into one diagram (design mockup + arch sketch in same block)
- Asked more than one question per turn
- Resurfaced a parked item as a question in Turn 3
- Continued to other tracks after a perf escape Turn 3 fired without user confirmation
- Added scope outside the named tracks

Repeated drifts → tighten the rule in `SKILL.md`. Append a `Skill change` entry to the observation log.
