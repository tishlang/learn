---
title: "C2 — Snake: Juice + persistent score"
summary: Sound, particles, high score.
---

The game works. Now make it **feel** good.

"Juice" is everything that isn't strictly needed but makes a 30-second arcade game irresistible: a sound on eat, particles flying off the food, a satisfying "you died" screen, persistent high scores.

## Sound on eat

`AudioContext` produces tones in the browser. A 1KHz beep for "yum":

```tish
let ctx = null
fn beep() {
  if (ctx === null) { ctx = new AudioContext() }
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = 880
  gain.gain.value = 0.1
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.06)
}
```

Call `beep()` after `placeFood()` in the eat branch.

## Particles

When the snake eats, spray a few short-lived particles from the food's last position. State lives outside React state (no re-render needed for animation):

```tish
const particles = []
fn spawnParticles(x, y) {
  let i = 0
  while (i < 8) {
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 20
    })
    i = i + 1
  }
}
```

In `draw`, advance and render each particle.

## Persistent high score

```tish
fn loadHigh() {
  try {
    const v = localStorage.getItem("snake-high")
    return v === null ? 0 : parseInt(v, 10)
  } catch (e) { return 0 }
}
fn saveHigh(n) {
  try { localStorage.setItem("snake-high", String(n)) } catch (e) { }
}
```

When `score > high`, save and update.

## All together

:::sandbox{kind=ide id=cap-snake-03}
import { createRoot, useEffect, useState, useRef } from "lattish"

const COLS = 20
const ROWS = 20
const SIZE = 18

let audio = null
fn beep(freq) {
  if (audio === null) { audio = new AudioContext() }
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.frequency.value = freq
  gain.gain.value = 0.1
  osc.connect(gain).connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + 0.06)
}

fn loadHigh() {
  try { const v = localStorage.getItem("snake-high"); return v === null ? 0 : parseInt(v, 10) } catch (e) { return 0 }
}
fn saveHigh(n) {
  try { localStorage.setItem("snake-high", String(n)) } catch (e) { }
}

fn SnakeApp() {
  const canvasRef = useRef(null)
  const scoreState = useState(0)
  const score = scoreState[0]
  const setScore = scoreState[1]
  const highState = useState(loadHigh())
  const high = highState[0]
  const setHigh = highState[1]
  const overState = useState(false)
  const over = overState[0]
  const setOver = overState[1]

  let snake = [{ x: 10, y: 10 }]
  let dir = { x: 1, y: 0 }
  let pendingDir = dir
  let food = { x: 5, y: 5 }
  let particles = []
  let alive = true

  fn placeFood() {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  }

  fn spawnParticles(x, y) {
    let i = 0
    while (i < 10) {
      particles.push({
        x: x * SIZE + SIZE / 2,
        y: y * SIZE + SIZE / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 24
      })
      i = i + 1
    }
  }

  fn step() {
    if (!alive) { return }
    dir = pendingDir
    const head = snake[0]
    const next = { x: head.x + dir.x, y: head.y + dir.y }
    if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
      alive = false; setOver(true); beep(220); return
    }
    let i = 0
    while (i < snake.length) {
      if (snake[i].x === next.x && snake[i].y === next.y) {
        alive = false; setOver(true); beep(220); return
      }
      i = i + 1
    }
    snake = [next].concat(snake)
    if (next.x === food.x && next.y === food.y) {
      const ns = score + 1
      setScore(ns)
      if (ns > high) { setHigh(ns); saveHigh(ns) }
      spawnParticles(food.x, food.y)
      beep(880)
      placeFood()
    } else {
      snake.pop()
    }
    let p = 0
    while (p < particles.length) {
      particles[p].x = particles[p].x + particles[p].vx
      particles[p].y = particles[p].y + particles[p].vy
      particles[p].life = particles[p].life - 1
      p = p + 1
    }
    particles = particles.filter((q) => q.life > 0)
  }

  fn draw() {
    const ctx = canvasRef.current.getContext("2d")
    ctx.fillStyle = "#0f1114"
    ctx.fillRect(0, 0, COLS * SIZE, ROWS * SIZE)
    ctx.fillStyle = "#ef4444"
    ctx.fillRect(food.x * SIZE, food.y * SIZE, SIZE - 2, SIZE - 2)
    ctx.fillStyle = "#a78bfa"
    let i = 0
    while (i < snake.length) {
      ctx.fillRect(snake[i].x * SIZE, snake[i].y * SIZE, SIZE - 2, SIZE - 2)
      i = i + 1
    }
    let p = 0
    while (p < particles.length) {
      ctx.fillStyle = "rgba(239, 68, 68, " + (particles[p].life / 24) + ")"
      ctx.fillRect(particles[p].x - 2, particles[p].y - 2, 4, 4)
      p = p + 1
    }
  }

  useEffect(() => {
    fn key(e) {
      if (e.key === "ArrowUp" && dir.y !== 1) { pendingDir = { x: 0, y: -1 } }
      else if (e.key === "ArrowDown" && dir.y !== -1) { pendingDir = { x: 0, y: 1 } }
      else if (e.key === "ArrowLeft" && dir.x !== 1) { pendingDir = { x: -1, y: 0 } }
      else if (e.key === "ArrowRight" && dir.x !== -1) { pendingDir = { x: 1, y: 0 } }
    }
    document.addEventListener("keydown", key)
    const id = setInterval(() => { step(); draw() }, 100)
    return () => { document.removeEventListener("keydown", key); clearInterval(id) }
  }, [])

  fn reset() {
    snake = [{ x: 10, y: 10 }]
    dir = { x: 1, y: 0 }
    pendingDir = dir
    particles = []
    placeFood()
    alive = true
    setScore(0)
    setOver(false)
  }

  return <div class="game">
    <div class="hud">
      <span>{"Score: " + score + " · High: " + high}</span>
      {over ? <button onclick={reset}>{"Play again"}</button> : null}
    </div>
    <canvas ref={canvasRef} width={COLS * SIZE} height={ROWS * SIZE} />
  </div>
}

createRoot(document.body).render(SnakeApp)
:::

That's a complete arcade game. Ship it as a static page using the export pattern from beginner Part-VII chapter 39.

## Take it real

Bundle the game as a standalone HTML page. The "static-site export" lesson in the beginner track is the recipe — `tish build --target js` your game, drop it in an HTML shell with a single canvas, deploy to GitHub Pages.

:::quiz{id=cap-snake-03-q1}
- prompt: What does "juice" mean in game design?
- options: ["Battery life", "All the not-strictly-necessary feedback that makes the game feel good", "Bonus score"]
- answer: All the not-strictly-necessary feedback that makes the game feel good
:::
