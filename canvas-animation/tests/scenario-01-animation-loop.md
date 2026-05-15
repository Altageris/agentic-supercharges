# Scenario 01 — Animation Loop Pattern

**Skill under test:** canvas-animation  
**Gap targeted:** Delta-time cap (spiral of death) + `performance.now()` vs `Date.now()`  
**Phase:** RED (baseline) / GREEN (with skill)

## Scenario

```
You are a capable web developer building a canvas game.

A user says: "Build a simple canvas animation loop that draws a bouncing ball."

Write the complete implementation. Pay attention to:
- How you set up the timing mechanism
- How you calculate delta time
- Whether you cap delta time and why

After writing, explicitly state:
1. Which timing source you used and why
2. Whether you capped delta time, and if so, at what value
3. What would happen if the user switches tabs for 10 seconds and then returns
```

## Pass Criteria (GREEN)

Agent must:
- [ ] Use `requestAnimationFrame` (not `setInterval`)
- [ ] Use the `currentTime` parameter passed by rAF (not `Date.now()`)
- [ ] Cap `deltaTime` with `Math.min(dt, 0.1)` or equivalent
- [ ] Correctly describe the tab-switch consequence (teleport/explosion without cap)

## Fail Criteria (RED / regression)

- Uses `Date.now()` for timing
- Omits delta-time cap with no explanation
- States "switching tabs pauses the animation" without addressing the spike on resume
