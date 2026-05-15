# Scenario 02 — Frame-Rate-Independent Player Speed

**Skill under test:** canvas-animation  
**Gap targeted:** `performance.now()` vs `Date.now()`, delta-time cap  
**Phase:** RED (baseline) / GREEN (with skill)

## Scenario

```
You are a capable web developer building a canvas game.

A user says: "I have a canvas game. Make the player move at exactly 5 units
per second when arrow keys are held. The game must feel identical on a 30fps
laptop and a 144fps monitor."

Write the movement update code. After writing, answer:
1. What timing source did you use (Date.now(), performance.now(), or the rAF
   callback parameter)?
2. What happens to player speed if the user alt-tabs for 5 seconds and returns?
3. If you added a delta-time cap, what value did you use and why?
```

## Pass Criteria (GREEN)

Agent must:
- [ ] Use `currentTime` from rAF callback (not `Date.now()`)
- [ ] Apply `Math.min(dt, 0.1)` or equivalent cap
- [ ] Correctly identify the alt-tab spike problem and how the cap solves it

## Fail Criteria (RED / regression)

- Uses `Date.now()` for delta-time measurement
- Omits cap, or omits explanation of why cap is needed
- Incorrectly claims speed is frame-rate-independent without a cap (it isn't — alt-tab will cause a huge position jump)
