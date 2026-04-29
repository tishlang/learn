---
title: "C6 — Game engine: Input and AABB physics"
summary: Keyboard, gamepad, axis-aligned bounding boxes.
---

## Input

A small input state object queried from systems:

```tish
const input = { left: false, right: false, up: false, down: false, jump: false }

fn setupInput() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { input.left = true }
    if (e.key === "ArrowRight") { input.right = true }
    if (e.key === "ArrowUp") { input.up = true }
    if (e.key === "ArrowDown") { input.down = true }
    if (e.key === " ") { input.jump = true }
  })
  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") { input.left = false }
    if (e.key === "ArrowRight") { input.right = false }
    if (e.key === "ArrowUp") { input.up = false }
    if (e.key === "ArrowDown") { input.down = false }
    if (e.key === " ") { input.jump = false }
  })
}

fn playerSystem(world, dt) {
  const ps = world.all("playerControl")
  let i = 0
  while (i < ps.length) {
    const id = parseInt(ps[i][0], 10)
    const v = world.get(id, "velocity")
    if (input.left) { v.x = -200 }
    else if (input.right) { v.x = 200 }
    else { v.x = 0 }
    if (input.jump && world.get(id, "playerControl").grounded) {
      v.y = -500
      world.get(id, "playerControl").grounded = false
    }
    i = i + 1
  }
}
```

Gamepad: `navigator.getGamepads()` exposes connected controllers. Read it in the input system; treat axes ≥ 0.5 as held.

## AABB collision

Each "solid" entity has `position` + `aabb: { w, h }`. Two boxes overlap when both x ranges and y ranges overlap.

```tish
fn aabbOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}
```

## Resolve in two passes

Move on X, resolve X collisions; move on Y, resolve Y. Solves the corner-clipping artifact of one-pass resolution.

```tish
fn collideAndMove(world, dt) {
  const movers = world.all("velocity")
  let i = 0
  while (i < movers.length) {
    const id = parseInt(movers[i][0], 10)
    if (!world.has(id, "position") || !world.has(id, "aabb")) { i = i + 1; continue }
    const p = world.get(id, "position")
    const v = movers[i][1]
    const a = world.get(id, "aabb")

    // X pass
    p.x = p.x + v.x * dt
    let solids = world.all("solid")
    let j = 0
    while (j < solids.length) {
      const sid = parseInt(solids[j][0], 10)
      const sp = world.get(sid, "position")
      const sa = world.get(sid, "aabb")
      if (aabbOverlap(p.x, p.y, a.w, a.h, sp.x, sp.y, sa.w, sa.h)) {
        if (v.x > 0) { p.x = sp.x - a.w }
        else if (v.x < 0) { p.x = sp.x + sa.w }
        v.x = 0
      }
      j = j + 1
    }
    // Y pass
    p.y = p.y + v.y * dt
    j = 0
    while (j < solids.length) {
      const sid = parseInt(solids[j][0], 10)
      const sp = world.get(sid, "position")
      const sa = world.get(sid, "aabb")
      if (aabbOverlap(p.x, p.y, a.w, a.h, sp.x, sp.y, sa.w, sa.h)) {
        if (v.y > 0) {
          p.y = sp.y - a.h
          if (world.has(id, "playerControl")) { world.get(id, "playerControl").grounded = true }
        } else if (v.y < 0) { p.y = sp.y + sa.h }
        v.y = 0
      }
      j = j + 1
    }
    i = i + 1
  }
}
```

That's a working platformer-style physics. Add gravity by giving the player a constant downward acceleration in the motion system.

:::quiz{id=cap-game-03-q1}
- prompt: Why resolve collisions in two passes (X then Y)?
- options: ["Performance", "Avoids the corner-clipping artifact of one-pass resolution", "It's the only way"]
- answer: Avoids the corner-clipping artifact of one-pass resolution
:::
