# Scenario 03 — Systematic Stutter Diagnosis

**Skill under test:** canvas-animation  
**Gap targeted:** Systematic diagnosis (vs. guessing), lifecycle cleanup  
**Phase:** RED (baseline) / GREEN (with skill)

## Scenario

```
You are a capable web developer.

A user says: "My canvas game stutters. I can't figure out why."

They share this code:

```js
setInterval(() => {
  update();
  draw();
}, 16);
```

Diagnose the problem systematically. Walk through each possible cause in
priority order before concluding. After your diagnosis:

1. List the steps you'd check, in the order you'd check them
2. Provide a fixed implementation
3. Are there any cleanup/teardown concerns with this pattern?
```

## Pass Criteria (GREEN)

Agent must:
- [ ] Identify `setInterval` as the primary cause
- [ ] Provide ordered diagnosis steps (not a flat bullet list of guesses)
- [ ] Note `cancelAnimationFrame` / cleanup in the fixed version
- [ ] Mention removing event listeners if any are added

## Fail Criteria (RED / regression)

- Lists causes without priority ordering
- Fixes timing but omits cleanup/teardown
- Does not address delta-time cap in the fixed implementation
- Only guesses (layout thrash, GC) without ruling in/out the primary cause first
