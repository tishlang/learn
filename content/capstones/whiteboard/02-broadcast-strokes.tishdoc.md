---
title: "C5 — Whiteboard: Broadcast strokes"
summary: BroadcastChannel sync between same-origin tabs.
---

Networks lie about latency; **`mousemove` handlers lie about cardinality**. Blast every pointer sample down a channel without thinking and you've reinvented unintentional DDOS inside the browser profile. Collaboration code is perf code: batch, compress intent, reconcile ordering.

You've already nailed stroke geometry. Here we graft transport: identifiers for strokes, chunked point uploads, optimistic local drawing, deterministic replay on the remote side—the same playbook Figma abstracts, only visible because we typed it ourselves.

## What this chapter adds

We send each stroke (or batched points) over **`createBcWebSocket("bc://wb/...")`**: same WebSocket-shaped API as the chat capstone, so two tabs of this lesson mirror each other instantly. Remote strokes need a stable **`id`** so `stroke-points` messages append to the correct polyline.

## Throttling

Sending every mouse-move is overkill: typical mice fire 100–200 times a second. Buffer and flush every ~30ms to keep things responsive without saturating the channel.

```tish
let pending = []
let flushScheduled = false

fn flush(ws) {
  if (pending.length === 0) { flushScheduled = false; return }
  ws.send(JSON.stringify({ kind: "stroke-points", points: pending }))
  pending = []
  flushScheduled = false
}

fn queuePoint(ws, pt) {
  pending.push(pt)
  if (!flushScheduled) {
    flushScheduled = true
    setTimeout(() => flush(ws), 30)
  }
}
```

The **Playground** at the bottom of this page contains the full pad + channel wiring.

:::sandbox{kind=ide id=cap-wb-02}
import { createRoot, useRef, useState, useEffect } from "lattish"
import { createBcWebSocket } from "tish-browser-server"

fn PadApp() {
  const canvasRef = useRef(null)
  const colorState = useState("#a78bfa")
  const color = colorState[0]
  const setColor = colorState[1]
  const wsRef = useRef(null)

  let strokes = []
  let currentLocal = null

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

  fn applyRemote(msg) {
    if (msg.kind === "stroke-start") {
      strokes.push({ id: msg.id, color: msg.color, points: msg.points })
    } else if (msg.kind === "stroke-points") {
      const i = strokes.findIndex((s) => s.id === msg.id)
      if (i >= 0) { strokes[i].points = strokes[i].points.concat(msg.points) }
    } else if (msg.kind === "clear") {
      strokes = []
    }
    redraw()
  }

  useEffect(() => {
    const ws = createBcWebSocket("bc://wb/main")
    wsRef.current = ws
    ws.onmessage = (ev) => {
      try { applyRemote(JSON.parse(ev.data)) } catch (e) { }
    }
    return () => { ws.close() }
  }, [])

  let strokeId = 0
  fn nextId() { strokeId = strokeId + 1; return Date.now() + ":" + strokeId }

  fn handleDown(e) {
    const id = nextId()
    const pt = relPoint(e)
    currentLocal = { id: id, color: color, points: [pt] }
    strokes.push(currentLocal)
    redraw()
    if (wsRef.current !== null) {
      wsRef.current.send(JSON.stringify({ kind: "stroke-start", id: id, color: color, points: [pt] }))
    }
  }

  let buffer = []
  let flushPending = false
  fn flush() {
    if (currentLocal === null || buffer.length === 0) { flushPending = false; return }
    if (wsRef.current !== null) {
      wsRef.current.send(JSON.stringify({ kind: "stroke-points", id: currentLocal.id, points: buffer }))
    }
    buffer = []
    flushPending = false
  }

  fn handleMove(e) {
    if (currentLocal === null) { return }
    const pt = relPoint(e)
    currentLocal.points.push(pt)
    buffer.push(pt)
    if (!flushPending) {
      flushPending = true
      setTimeout(flush, 30)
    }
    redraw()
  }
  fn handleUp() {
    flush()
    currentLocal = null
  }
  fn clear() {
    strokes = []
    redraw()
    if (wsRef.current !== null) { wsRef.current.send(JSON.stringify({ kind: "clear" })) }
  }

  return <div class="pad">
    <div class="pad-toolbar">
      <input type="color" value={color} oninput={(e) => setColor(e.target.value)} />
      <button onclick={clear}>{"Clear"}</button>
      <span class="hint">{"Open in two tabs to see sync"}</span>
    </div>
    <canvas ref={canvasRef} width={600} height={400}
      style="background: white; cursor: crosshair; border-radius: 8px;"
      onmousedown={handleDown}
      onmousemove={handleMove}
      onmouseup={handleUp}
      onmouseleave={handleUp} />
  </div>
}

createRoot(document.body).render(PadApp)
:::

Open the **Playground** in two tabs. Draw in either; both should update.


:::quiz{id=cap-wb-02-q1}
- prompt: Why include a stroke `id` in each message?
- options: ["So receivers can match incremental point updates back to the right stroke", "It's required by BroadcastChannel", "Performance"]
- answer: So receivers can match incremental point updates back to the right stroke
:::
