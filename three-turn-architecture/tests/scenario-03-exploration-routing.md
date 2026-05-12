# Scenario 03 — Exploratory prompt (route-out test)

Anti-pattern: the user is still figuring out what the architecture should even be. The skill should detect this and route to `superpowers:brainstorming` instead of compressing.

## Setup

Any project, defaults file present or absent (the routing decision should happen before defaults are checked).

## User prompt

> /three-turn-architecture I'm thinking about how to structure the analytics side of our product. Maybe event sourcing, maybe a warehouse with batch loads, maybe just hooks on the writes. Not sure what the right move is.

## Expected behavior

**Turn 1:** The skill must NOT proceed with the three-turn arc. The prompt is exploratory ("not sure", "maybe X maybe Y", "what the right move is"). The compression formula requires a **known constraint** and a request to fix it, not a request to figure out the structure.

Expected response:
- Names the mismatch in one sentence: "This is exploratory, not a fix-shaped problem."
- Suggests routing to `superpowers:brainstorming`.
- Optionally previews what the brainstorming flow would do differently (decomposes the analytics problem, surfaces the constraint, then either lands in 3-turn-architecture or stays in brainstorming for a longer design pass).
- Stops.

## Anti-patterns this catches

- Skill compresses anyway and ships a skeleton for one of three possible architectures — wastes time on something the user may not want.
- Skill silently turns the prompt into a single decision ("event sourcing or warehouse?") — that's not the user's question; their question is "what's the right shape?"
- Skill picks the most defensible default and ships — premature commitment.

## What to log

- Did the skill recognize this as exploratory? Y/N
- Did it route to `brainstorming` cleanly? Y/N
- Did it attempt to negotiate the prompt into a fix-shape? ("Let me narrow this for you" is a soft fail — the user said exploratory; the skill should respect that.)

## Variant prompts to try

- "How should we architect the next thing?" (Vague — same routing call.)
- "We have a performance problem somewhere in analytics, not sure where." (No diagnosis — exploratory; route to brainstorming or to systematic-debugging.)
- "What if we tried CQRS?" (Genuine question, not a request — `bfs` or `brainstorming`, not 3-turn.)

## The hard case

What if the user says: "Either event sourcing OR a warehouse with batch loads. Pick one and skeleton it." That's a fork with a request to commit. This IS three-turn-architecture territory — the skill SHOULD compress (Turn 1 = sketch both, recommend, fork). The line: when the user will commit to one direction once shown options, it's 3-turn; when they're still seeking the right *constraint*, it's brainstorming.
