---
title: "C2 — Snake: Input and loop"
summary: Keyboard, requestAnimationFrame, food, collision.
---

The game loop:

1. Read input → update direction.
2. Advance state (move head, eat food, grow, collide).
3. Render.
4. Wait one tick. Repeat.

For pixel-art games, **`setInterval`** at ~120ms gives a chunky, snake-like feel. For smoother motion (60fps), use `requestAnimationFrame` — but Snake feels right at 8–10 fps.

## Full playable

:::sandbox{kind=ide id=cap-snake-02}
import { createRoot, useEffect, useState, useRef } from "lattish"

const COLS = 20
const ROWS = 20
const SIZE = 18

fn SnakeApp() {
  const canvasRef = useRef(null)
  const scoreState = useState(0)
  const score = scoreState[0]
  const setScore = scoreState[1]
  const overState = useState(false)
  const over = overState[0]
  const setOver = overState[1]

  let snake = [{ x: 10, y: 10 }]
  let dir = { x: 1, y: 0 }
  let pendingDir = { x: 1, y: 0 }
  let food = { x: 5, y: 5 }
  let alive = true

  fn placeFood() {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  }

  fn step() {
    if (!alive) { return }
    dir = pendingDir
    const head = snake[0]
    const next = { x: head.x + dir.x, y: head.y + dir.y }
    if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
      alive = false; setOver(true); return
    }
    let i = 0
    while (i < snake.length) {
      if (snake[i].x === next.x && snake[i].y === next.y) {
        alive = false; setOver(true); return
      }
      i = i + 1
    }
    snake = [next].concat(snake)
    if (next.x === food.x && next.y === food.y) {
      setScore(score + 1)
      placeFood()
    } else {
      snake.pop()
    }
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
  }

  useEffect(() => {
    fn key(e) {
      if (e.key === "ArrowUp" && dir.y !== 1) { pendingDir = { x: 0, y: -1 } }
      else if (e.key === "ArrowDown" && dir.y !== -1) { pendingDir = { x: 0, y: 1 } }
      else if (e.key === "ArrowLeft" && dir.x !== 1) { pendingDir = { x: -1, y: 0 } }
      else if (e.key === "ArrowRight" && dir.x !== -1) { pendingDir = { x: 1, y: 0 } }
    }
    document.addEventListener("keydown", key)
    const id = setInterval(() => { step(); draw() }, 110)
    return () => { document.removeEventListener("keydown", key); clearInterval(id) }
  }, [])

  fn reset() {
    snake = [{ x: 10, y: 10 }]
    dir = { x: 1, y: 0 }
    pendingDir = { x: 1, y: 0 }
    placeFood()
    alive = true
    setScore(0)
    setOver(false)
  }

  return <div class="game">
    <div class="hud">
      <span>{"Score: " + score}</span>
      {over ? <button onclick={reset}>{"Play again"}</button> : null}
    </div>
    <canvas ref={canvasRef} width={COLS * SIZE} height={ROWS * SIZE} />
  </div>
}

createRoot(document.body).render(SnakeApp)
:::

Click on the canvas first to capture keyboard focus, then play with arrow keys.

:::callout{kind=tip title="Why `pendingDir`?"}
If we updated `dir` directly from keys, you could press right→down within the same tick and turn into yourself. Buffering input as `pendingDir` and committing it once per tick prevents that.
:::

:::quiz{id=cap-snake-02-q1}
- prompt: Why two direction variables (dir and pendingDir)?
- options: ["For animation", "To prevent within-tick reversals (turning into yourself)", "Performance"]
- answer: To prevent within-tick reversals (turning into yourself)
:::
