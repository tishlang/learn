---
title: "C6 — Game engine: Entity / component"
summary: ECS in 60 lines.
---

:::project{title="Tiny game engine" time="~3 hours" difficulty="Advanced" summary="Build a small ECS engine: entities + components + systems, sprite rendering, physics, scenes, and ship a tiny platformer."}
You'll build:
- A minimal Entity-Component-System engine (ECS).
- A sprite renderer with batched canvas draws.
- Keyboard / gamepad input + AABB collision.
- Scene graph with transitions and audio cues.
- A small platformer demo, exportable as a static page (uses the C3 zip pattern).
:::

Engines begin as folklore—`entity`, `component`, `system` thrown around Twitch streams—and then crystallize into constraints that save your codebase from inheritance tar pits. ECS is basically **labeled tables**: entities are opaque IDs; components hang named records off those IDs; systems scan one column at a time and mutate another. Compose features by adding tuples, not by subclassing dragons.

You are not prototyping Unity here. In a few hundred disciplined lines we reproduce the mental model triple-A studios lean on to keep gameplay teams from inheriting themselves into corners. Renderer, input, scenes, and shipping each stack on this chapter's `createWorld` facade.

## ECS in three sentences

- An **entity** is just an integer ID.
- A **component** is a plain object attached to an entity by name (`position`, `velocity`, `sprite`, …).
- A **system** is a function that walks entities-with-component-X and updates state.

That's it. Each new feature is a new component + system, never a new class hierarchy.

## Why tables instead of classes?

Inheritance says "a `BatEnemy` *is a* `FlyingEnemy` *is a* `Enemy`". That reads well until the designer asks for a bat that also drops coins like a chest. ECS says: entity `42` has `position`, `velocity`, `flyingAI`, `dropsLoot`. No vtables, no diamond problems—just queries over columns.

The **world** is a tiny database: component name → (entity id → plain data). Systems are queries plus updates.

## Entities: fresh IDs

`entity()` hands out monotonically increasing integers. They carry no behavior; they are only keys.

```tish
let nextId = 1
fn entity() {
  const id = nextId
  nextId = nextId + 1
  return id
}
```

Why integers and not objects? So you can pass an id through messages, save files, and network packets without serializing whole class graphs.

## Attaching data: `add` / `get` / `has`

`add(id, "position", { x: 0, y: 0 })` stores the object **by reference**—systems mutate the same object you handed in. `get` returns `null` if the slot is empty so callers can branch cheaply.

```tish
const components = {}  // name → { entityId → data }

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
```

`remove(id, name)` deletes one slot (handy for pickups and dead enemies)—same pattern with `delete`.

## Querying: `all`

Systems start from "everyone who has component X". `Object.entries` gives `[idString, data]` pairs; parse the id back to a number when you need it as a key.

```tish
fn all(name) {
  if (!(name in components)) { return [] }
  return Object.entries(components[name])
}
```

Why not arrays of entities? Sparse sets and archetypes are faster at scale; maps keyed by id are enough for this tutorial and match how most hand-rolled ECS prototypes start.

## Systems and `tick`

A **system** is just `fn (world, dt) { ... }`. Registration order is execution order—so you decide whether movement runs before or after collisions by how you `addSystem`.

```tish
const systems = []
fn addSystem(fn_) { systems.push(fn_) }

fn tick(dt) {
  let i = 0
  while (i < systems.length) {
    systems[i](world, dt)
    i = i + 1
  }
}
```

`dt` is seconds (e.g. `0.016`). Multiply velocities and accelerations by `dt` so behavior stays stable if the frame rate wobbles.

## A first system: motion

This system only cares about rows that have **both** `position` and `velocity`. Everyone else is skipped—no `instanceof`, no null checks on missing methods.

```tish
fn motionSystem(world, dt) {
  const entries = world.all("position")
  let i = 0
  while (i < entries.length) {
    const id = parseInt(entries[i][0], 10)
    if (world.has(id, "velocity")) {
      const p = entries[i][1]
      const v = world.get(id, "velocity")
      p.x = p.x + v.x * dt
      p.y = p.y + v.y * dt
    }
    i = i + 1
  }
}
```

Later chapters add gravity, collision resolution, and rendering as **separate** systems so each pass stays readable.

## Wiring `createWorld`

`createWorld` returns one bag—`{ entity, add, remove, get, has, all, addSystem, tick }`—so systems always receive the same API. The full listing is long on purpose: it is the spine every other chapter hangs from. Read it once top-to-bottom; you should recognize each piece from the sections above.

```tish
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

  fn remove(id, name) {
    if (name in components && id in components[name]) { delete components[name][id] }
  }

  fn get(id, name) {
    if (!(name in components)) { return null }
    if (!(id in components[name])) { return null }
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

  const world = { entity, add, remove, get, has, all, addSystem, tick }
  return world
}
```

Add a few entities with `position` + `velocity`, register `motionSystem`, call `world.tick(dt)` from a `requestAnimationFrame` loop—they move. That is the whole engine contract in one screenful.

The **Playground** at the end of the last chapter in this track drops a runnable that stitches this world together with rendering, input, and collisions so you can prod it live—here we stayed focused on *why* the tables exist.


:::quiz{id=cap-game-01-q1}
- prompt: In ECS, what is an entity?
- options: ["A class instance with methods", "An integer ID with components attached by name", "A scene"]
- answer: An integer ID with components attached by name
:::
