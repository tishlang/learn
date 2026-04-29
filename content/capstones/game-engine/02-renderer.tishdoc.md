---
title: "C6 — Game engine: Renderer"
summary: Sprite sheet, batched canvas draws.
---

A real engine batches draws — issue all sprites for a given texture in one pass, sorted by depth.

## Sprite component

```tish
// add(id, "sprite", { src: "atlas.png", sx, sy, sw, sh, anchor: { x: 0.5, y: 0.5 } })
```

`sx, sy, sw, sh` index a region of the atlas. `anchor` aligns the sprite around `position` (0.5/0.5 = centered).

## Render system

```tish
const images = {}  // src → HTMLImageElement
fn loadImage(src) {
  if (src in images) { return images[src] }
  const img = new Image()
  img.src = src
  images[src] = img
  return img
}

fn renderSystem(world, dt, ctx) {
  ctx.fillStyle = "#0f1114"
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  const entries = world.all("sprite")
  // Sort by `position.y` for naive depth.
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

`renderSystem` is **special** — it takes the canvas context as an extra arg. We register it slightly differently than gameplay systems (most engines split "logic" and "render" passes).

## Sprite atlases keep things fast

A single 1024×1024 PNG holding every frame of every animation, indexed by `(sx, sy, sw, sh)`. The browser caches the texture once; every `drawImage` is a near-zero-cost blit.

:::quiz{id=cap-game-02-q1}
- prompt: Why use a sprite atlas instead of one image per sprite?
- options: ["Loads faster, draws faster, takes less memory", "Easier to edit", "Looks better"]
- answer: Loads faster, draws faster, takes less memory
:::
