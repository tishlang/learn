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

## ECS in three sentences

- An **entity** is just an integer ID.
- A **component** is a plain object attached to an entity by name (`position`, `velocity`, `sprite`, …).
- A **system** is a function that walks entities-with-component-X and updates state.

That's it. Each new feature is a new component + system, never a new class hierarchy.

## Skeleton

```tish
fn createWorld() {
  let nextId = 1
  // Components keyed by name → { entityId → componentData }
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

## A first system: motion

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

Add a few entities with `position` + `velocity`, register the system, call `world.tick(dt)` 60 times a second. They move. That's a game engine in ~70 lines.

:::quiz{id=cap-game-01-q1}
- prompt: In ECS, what is an entity?
- options: ["A class instance with methods", "An integer ID with components attached by name", "A scene"]
- answer: An integer ID with components attached by name
:::
