---
title: "C6 — Game engine: Ship a platformer"
summary: A tiny demo that uses every piece — exportable as a static site.
---

The pieces: world (ECS), renderer, input + physics, scene manager. The demo: a one-screen platformer.

## Demo plan

- 1 player entity with `position`, `velocity`, `aabb`, `sprite`, `playerControl`.
- N solid platform entities.
- 1 goal entity. Touching it pushes a `winScene`.
- Falling off the bottom replaces the play scene with `gameOverScene`.

```tish
fn buildPlayScene() {
  return createScene("play", () => {
    const world = createWorld()
    world.addSystem((w, dt) => motionSystem(w, dt))
    world.addSystem((w, dt) => playerSystem(w, dt))
    world.addSystem((w, dt) => collideAndMove(w, dt))
    world.addSystem((w, dt) => goalSystem(w, dt))

    // Player
    const p = world.entity()
    world.add(p, "position", { x: 50, y: 50 })
    world.add(p, "velocity", { x: 0, y: 0 })
    world.add(p, "aabb", { w: 24, h: 32 })
    world.add(p, "playerControl", { grounded: false })
    world.add(p, "sprite", { src: "atlas.png", sx: 0, sy: 0, sw: 24, sh: 32, anchor: { x: 0, y: 0 } })

    // Floor
    let i = 0
    while (i < 12) {
      const t = world.entity()
      world.add(t, "position", { x: i * 32, y: 360 })
      world.add(t, "aabb", { w: 32, h: 32 })
      world.add(t, "solid", true)
      world.add(t, "sprite", { src: "atlas.png", sx: 32, sy: 0, sw: 32, sh: 32, anchor: { x: 0, y: 0 } })
      i = i + 1
    }

    return world
  })
}
```

The full demo is too long for one chapter — sequence the pieces in a `main.tish`, glue them up, ship.

## Build & ship

`tish build main.tish -o game.js --target js`. Drop the JS into a tiny HTML page that mounts the canvas. Use the C3 zip pattern to bundle `game.html` + `game.js` + `atlas.png` + sounds; download as `mygame.zip`.

Open in a real browser, drag the unzipped folder onto Netlify or GitHub Pages → live URL.

## Where to grow

- **Tilemap** loader (read TMX / JSON, instantiate solids from the grid).
- **Sprite animation** component: `{ frames: [...], current, accumTime }` — advance each tick.
- **Camera**: a transformation in the render system that subtracts `camera.x, camera.y` before drawing.
- **Music**: looping `AudioBufferSourceNode` for the level theme.
- **Particles** (per Snake) for jumps, deaths, collectibles.

Each is a small new component + system — that's the ECS payoff.

:::callout{kind=tip title="Why ECS for tiny games?"}
For one-developer games, the ECS upfront cost (~200 lines) pays off the moment you add a second enemy type or a power-up. Adding a feature is "new component + new system, never new class hierarchy."
:::

:::quiz{id=cap-game-05-q1}
- prompt: How do you ship a tish-built game as a single deployable thing?
- options: ["tish build --target js, bundle in HTML, download as zip, drop on a static host", "Email people the source", "Run a Tish server"]
- answer: tish build --target js, bundle in HTML, download as zip, drop on a static host
:::

That's the engine and the demo. From here, every game-design idea reduces to "what new component, what new system?"
