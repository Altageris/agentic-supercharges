# Scenario 03 — Open exploration (route-out test)

Anti-pattern: the user is still figuring out what they even want. The skill should detect this and route to `superpowers:brainstorming` instead of compressing.

## Setup

Any project, preferences file present or absent (the routing decision should happen before preferences are checked).

## User prompt

> I'm thinking about adding some kind of social layer to our display. Maybe profiles, maybe a leaderboard, maybe just a participant list. Not sure what the right move is. Can you do a three-turn pass on it?

## Expected behavior

**Turn 1:** The skill must NOT proceed with the three-turn arc. The prompt is exploratory ("not sure", "maybe X maybe Y", "what the right move is"). The compression formula requires a known problem and a request to fix it, not a request to figure out what to build.

Expected response:
- Names the mismatch in one sentence: "This is exploratory, not a fix."
- Suggests routing to `superpowers:brainstorming`.
- Optionally previews what the brainstorming flow would do differently (clarifying questions, scope decomposition, multiple approaches).
- Stops.

## Anti-patterns this catches

- Skill compresses anyway and ships a one-of-three-things implementation — wastes the user's time on something they may not want.
- Skill silently turns the prompt into a single decision ("profiles or leaderboard?") — that's not the user's question; their question is "what should I build?"
- Skill picks the most defensible default ("a profiles page") and ships it — premature commitment.

## What to log

- Did the skill recognize this as exploratory? Y/N
- Did it route to `brainstorming` cleanly? Y/N
- Did it attempt to negotiate the prompt into a fix-shape? (e.g. "let me narrow this for you") — that's a soft fail; the user said exploratory, the skill should respect that.

## Variant prompts to try

- "Build something fun for the display." (vague creative request — same routing call.)
- "Make the display feel better." (no diagnosis, no constraint — exploratory.)
- "What if we added X?" (genuine question, not a request — `bfs` or `brainstorming`, not 3-turn.)

## The hard case

What if the user says: "I want ambient motion behind everything OR a participant identity layer. Pick one and ship it." That's a fork with a request to commit. This IS three-turn-design territory — the skill SHOULD compress (Turn 1 = visualize both, recommend, fork). The line: when the user is willing to commit to one direction once shown options, it's 3-turn; when they're still seeking the right *problem*, it's brainstorming.
