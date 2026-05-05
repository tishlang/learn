---
title: "C6 — Game engine: Ship a platformer"
summary: A tiny demo that uses every piece — exportable as a static site.
---

Think of this chapter as Show & Tell hour: assemble the platformer loop you have been scaffolding, stitch scenes for win/loss, invoke the static export pattern from the blog capstone (`tish build --target js`, zip artifact, lob onto Netlify). Mundane DevOps, spelled out so the ECS worlds you nurtured actually reach players.

Earlier chapters split **concepts** on purpose—tables, rendering, collision, scenes—so nothing depended on a wall of code you had not read yet. Here we only need one coherent picture: **what runs in what order** when the tab is open.

## Demo plan (one screen)

- One **player** entity: `position`, `velocity`, `aabb`, `playerControl`, `appearance` (so we can draw without an art pipeline yet—colored rectangles stand in for sprites).
- A row of **solid** platforms: `position`, `aabb`, `solid`, `appearance`.
- One **goal** strip: overlaps trigger a win flag (text overlay—cheesy but visible).

Systems run in this order every frame:

1. **Gravity** — add downward acceleration to anything with `playerControl` + `velocity`.
2. **Player input** — horizontal `velocity.x`, jump impulse if grounded.
3. **Collide and move** — integrate with X-then-Y resolution against solids (same idea as chapter 3; the Playground contains the full loop so you can scroll one place instead of three).
4. **Goal check** — AABB overlap sets `world.flags.win`.
5. **Draw** — clear, `fillRect` every `appearance`, draw "Goal!" when won.

That is the whole game loop: **simulate → resolve → win test → render**. Scenes and atlases are optional layers on top; you could `push(pauseScene)` around the same loop later.

## Glue code vs engine code

`buildPlayScene` (or inline setup in `main`) should only **describe the level**: spawn ids, attach components, register systems. Keep it boring—boring setup files are easy to diff when a level designer tweaks coordinates.

```tish
// Illustrative — real coordinates live in the Playground below.
fn describeLevel(world) {
  const player = world.entity()
  world.add(player, "position", { x: 80, y: 80 })
  world.add(player, "velocity", { x: 0, y: 0 })
  world.add(player, "aabb", { w: 24, h: 32 })
  world.add(player, "playerControl", { grounded: false })
  world.add(player, "appearance", { fill: "#a78bfa" })
  // …floors, goal, same pattern
}
```

## Build & ship

`tish build main.tish -o game.js --target js`. Drop the JS into a tiny HTML page that mounts a `<canvas>`. Use the C3 zip pattern to bundle `game.html` + `game.js` + real assets when you add them; for this lesson the Playground is self-contained.

Open in a real browser, drag the unzipped folder onto Netlify or GitHub Pages when you are ready for a URL.

## Where to grow (when you miss us)

- **Tilemap** loader (TMX / JSON → many solid entities).
- **Sprite animation** component cycling `(sx, sy)` frames.
- **Camera** subtracting `camera.x/y` before draw calls.
- **Music** via looping `AudioBufferSourceNode`.
- **Particles** (Snake capstone already showed the pattern).

Each is "new component + new system"—the payoff for the ECS shape you carried through this track.

:::callout{kind=tip title="Why ECS for tiny games?"}
For one-developer games, the ECS upfront cost pays off the moment you add a second enemy type or a power-up. Adding a feature is "new component + new system, never new class hierarchy."
:::

## Playground — full loop in one tab

Everything above, wired and runnable. Arrow keys move, **Space** jumps, touch the green goal. Colored boxes replace atlas art so the file stays one self-contained snippet—swap in `sprite` + `drawImage` when you have pixels ready.

:::sandbox{kind=ide id=cap-game-engine-playground}
import { createRoot, useEffect, useRef } from "lattish"

const G = 1400
const input = { left: false, right: false, jump: false }

fn bindKeys() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { input.left = true }
    if (e.key === "ArrowRight") { input.right = true }
    if (e.key === " ") { input.jump = true; e.preventDefault() }
  })
  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") { input.left = false }
    if (e.key === "ArrowRight") { input.right = false }
    if (e.key === " ") { input.jump = false }
  })
}

fn createWorld() {
  let nextId = 1
  const components = {}
  const systems = []

  fn entity() {
    const id = nextId
    nextId = nextId + 1
    return id
  }
  fn add(id, name, data) {
    if (!(name in components)) { components[name] = {} }
    components[name][id] = data
  }
  fn get(id, name) {
    if (!(name in components) || !(id in components[name])) { return null }
    return components[name][id]
  }
  fn has(id, name) {
    return name in components && id in components[name]
  }
  fn all(name) {
    if (!(name in components)) { return [] }
    return Object.entries(components[name])
  }
  fn addSystem(fn_) { systems.push(fn_) }

  fn tick(dt) {
    let i = 0
    while (i < systems.length) {
      systems[i](world, dt)
      i = i + 1
    }
  }

  const world = { entity, add, get, has, all, addSystem, tick, flags: { win: false }, render: null }
  return world
}

fn gravitySystem(world, dt) {
  const pcs = world.all("playerControl")
  let i = 0
  while (i < pcs.length) {
    const id = parseInt(pcs[i][0], 10)
    if (world.has(id, "velocity")) {
      const v = world.get(id, "velocity")
      v.y = v.y + G * dt
    }
    i = i + 1
  }
}

fn playerSystem(world, dt) {
  const ps = world.all("playerControl")
  let i = 0
  while (i < ps.length) {
    const id = parseInt(ps[i][0], 10)
    const v = world.get(id, "velocity")
    if (input.left) { v.x = -220 }
    else if (input.right) { v.x = 220 }
    else { v.x = 0 }
    if (input.jump && world.get(id, "playerControl").grounded) {
      v.y = -480
      world.get(id, "playerControl").grounded = false
    }
    i = i + 1
  }
}

fn aabbOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

fn collideAndMove(world, dt) {
  const movers = world.all("velocity")
  let i = 0
  while (i < movers.length) {
    const id = parseInt(movers[i][0], 10)
    if (!world.has(id, "position") || !world.has(id, "aabb")) { i = i + 1; continue }
    const p = world.get(id, "position")
    const v = movers[i][1]
    const a = world.get(id, "aabb")

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

fn goalSystem(world, dt) {
  const pcs = world.all("playerControl")
  const goals = world.all("goal")
  if (pcs.length === 0 || goals.length === 0) { return }
  const pid = parseInt(pcs[0][0], 10)
  const pp = world.get(pid, "position")
  const pa = world.get(pid, "aabb")
  let gi = 0
  while (gi < goals.length) {
    const gid = parseInt(goals[gi][0], 10)
    const gp = world.get(gid, "position")
    const ga = world.get(gid, "aabb")
    if (aabbOverlap(pp.x, pp.y, pa.w, pa.h, gp.x, gp.y, ga.w, ga.h)) {
      world.flags.win = true
    }
    gi = gi + 1
  }
}

fn buildLevel(world) {
  const p = world.entity()
  world.add(p, "position", { x: 60, y: 120 })
  world.add(p, "velocity", { x: 0, y: 0 })
  world.add(p, "aabb", { w: 24, h: 32 })
  world.add(p, "playerControl", { grounded: false })
  world.add(p, "appearance", { fill: "#a78bfa" })

  let k = 0
  while (k < 14) {
    const t = world.entity()
    world.add(t, "position", { x: k * 44, y: 340 })
    world.add(t, "aabb", { w: 44, h: 40 })
    world.add(t, "solid", true)
    world.add(t, "appearance", { fill: "#334155" })
    k = k + 1
  }

  const g = world.entity()
  world.add(g, "position", { x: 520, y: 260 })
  world.add(g, "aabb", { w: 36, h: 80 })
  world.add(g, "goal", true)
  world.add(g, "appearance", { fill: "#22c55e" })
}

fn Game() {
  const canvasRef = useRef(null)

  useEffect(() => {
    bindKeys()
    const world = createWorld()
    buildLevel(world)

    world.render = (ctx) => {
      ctx.fillStyle = "#0f1114"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      const parts = world.all("appearance")
      let i = 0
      while (i < parts.length) {
        const id = parseInt(parts[i][0], 10)
        if (world.has(id, "position") && world.has(id, "aabb")) {
          const pos = world.get(id, "position")
          const box = world.get(id, "aabb")
          const ap = parts[i][1]
          ctx.fillStyle = ap.fill
          ctx.fillRect(pos.x, pos.y, box.w, box.h)
        }
        i = i + 1
      }
      if (world.flags.win) {
        ctx.fillStyle = "#f8fafc"
        ctx.font = "bold 22px system-ui, sans-serif"
        ctx.fillText("Goal — nice.", 220, 60)
      }
    }

    world.addSystem(gravitySystem)
    world.addSystem(playerSystem)
    world.addSystem(collideAndMove)
    world.addSystem(goalSystem)

    let last = performance.now()
    let raf = 0
    fn loop(now) {
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now
      world.tick(dt)
      const c = canvasRef.current
      if (c !== null) {
        const ctx = c.getContext("2d")
        world.render(ctx)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf) }
  }, [])

  return <div>
    <p style="color:#94a3b8;font:14px system-ui;margin:0 0 0.5rem 0">{"Arrows move · Space jumps · touch the green goal"}</p>
    <canvas ref={canvasRef} width={640} height={400} style="border-radius:8px;display:block" />
  </div>
}

createRoot(document.body).render(Game)
:::


:::quiz{id=cap-game-05-q1}
- prompt: How do you ship a tish-built game as a single deployable thing?
- options: ["tish build --target js, bundle in HTML, download as zip, drop on a static host", "Email people the source", "Run a Tish server"]
- answer: tish build --target js, bundle in HTML, download as zip, drop on a static host
:::

From here on, treat new gameplay ideas as a design question first—**what component, what system?**—then as much code as that answer deserves.
