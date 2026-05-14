# BFS — Test Scenarios

These scenarios verify that bfs actually delivers checkpointed, interruptible explanations without drifting into monologues or requiring unexpected user action.

## How to run a scenario

1. Open a fresh Claude Code session.
2. Paste the **User prompt** verbatim as the first message.
3. Follow the **Expected behavior** column. If the skill deviates, log it.
4. After completion, fill out `observation-log.md` for that run.

The goal is to **observe where the skill fails to checkpoint** and drive iteration.

## What to observe

For each section:

- **Checkpoint pause** — did the skill pause between sections and ask for continuation?
- **Section coherence** — does the core idea / why it exists / how it works / key parts / mental model each stand alone?
- **Topic fit** — does the explanation actually address the requested topic, or drift to generic coverage?
- **Redirection handling** — if user says "jump to key parts," does the skill skip ahead correctly?
- **Agent flag behavior** — with `--agent`, does it emit all 5 sections in one response without pauses?
- **Feedback mode** — does `--feedback` correctly append to `FEEDBACK.md` without delivering an explanation?

## Signals of a failed checkpoint

| Signal | What it means | Skill rule violated |
|---|---|---|
| No pause between sections | Checkpointing skipped | "Pause after each section" |
| 5+ sentences in core idea | Compression failed | "One sentence, no jargon" |
| Generic explanation, not topic-specific | Drift | "Address the requested topic" |
| Redirection not honored | Control lost | "Skip ahead on user command" |
| All sections in one response (no --agent flag) | Interactive mode broken | "Wait for user input" |
| Agent mode pauses for input | Flag ignored | "Suppress prompts with --agent" |
| Feedback not appended to FEEDBACK.md | Mode failed | "Append to FEEDBACK.md in feedback mode" |

## Scenarios in this folder

- `scenario-00-seedframe-transcript.md` — explain the seedframe insight (topic-specific depth test)
- `scenario-01-vision-revised.md` — explain VISION_revised.md's shift (multi-concept explanation)
- `scenario-02-redirection-mid-flow.md` — user interrupts with "jump to mental model" (redirection handling)
- `scenario-03-agent-flag.md` — invoke with `--agent` flag (batch output test)
- `scenario-04-feedback-mode.md` — invoke with `--feedback` flag (feedback appending test)
- `scenario-05-trivial-topic.md` — single-sentence concept (compression test)

## Iterating the skill

After every 3-5 runs:

1. Read `observation-log.md`.
2. Group deviations by which rule got violated.
3. Tighten the rule in `SKILL.md` or add a new failure mode.

Skill drift to watch for:
- **Skipping checkpoints** — should pause, not emit all sections at once.
- **Generic explanations** — should be topic-specific and address the actual prompt.
- **Ignoring user redirection** — should honor "jump to" and "skip to" commands.
- **Flag mishandling** — `--agent` and `--feedback` have distinct behaviors; don't mix them.
