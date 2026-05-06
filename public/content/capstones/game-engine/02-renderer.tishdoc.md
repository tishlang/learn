---
title: "C6 — Game engine: Renderer"
summary: Sprite sheet, batched canvas draws.
---

Canvas is a stateful, immediate-mode API—every frame you repaint the world—which sounds wasteful until you remember most 2D sprites are a handful of textured quads. What actually burns performance is **thrashing**: rebinding textures, switching blend modes, scattering tiny draws. Atlases and sorting exist to keep calls coherent.

This chapter connects **ECS data** to **pixels**: a `sprite` component describes *what* to draw; a `renderSystem` walks the sprite column, sorts for depth, and issues `drawImage` calls. Gameplay systems never touch the canvas—they only mutate components the renderer reads.

## What the renderer needs from ECS

- **`position`** — where to draw (world space).
- **`sprite`** — which image, which rectangle inside that image (`sx, sy, sw, sh`), and an **anchor** so "position" means feet, center, or head consistently.

If an entity has a sprite but no position, we fall back to `(0,0)` in the sample code—you would tighten that in a real engine.

## The `sprite` component (data only)

No methods—just a record the artist (or tooling) fills in:

```tish
// Example attachment:
// world.add(id, "sprite", {
//   src: "atlas.png",
//   sx: 0, sy: 0, sw: 24, sh: 32,
//   anchor: { x: 0.5, y: 1.0 }   // feet at position
// })
```

`anchor.x` / `anchor.y` are **fractions of the sprite width/height**. `(0.5, 0.5)` centers the bitmap on the point; `(0, 0)` top-left; `(0.5, 1)` is common for platformers so the ground contact aligns with `position.y`.

## Loading images once

Browsers decode asynchronously. A tiny cache maps `src` → `HTMLImageElement` so the render pass does not allocate new `Image()` objects every frame—only the first time each atlas URL appears.

```tish
const images = {}
fn loadImage(src) {
  if (src in images) { return images[src] }
  const img = new Image()
  img.src = src
  images[src] = img
  return img
}
```

`img.complete` tells you whether the first paint can happen this frame; until then you skip or draw a placeholder.

## The render pass (shape, not magic)

1. Clear the framebuffer (solid color).
2. Collect every entity with a `sprite` component.
3. Sort by a depth key—here we use `position.y` so lower objects draw later and appear "in front" in a side view (naive but predictable).
4. For each entry, `drawImage` from atlas sub-rect to world position minus anchor offset.

```tish
fn renderSystem(world, dt, ctx) {
  ctx.fillStyle = "#0f1114"
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  const entries = world.all("sprite")
  entries.sort((a, b) => {
    const idA = parseInt(a[0], 10)
    const idB = parseInt(b[0], 10)
    const py = world.has(idA, "position") ? world.get(idA, "position").y : 0
    const py2 = world.has(idB, "position") ? world.get(idB, "position").y : 0
    return py - py2
  })
  let i = 0
  while (i < entries.length) {
    const id = parseInt(entries[i][0], 10)
    const sp = entries[i][1]
    const p = world.has(id, "position") ? world.get(id, "position") : { x: 0, y: 0 }
    const img = loadImage(sp.src)
    if (img.complete) {
      const ax = sp.sw * sp.anchor.x
      const ay = sp.sh * sp.anchor.y
      ctx.drawImage(img, sp.sx, sp.sy, sp.sw, sp.sh, p.x - ax, p.y - ay, sp.sw, sp.sh)
    }
    i = i + 1
  }
}
```

`renderSystem` takes `ctx` as an extra argument—**render passes are special** in most engines: they run after simulation, read mostly-read-only component snapshots, and talk to GPU or canvas APIs. Gameplay systems stay pure-ish logic.

## Why atlases?

A single 1024×1024 sheet holding every tile and animation frame means **one** decode, **one** texture cache entry, and many cheap blits. Separate PNGs per sprite multiply loads and state changes. Artists export one atlas; code indexes rectangles—same idea as CSS spritesheets on the web.

You will wire this renderer into the same `world.tick` loop in the final chapter's Playground, alongside physics—order matters: simulate, then draw.


:::quiz{id=cap-game-02-q1}
- prompt: Why use a sprite atlas instead of one image per sprite?
- options: ["Loads faster, draws faster, takes less memory", "Easier to edit", "Looks better"]
- answer: Loads faster, draws faster, takes less memory
:::
