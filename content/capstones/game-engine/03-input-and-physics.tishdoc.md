---
title: "C6 — Game engine: Input and AABB physics"
summary: Keyboard, gamepad, axis-aligned bounding boxes.
---

Physics in games is ninety percent bookkeeping: integrate velocity, clamp to solids, propagate grounded flags so jump feels intentional. ECS shines here—you query `(playerControl, velocity, aabb)`, adjust numbers, leave rendering alone.

We'll keep collision **axis-aligned** (AABB: axis-aligned bounding box). No rotated rectangles—overlap tests are four comparisons. Good enough for platformers until you ship slopes as a deliberate sequel.

## Input as polled state, not events inside systems

`keydown` / `keyup` are events; gameplay wants a **snapshot** each frame: "is left held?". A tiny global (or object owned by the game shell) flips booleans. Systems read `input.left`—they do not subscribe to DOM events themselves. That keeps simulation deterministic and testable.

```tish
const input = { left: false, right: false, jump: false }

fn setupInput() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { input.left = true }
    if (e.key === "ArrowRight") { input.right = true }
    if (e.key === " ") { input.jump = true }
  })
  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") { input.left = false }
    if (e.key === "ArrowRight") { input.right = false }
    if (e.key === " ") { input.jump = false }
  })
}
```

## `playerSystem`: intent → velocity

We only touch entities tagged `playerControl`. Horizontal movement sets `velocity.x`; jump applies an impulse **only** when `grounded` is true—classic coyote-time and buffering are upgrades for later.

```tish
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

`grounded` flips true again when collision resolution discovers the player standing on a solid—see below.

## AABB overlap (one test, reused everywhere)

Each solid stores `position` plus `aabb: { w, h }`. Two boxes overlap iff their **x intervals** overlap **and** their **y intervals** overlap—no square roots, no trig.

```tish
fn aabbOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}
```

## Why resolve in two passes (X, then Y)

If you move diagonally into a corner in one gulp, you can clip through the seam between two tiles. **Separate axes**: integrate and resolve X against solids, then Y. When landing on a floor, the Y pass sets `grounded = true` so the next jump is allowed.

The full `collideAndMove` loop is long on the page because it is repetitive—same inner pattern for the X sweep and the Y sweep. Conceptually:

1. For each moving body with `velocity`, `position`, `aabb`:
2. **X pass:** `p.x += v.x * dt`; for each solid, if overlapping, nudge `p.x` out on the correct side and zero `v.x`.
3. **Y pass:** same for `y` / `v.y`; if landing from above, set `grounded`.

```tish
// Shape of the inner loop (X pass) — repeated per solid:
// if (aabbOverlap(...)) {
//   if (v.x > 0) { p.x = sp.x - a.w }   // hit right face while moving right
//   else if (v.x < 0) { p.x = sp.x + sa.w }
//   v.x = 0
// }
```

Gravity belongs in a small system **before** collision (increment `velocity.y` each tick for the player), or folded into the same pass depending how you split files—the Playground at the end of this track uses one clear ordering so nothing double-integrates.

## Gamepads (one sentence, one API)

`navigator.getGamepads()` returns connected controllers; read axes and buttons in the same place you read `input.left`, mapping stick deflection past a threshold to those booleans. Same snapshot model.


:::quiz{id=cap-game-03-q1}
- prompt: Why resolve collisions in two passes (X then Y)?
- options: ["Performance", "Avoids the corner-clipping artifact of one-pass resolution", "It's the only way"]
- answer: Avoids the corner-clipping artifact of one-pass resolution
:::
