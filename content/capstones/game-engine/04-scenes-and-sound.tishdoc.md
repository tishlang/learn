---
title: "C6 — Game engine: Scenes and sound"
summary: Scene graph, transitions, audio.
---

Games are stacks of moods, not mega-switch statements buried in `updateWorld`. Today's players expect pause menus that still shimmer, overlays that mute gameplay audio, transitions that teardown physics when you surrender. Fighting that complexity with stray booleans collapses eventually; scenes package lifecycle (`enter`, `update`, `exit`) so swapping contexts is intentional instead of frantic.

We'll layer a petite scene manager on top of the ECS worlds you built earlier, then light up basic audio cues so wins and deaths register emotionally—not just mechanically.

## Scene = world + lifecycle

Each **scene** owns an ECS **world** created lazily. `enter` constructs it; `update` runs simulation + render; `exit` drops references so garbage collection can reclaim entities when you leave a level.

```tish
fn createScene(name, factory) {
  let world = null
  return {
    name: name,
    enter: () => { world = factory() },
    update: (dt, ctx) => { world.tick(dt); world.render(ctx) },
    exit: () => { world = null }
  }
}
```

`factory` is a zero-arg function returning a configured `world`—same pattern as `useState(() => initial)` in UI code.

## Why a stack instead of one `currentScene` pointer?

A **stack** gives you overlays for free:

- **Replace** — title → gameplay (tear down menu entirely).
- **Push** — gameplay → pause menu (pause scene's `update` still runs or not, your choice—often you skip simulation under pause).
- **Pop** — pause → gameplay (restore the world you left sitting under the overlay).

Deferred transitions avoid mutating the stack while you are iterating it—queue `pendingTransition`, apply once at the top of `update`.

```tish
// Manager sketch — full version wires enter/exit on push/pop/replace:
fn createSceneManager() {
  let stack = []
  let pendingTransition = null

  fn push(scene) { pendingTransition = { kind: "push", scene } }
  fn pop() { pendingTransition = { kind: "pop" } }
  fn replace(scene) { pendingTransition = { kind: "replace", scene } }

  fn update(dt, ctx) {
    // applyTransition() — pops exit old tops, pushes call enter on new
    const c = stack.length > 0 ? stack[stack.length - 1] : null
    if (c !== null) { c.update(dt, ctx) }
  }

  return { push, pop, replace, update }
}
```

Concrete UX: space on title → `replace(playScene)`; player dies → `push(gameOverScene)`; "play again" → `pop()` then `replace(playScene)` or rebuild a fresh world in `enter`.

## Audio: keep it boring until it works

Short **one-shot** SFX fit `AudioContext` + `OscillatorNode` (Snake chapter did this). For **buffered** sounds (footsteps, UI blips) decode small WAV/OGG into `AudioBuffer` once, then spawn `AudioBufferSourceNode` per play—they are cheap to fire in parallel.

```tish
let audio = null
fn ensureCtx() { if (audio === null) { audio = new AudioContext() } return audio }

let buffers = {}
async fn loadSfx(name, url) {
  const res = await fetch(url)
  const ab = await res.arrayBuffer()
  buffers[name] = await ensureCtx().decodeAudioData(ab)
}

fn playSfx(name) {
  if (!(name in buffers)) { return }
  const src = ensureCtx().createBufferSource()
  src.buffer = buffers[name]
  src.connect(ensureCtx().destination)
  src.start()
}
```

Hook calls into gameplay systems ("coin collected", "player died") once the loop is stable—otherwise you chase audio bugs and physics bugs at the same time.

The final chapter's Playground wires scene transitions with a minimal loop so you can feel push/pop without pasting your whole game twice.


:::quiz{id=cap-game-04-q1}
- prompt: Why a stack of scenes rather than a flat current-scene pointer?
- options: ["Lets you push overlays (pause menu, game-over) without losing the scene below", "Cleaner code only", "Performance"]
- answer: Lets you push overlays (pause menu, game-over) without losing the scene below
:::
