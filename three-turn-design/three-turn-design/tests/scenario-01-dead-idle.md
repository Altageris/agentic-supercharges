# Scenario 01 — Dead idle state (canonical arc)

This is the scenario this skill was designed to compress. The source session took ~16 user turns; the skill's job is to ship the same outcome in 3.

## Setup

- Project with a continuous-display route (e.g. `/tv`, `/lobby`, `/kiosk`).
- An attract / idle mode component exists and has slide-rotation chrome.
- A live / active mode component exists and has empty-tile states when nobody is using the page.
- `~/.claude/design-defaults.md` or project-local equivalent is present and recent.

## User prompt

> See the screenshot at `~/Documents/screenshot.png`. This is the idle state of our display page. It feels dead — there's a big dark void in the middle and nothing's happening. Run three-turn-design on it.

(Replace the path with a real screenshot if running for real; or describe verbally if no screenshot.)

## Expected behavior per turn

### Turn 1

The skill should:
- Read the actual idle-mode component file (not assume).
- Render the existing screenshot's diagnosis in ONE sentence ("chrome-heavy, no present-tense focal point, dark center void").
- Show **two** mockups at target render scale (full TV proportions, not thumbnails) via the visual companion.
  - Option A: decorative ambient layer (orbs, particles, motion).
  - Option B: data-driven content layer (recent activity ticker, past artifacts).
- State a recommendation with one-line rationale.
- Ask exactly: "A, B, or push back?"

It should NOT:
- Ask about palette, scope, animation budget, or composition — all bundled into the recommendation.
- Render 3+ options.
- Render at thumbnail scale.
- Ask if you want the visual companion (just render).

**Expected user reply:** "A"

### Turn 2

The skill should:
- Apply palette / animation budget / memory cap from preferences silently.
- Compose the final design: ambient layer, integration point (which slide gets replaced or augmented), perf guardrails, behavior on idle vs live.
- Render ONE consolidated mockup at full target scale.
- Write a spec file under `docs/superpowers/specs/YYYY-MM-DD-*.md` and return the path.
- List 5–10 parked sub-decisions inside the spec.
- Ask exactly: "Ship as-is, or one tweak?"

It should NOT:
- Show 2+ mockups again.
- Ask about parked items.
- Surface palette/composition as separate questions.

**Expected user reply:** "Ship"

### Turn 3

The skill should:
- Implement: new component, integration, replacing the chosen slide.
- Run type check.
- Run build.
- Kill existing server PID and restart on new bundle.
- Report: files touched, build status, server URL, parked follow-ups.

It should NOT:
- Ask permission to build, restart, or kill servers.
- Pause for "did you see it?"
- Add unrequested scope.

**Expected user reply:** session done. Optionally inspect `/tv` to verify.

## Signals of compression failure

- More than 3 user-facing turns consumed.
- Any turn produces 2+ user-facing questions.
- The skill asks the user to confirm palette / perf budget / banner-close rule (all preference-file items).
- Server isn't restarted before Turn 3 concludes.
- A parked item becomes a Turn 3 question.

## What to log

See `observation-log.md`. Record each turn's:
- Number of user-facing questions
- Whether mockup scale matched target
- Whether preferences were honored silently
- Any unexpected sub-questions

## Variant prompts to try

To stress-test the skill, vary the opening:
- "It feels off but I don't know why." (no proposed direction)
- "I want ambient motion behind everything but be careful about perf." (constraint injected in prompt)
- "Same thing but also fix the live empty tile state while you're in there." (scope creep — does the skill bundle or refuse?)
