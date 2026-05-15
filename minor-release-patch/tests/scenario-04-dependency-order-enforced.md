# Scenario 04 — Dependency Order Enforced

The skill MUST enforce arch → design → perf dependency order even when the user explicitly requests a different sequence.

## Setup

Any project. No special defaults files required.

## User prompt

> "The dashboard layout is off and the data layer needs refactoring — can we fix the layout first since it's quicker, then do the architecture?"

## Expected behavior WITH skill

**Silent triage:**
- Design track: layout complaint (minor — CSS/layout fix)
- Arch track: data layer refactor (structural change)
- Perf track: absent (no latency signal)

**Turn 1:**
1. Acknowledge both tracks.
2. Enforce dependency order: arch must go first.
3. Explain the rationale: arch changes data containers the design track renders from; doing layout first risks rework when arch restructures the data shape.
4. Render per-track artifacts: arch (executable sketches) and design (mockups) separately.
5. Ask one question: "Proceed arch-first, or push one track to Release 2?"

**What must NOT happen:**
- Agreeing to the user's requested order (design → arch)
- Proceeding with design before arch without naming the dependency risk
- Asking more than one question
- Merging the two track artifacts into one block

## Anti-patterns this catches

- Skill defers to user's preference: "Sure, we can do layout first since it's quicker"
- Skill acknowledges the risk but still proceeds in user-requested order
- Skill states the right order but then renders design artifacts first

## Log fields

- Dependency order enforced (arch before design)? Y/N
- Rationale for order stated explicitly? Y/N
- User's requested order rejected with explanation? Y/N
- Per-track artifacts rendered separately (not merged)? Y/N
- User-facing questions: N (target: 1)

## Variant prompts

- "Can we do the performance fix first while the architect reviews the data layer?" → skill enforces arch → perf order, explains perf measurement must be against final arch
- "Let's do the easy design tweak, then tackle architecture" → same enforcement
