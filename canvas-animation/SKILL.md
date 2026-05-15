---
name: canvas-animation
description: Use when building a canvas/WebGL game or simulation, debugging frame rate issues, fixing stutter or jank, implementing a game loop, or seeing symptoms like entities teleporting, physics breaking after switching tabs, or memory leaks in a canvas game.
---

# Canvas/Game Animation

## Overview

Baseline testing shows Claude handles `requestAnimationFrame`, basic delta-time, and `setInterval` diagnosis correctly without help. This skill targets the four gaps that agents consistently miss.

## Gap 1: Cap Delta-Time (Spiral of Death)

**Always cap `deltaTime`.** When a tab loses focus and regains it, or the debugger pauses, `deltaTime` can be 5–30 seconds — entities teleport, physics explodes.

```js
function gameLoop(currentTime) {
  const raw = (currentTime - lastTime) / 1000;
  const dt = Math.min(raw, 0.1); // cap at 100ms (~10fps floor)
  lastTime = currentTime;

  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}
```

## Gap 2: Use `performance.now()` from rAF, Not `Date.now()`

`requestAnimationFrame` passes `performance.now()` directly to the callback — monotonic, sub-millisecond. Don't call `Date.now()` separately; it's wall-clock and can drift.

```js
// ✅ correct
function gameLoop(currentTime) { /* currentTime IS performance.now() */ }
requestAnimationFrame(gameLoop);

// ❌ wrong
function gameLoop() { const now = Date.now(); ... }
```

## Gap 3: Systematic Stutter Diagnosis

Work through in order — stop at first confirmed cause:

| Step | Check | Tool |
|------|-------|------|
| 1 | Is loop using `setInterval`? | Read the code |
| 2 | Is `deltaTime` uncapped? | Check for `Math.min` |
| 3 | Are draw calls excessive? | DevTools Performance tab — look for long paint frames |
| 4 | Object allocation in loop? | Memory tab — sawtooth GC pattern |
| 5 | Layout thrash? | Reading `.offsetWidth` / `.getBoundingClientRect` inside draw loop |

## Gap 4: Lifecycle Cleanup Checklist

Canvas games leak when torn down carelessly. On destroy/unmount:

- [ ] `cancelAnimationFrame(rafId)` — stop the loop
- [ ] `window.removeEventListener('keydown', handler)` — remove all input listeners
- [ ] `ctx.clearRect(0, 0, canvas.width, canvas.height)` — clear the canvas
- [ ] Null out large object references so GC can collect

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| No delta-time cap | Add `Math.min(dt, 0.1)` |
| `Date.now()` inside rAF callback | Use `currentTime` param from rAF |
| Listeners added in loop | Add once, outside loop |
| Skipping `cancelAnimationFrame` on teardown | Always store and cancel `rafId` |
