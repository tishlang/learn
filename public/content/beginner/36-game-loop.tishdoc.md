---
title: Game loops — your first video game
summary: requestAnimationFrame, keyboard input, Snake.
---

A **game loop** runs once per frame (~60 times a second), reads input, advances state, and redraws.

`requestAnimationFrame(cb)` is the browser's "call me on the next frame" API.

## Snake

Full game: arrow keys to move, eat food to grow, lose if you hit a wall or yourself, score persists in localStorage.

:::sandbox{kind=ide id=36-snake}
import { createRoot, useEffect, useRef, useState } from "lattish"

const COLS = 20
const ROWS = 20
const SIZE = 20

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
  let food = { x: 5, y: 5 }
  let alive = true

  fn placeFood() {
    food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    }
  }

  fn step() {
    if (!alive) { return }
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
      placeFood()
      setScore(score + 1)
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

  let intervalId = null
  useEffect(() => {
    fn key(e) {
      if (e.key === "ArrowUp" && dir.y !== 1) { dir = { x: 0, y: -1 } }
      else if (e.key === "ArrowDown" && dir.y !== -1) { dir = { x: 0, y: 1 } }
      else if (e.key === "ArrowLeft" && dir.x !== 1) { dir = { x: -1, y: 0 } }
      else if (e.key === "ArrowRight" && dir.x !== -1) { dir = { x: 1, y: 0 } }
    }
    document.addEventListener("keydown", key)
    intervalId = setInterval(() => { step(); draw() }, 120)
    return () => {
      document.removeEventListener("keydown", key)
      if (intervalId !== null) { clearInterval(intervalId) }
    }
  }, [])

  fn reset() {
    snake = [{ x: 10, y: 10 }]
    dir = { x: 1, y: 0 }
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

:::callout{kind=tip title="Click the canvas first"}
Browsers only deliver keyboard events to the focused element. If arrow keys aren't working, click somewhere on the canvas to give the page focus.
:::

:::quiz{id=36-snake-q1}
- prompt: What does `requestAnimationFrame` (or `setInterval`) do for a game?
- options: ["Drives the game loop — call step() and draw() repeatedly", "Saves the game state", "Handles input"]
- answer: Drives the game loop — call step() and draw() repeatedly
:::
