---
title: "C5 — Whiteboard: Local strokes"
summary: Canvas drawing + stroke serialization.
---

:::project{title="Collaborative whiteboard" time="~60 min" difficulty="Intermediate" summary="Multi-user drawing in a browser tab, with same-machine multi-tab sync via BroadcastChannel and a WebRTC peer-to-peer bonus chapter for cross-device."}
You'll build:
- A canvas drawing pad (single user, smooth strokes).
- Stroke serialization (an array of `{x, y, color}` points).
- Multi-tab broadcast sync.
- A WebRTC paste-the-offer flow for cross-device, no signaling server.
:::

Collaborative drawing apps look like exotic WebRTC demos, yet the honest core is mundane: capture pointer samples, interpolate them politely on a canvas, and **treat strokes as serializable structs** rather than unnamed pixels. If you skip that distinction, syncing or undo becomes archaeology.

Chapter 1 stays deliberately offline. You're building the proof that your stroke model survives redraws, palette changes, and clear buttons—the same data you will soon blast across BroadcastChannel packets.

## The local pad

Strokes are arrays of points. Mouse-down starts a stroke, mouse-move appends, mouse-up ends. We keep **`strokes`** as an array of `{ color, points: [{x,y}, ...] }` so we can redraw after clear, resize, or (next chapter) replay packets from another tab.

Minimal event flow:

```tish
// on mousedown: start new stroke with first point
// on mousemove: append to current stroke + redraw whole canvas
// on mouseup / leave: commit stroke (current = null)
```

**Playground** at the end: color picker, clear, and a 600×400 canvas.

:::sandbox{kind=ide id=cap-wb-01}
import { createRoot, useRef, useState } from "lattish"

fn PadApp() {
  const canvasRef = useRef(null)
  const colorState = useState("#a78bfa")
  const color = colorState[0]
  const setColor = colorState[1]

  let strokes = []
  let current = null

  fn redraw() {
    const c = canvasRef.current
    const ctx = c.getContext("2d")
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, c.width, c.height)
    let i = 0
    while (i < strokes.length) {
      const s = strokes[i]
      ctx.strokeStyle = s.color
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()
      let p = 0
      while (p < s.points.length) {
        const pt = s.points[p]
        if (p === 0) { ctx.moveTo(pt.x, pt.y) } else { ctx.lineTo(pt.x, pt.y) }
        p = p + 1
      }
      ctx.stroke()
      i = i + 1
    }
  }

  fn relPoint(e) {
    const r = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  fn handleDown(e) {
    current = { color: color, points: [relPoint(e)] }
    strokes.push(current)
    redraw()
  }
  fn handleMove(e) {
    if (current === null) { return }
    current.points.push(relPoint(e))
    redraw()
  }
  fn handleUp() { current = null }

  fn clear() { strokes = []; redraw() }

  return <div class="pad">
    <div class="pad-toolbar">
      <input type="color" value={color} oninput={(e) => setColor(e.target.value)} />
      <button onclick={clear}>{"Clear"}</button>
    </div>
    <canvas
      ref={canvasRef}
      width={600} height={400}
      style="background: white; cursor: crosshair; border-radius: 8px;"
      onmousedown={handleDown}
      onmousemove={handleMove}
      onmouseup={handleUp}
      onmouseleave={handleUp} />
  </div>
}

createRoot(document.body).render(PadApp)
:::

In the Playground you can draw freely. Each stroke is a serializable object. Next chapter: broadcast strokes to other tabs.


:::quiz{id=cap-wb-01-q1}
- prompt: Why store strokes as `{color, points: [...]}` instead of drawing directly?
- options: ["Easier to redraw on resize, undo, and broadcast over the wire", "Performance only", "It's the only way"]
- answer: Easier to redraw on resize, undo, and broadcast over the wire
:::
