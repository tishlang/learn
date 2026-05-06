---
title: "C2 — Snake: Grid and snake"
summary: Game state, render to canvas.
---

:::project{title="Snake" time="~45 min" difficulty="Beginner-friendly" summary="Build a complete arcade game: canvas, game loop, keyboard input, sound, particles, persistent high score."}
You'll build:
- A grid-based game state.
- A canvas renderer that draws snake + food.
- A keyboard-driven game loop.
- Sound (`AudioContext`), particle effects, high score in `localStorage`.
:::

Every game engine marketing page promises particles and PBR; almost every **finished** game shipped because someone separated "what is true" from "what is drawn." Snake is the perfect exercise: the world is a tiny grid, the renderer is rectangles, and cheating is obvious if the two drift apart.

If you have only ever followed “draw in the game loop” tutorials, this chapter gives you the counterpoint. We keep mutation in plain data (`snake`, `food`, constants for the board) and let the canvas function as a dumb television. Once that habit clicks, keyboard input, collision, and polish are incremental instead of surgical.

## What this chapter builds

A **read-only** snake: three segments and a food square on a grid-backed canvas. No keyboard loop yet — that is the next chapter — but you already separate **state** (arrays and numbers) from **drawing** (`getContext("2d")`, fill rects).

## The model

Snake is a list of `{x, y}` cells. Food is a single cell. Direction is a unit vector.

```tish
const COLS = 20
const ROWS = 20

let snake = [{ x: 10, y: 10 }]
let dir = { x: 1, y: 0 }
let food = { x: 5, y: 5 }
```

## Render

Each frame: clear the canvas, draw food, draw every snake cell. The Playground at the end of the page runs the full `useEffect` that calls `draw()` once on mount so you see the static frame.

:::sandbox{kind=ide id=cap-snake-01}
import { createRoot, useEffect, useRef } from "lattish"

const COLS = 20
const ROWS = 20
const SIZE = 18

fn SnakeApp() {
  const canvasRef = useRef(null)

  let snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ]
  let food = { x: 5, y: 5 }

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

  useEffect(() => { draw() }, [])

  return <canvas ref={canvasRef} width={COLS * SIZE} height={ROWS * SIZE} />
}

createRoot(document.body).render(SnakeApp)
:::

In the Playground you should see a static three-segment snake and a food pellet. Next chapter: make it move.

:::callout{kind=tip title="`SIZE - 2` instead of `SIZE`"}
Drawing each cell two pixels smaller leaves a gap between cells, making the snake legible. A subtle but important visual choice.
:::


:::quiz{id=cap-snake-01-q1}
- prompt: How is the snake's shape stored?
- options: ["A single rectangle", "An array of {x, y} cells", "An image"]
- answer: An array of {x, y} cells
:::
