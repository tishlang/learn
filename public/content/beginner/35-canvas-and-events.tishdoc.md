---
title: Canvas and events
summary: <canvas>, getContext, mouse events.
---

`<canvas>` is the browser's pixel buffer. You draw shapes, lines, images. We listen for mouse events to draw what the user does.

## Drawing pad

Click + drag draws strokes. Color picker. Clear button.

:::sandbox{kind=ide id=35-pad}
import { createRoot, useState, useRef, useEffect } from "lattish"

fn PadApp() {
  const canvasRef = useRef(null)
  const colorState = useState("#a78bfa")
  const color = colorState[0]
  const setColor = colorState[1]

  let drawing = false
  let lastX = 0
  let lastY = 0

  fn handleDown(e) {
    drawing = true
    const rect = canvasRef.current.getBoundingClientRect()
    lastX = e.clientX - rect.left
    lastY = e.clientY - rect.top
  }
  fn handleMove(e) {
    if (!drawing) { return }
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ctx = canvasRef.current.getContext("2d")
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()
    lastX = x; lastY = y
  }
  fn handleUp() { drawing = false }

  fn clear() {
    const c = canvasRef.current
    c.getContext("2d").clearRect(0, 0, c.width, c.height)
  }

  return <div class="pad">
    <div class="pad-toolbar">
      <input type="color" value={color} oninput={(e) => setColor(e.target.value)} />
      <button onclick={clear}>{"Clear"}</button>
    </div>
    <canvas
      ref={canvasRef}
      width={500} height={300}
      style="background: white; cursor: crosshair; border-radius: 8px;"
      onmousedown={handleDown}
      onmousemove={handleMove}
      onmouseup={handleUp}
      onmouseleave={handleUp} />
  </div>
}

createRoot(document.body).render(PadApp)
:::

:::callout{kind=tip title="2D graphics in 3 calls"}
`ctx.beginPath()` starts a new shape, `ctx.moveTo` / `lineTo` describe it, `ctx.stroke()` paints. That's 90% of what canvas drawing looks like.
:::

:::quiz{id=35-canvas-q1}
- prompt: Why `e.clientX - rect.left` instead of `e.clientX`?
- options: ["clientX is relative to the viewport; we need it relative to the canvas", "It's just a convention", "Performance"]
- answer: clientX is relative to the viewport; we need it relative to the canvas
:::
