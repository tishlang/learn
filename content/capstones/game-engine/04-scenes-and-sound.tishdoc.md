---
title: "C6 — Game engine: Scenes and sound"
summary: Scene graph, transitions, audio.
---

A real game has **menus**, **levels**, **a game-over screen** — distinct sets of entities and systems. The clean way: scenes.

## Scene shape

Each scene owns its own world and exposes `enter`, `update`, `exit`:

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

## Scene manager

```tish
fn createSceneManager() {
  let stack = []
  let pendingTransition = null

  fn current() { return stack.length > 0 ? stack[stack.length - 1] : null }

  fn push(scene) { pendingTransition = { kind: "push", scene } }
  fn pop() { pendingTransition = { kind: "pop" } }
  fn replace(scene) { pendingTransition = { kind: "replace", scene } }

  fn applyTransition() {
    if (pendingTransition === null) { return }
    const t = pendingTransition
    pendingTransition = null
    if (t.kind === "push") {
      t.scene.enter()
      stack.push(t.scene)
    } else if (t.kind === "pop") {
      const c = current()
      if (c !== null) { c.exit() }
      stack.pop()
    } else if (t.kind === "replace") {
      const c = current()
      if (c !== null) { c.exit() }
      stack.pop()
      t.scene.enter()
      stack.push(t.scene)
    }
  }

  fn update(dt, ctx) {
    applyTransition()
    const c = current()
    if (c !== null) { c.update(dt, ctx) }
  }

  return { push, pop, replace, update }
}
```

Press space on the menu → `manager.replace(playScene)`. Player dies → `manager.push(gameOverScene)` (overlays the dead playfield). Click "play again" → `manager.pop(); manager.replace(playScene)`.

## Audio cues

Reuse the Snake-style `AudioContext` helper. For richer audio (music, multi-channel sfx), preload `<audio>` elements and `audio.play()`. For pitch-perfect timing, use `AudioBufferSourceNode`:

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

Now play a footstep when the player walks, a chime when they collect a coin, a sting when they die.

:::quiz{id=cap-game-04-q1}
- prompt: Why a stack of scenes rather than a flat current-scene pointer?
- options: ["Lets you push overlays (pause menu, game-over) without losing the scene below", "Cleaner code only", "Performance"]
- answer: Lets you push overlays (pause menu, game-over) without losing the scene below
:::
