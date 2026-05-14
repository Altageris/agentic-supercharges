---
name: three-turn-design
description: Use when the user wants UI work shipped with minimal back-and-forth — they describe what feels broken and the skill drives Diagnose → Compose → Ship in exactly three user-facing turns. Requires a `design-defaults.md` preferences file so the skill can act on binding rules instead of asking. Refuses to extend past three turns; bundles, defaults, and parks rather than negotiating. Not for open-ended exploration — use `superpowers:brainstorming` for that.
---

# Three-Turn Design

A compression of `superpowers:brainstorming` into three user-facing turns: **Diagnose → Compose → Ship**.

The skill assumes the user has declared preferences once and now wants execution, not collaboration. It refuses to add a fourth turn — if a fourth would be needed, the skill chooses a default, parks the question in the spec, and ships.

## When to invoke

- The user describes UI work as a problem ("this feels dead", "lacks something", "looks off") and wants a fix shipped.
- The user signals speed: "quickly", "rough cut", "first pass", "give me a draft", "I don't want to think about every detail".
- A `~/.claude/design-defaults.md` (or per-project equivalent) exists and is recent.
- The codebase is readable — the skill can ground itself in the actual code before designing.

## When to refuse

- No preferences file exists. Refuse with: "I can't run three-turn-design without a preferences file. Want me to scaffold one?" — that scaffolding is *not* one of the three turns.
- The work is exploratory ("what should we even build?"). Route to `superpowers:brainstorming`.
- The user is in the conversation seat and wants to weigh in on each fork. Three-turn-design is wrong for that mode.

## The three turns

### Turn 1 — Diagnose & visual fork

Before responding, the skill:
1. Reads the relevant code as ground truth (the actual file, not assumptions).
2. Reads `design-defaults.md` and any project-specific overrides.
3. Names what's there and what's missing in **one sentence**.
4. Renders **2–4 mockups** depending on how many genuinely distinct directions the problem warrants. Use judgment:
   - **2 mockups** — one clear fork (structure vs. style, layout vs. palette)
   - **3 mockups** — two independent axes both worth exploring (e.g., layout × density)
   - **4 mockups** — rich design space where more options add real signal; don't pad to 4 for padding's sake
   - Render at target scale. No thumbnails.
5. States a recommendation with a one-line rationale — then **commits to it**.
6. Closes with one of:
   - **"Proceeding with [X] — push back if you want a different direction."** *(default — agent commits to one)*
   - **"Implementing all [N] — they're cheap enough to ship together. Push back to pare down."** *(use when all options are low-cost and genuinely complementary, not competing)*

**Implement-all rule:** only offer implement-all when the options are additive (e.g., animation variants that can coexist, CSS class alternatives that don't conflict) — never when they represent competing structural approaches. Implementing competing approaches and letting the user pick post-ship defeats the purpose of the fork.

This is not a question. It is a committed decision with an escape hatch. The user's silence = consent.

Do NOT ask "A, B, or push back?" — that re-opens the fork as a menu and burns a turn on a decision the skill already made.

**What counts as a valid push back (redirect to Turn 1 redux):**
- "Go with A instead" / "I prefer the other one"
- "Neither — here's what I actually want: …"
- "Don't implement all, just do X"
- Any explicit rejection of the committed direction

**What does NOT count as a push back (proceed to Turn 2):**
- "Looks good" / "sounds right" / silence / emoji
- A question about a parked item ("what about the palette?") — answer it in one sentence and proceed
- Positive feedback with a side note — treat the side note as a park, not a redirect
- "Interesting, but what about X?" — X goes in the spec as a parked item; proceed

Bundled into the recommendation (not surfaced as separate questions):
- Palette
- Scope (single state vs universal)
- Integration point (which slide, which container)
- Composition layout
- Animation timing

Forbidden:
- More than 4 mockups — if you need 5+ the problem isn't scoped
- Sub-questions ("decorative or data-driven? then palette? then scope?")
- Asking "should I show you mockups?" — just render them
- Thumbnails followed by "let me show full-size" — render full-size first
- Asking "A, B, or push back?" — the recommendation IS the decision; don't re-ask
- Ending Turn 1 with a question mark when the recommendation is already clear
- Offering implement-all for competing structural approaches

### Turn 2 — Compose & write spec

After the user confirms, stays silent, or pushes back once (push back = Turn 1 redux, still counts as Turn 1):

1. Apply all preference defaults silently.
2. Render **one** consolidated mockup at full target scale — palette, hero, integration, perf budget all visible.
3. Write the spec to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`.
4. Park 5–10 sub-decisions as items in the spec, not as questions to the user.
5. Close with: "Shipping this — name one tweak if you want it, otherwise I'll proceed."

This is not a question. Default is ship. The user's silence = ship. A named tweak is applied inline before shipping; it does not open a new turn of negotiation.

Forbidden:
- Showing 2+ mockups again (we already forked)
- Asking about parked items
- Requesting permission to overwrite an existing similar component
- Reopening a settled decision
- Asking "Ship as-is, or one tweak?" as an open question — the default is already ship

### Turn 3 — Ship

After the user says "ship" or names one tweak:

1. Implement the change.
2. Run `tsc --noEmit` (or project-equivalent type check).
3. Run the build.
4. Kill the running server (if any) and restart it.
5. Report: files touched (count + key paths), URL to verify, parked follow-ups (listed, not asked about).

Forbidden:
- Pausing for "did you see it?" verification
- Asking for permission to rebuild or restart
- Surfacing a parked item as a new question
- Adding scope ("while I was in there I also fixed…")

## Compression rules

The skill is allowed exactly **three user-facing turns** between "start" and "ship." If a fourth would be required:

- Choose the most defensible default.
- Document it as a parked item in the spec with one-line rationale.
- Proceed to the next turn.

Bundled decisions, not menus. Recommendations, not options. Defaults, not questions.

**A recommendation followed by a choice question is not a recommendation — it is a menu with extra steps. Make the decision. State it. Move.**

## Required: `design-defaults.md`

The skill reads this on entry. Without it, the skill cannot be opinionated enough and the compression fails. See `design-defaults-template.md` in this skill folder for the format.

The file declares (at minimum):
- **Palette discipline** — single-brand, two-color, multi-color
- **Animation budget** — CSS-only, JS allowed, hard memory ceiling
- **Server-management cadence** — rebuild + restart after dashboard changes
- **Verification habits** — build before claiming done, kill old PIDs
- **Banner / popup rule** — every overlay has a close button
- **State-mutation policy** — API routes vs direct DB
- **Grace-notes pass** — final review for motion, easing, transitions
- **Anti-patterns** — things the skill must never do (e.g., screenshot the browser, edit prod data)

## Why this works

In sessions this skill is meant to replace, roughly one-third of user turns were:
- Constraint inputs (perf budget, banner-close, build cadence) that could be pre-declared
- Verification corrections ("rebuild missed", "render too small", "I don't see it")
- Tangent triage (adjacent-system bugs surfaced and parked mid-session)

Eliminate those buckets and the remaining six taste calls collapse into 2–3 bundled decisions. Net: ~3 user-facing turns to ship.

The compression formula:
> **Opinionated defaults + binding preferences + single-fork-per-turn** > consultative iteration.

## Testing

See `tests/README.md` for how to run scenarios and log observed agent behavior. Test scenarios live in `tests/`. Iterate the skill by reading observation logs and tightening the rules whenever real runs needed a fourth turn or surfaced unrequested questions.
