---
title: "C5 — Whiteboard: Presence + WebRTC"
summary: User cursors, undo, paste-the-offer cross-device sync.
---

Two finishing touches.

## Presence — see other cursors

Each user picks a random color + name on load. Every ~30ms, broadcast `{ kind: "cursor", name, color, x, y }`. The receiver renders an overlay layer.

```tish
fn drawOverlay(ctx, peers) {
  let i = 0
  const names = Object.keys(peers)
  while (i < names.length) {
    const p = peers[names[i]]
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#000"
    ctx.fillText(p.name, p.x + 10, p.y + 4)
    i = i + 1
  }
}
```

Stale entries: `setInterval(prunePeers, 1000)` removes anyone whose last `cursor` message is more than 5s old.

## Per-user undo

Tag each stroke with the originating user. Undo removes only your own most-recent stroke (a "real" multi-user undo is harder; same-user is fine for v1).

```tish
fn myUndo() {
  const i = strokes.length - 1
  while (i >= 0 && strokes[i].userId !== meId) { i = i - 1 }
  if (i >= 0) {
    const removedId = strokes[i].id
    strokes.splice(i, 1)
    if (ws !== null) { ws.send(JSON.stringify({ kind: "undo", id: removedId })) }
    redraw()
  }
}
```

## WebRTC bonus — cross-device, no server

`BroadcastChannel` only connects same-origin tabs on **the same machine**. To draw with someone across the internet **without** a signaling server, use **WebRTC paste-the-offer**:

1. **Tab A** creates an `RTCPeerConnection`, opens a data channel, calls `createOffer()`, sets local description, copies the resulting SDP string to clipboard.
2. **User A** sends that string to user B (Slack, email, whatever).
3. **Tab B** pastes it, calls `setRemoteDescription(offer)`, `createAnswer()`, sets local, copies the answer SDP back.
4. **User B** sends that answer back.
5. **Tab A** pastes the answer, calls `setRemoteDescription(answer)`. Connection is open.

```tish
async fn createOffer(pc) {
  const channel = pc.createDataChannel("paint")
  pc.onicecandidate = (e) => { /* gather */ }
  await pc.setLocalDescription(await pc.createOffer())
  // Wait for ICE gathering to finish (or include candidates as they trickle).
  return JSON.stringify(pc.localDescription)
}
```

This is fiddly but **completely serverless** for two-person sessions. Three+ people need a signaling service or a TURN relay.

## Take it real (server)

The `bc://wb/main` channel is local. To put the whiteboard on the open internet, run a Tish HTTP+WS broadcast relay. The chat capstone (C1) walked through this — the same shape applies here.

:::quiz{id=cap-wb-03-q1}
- prompt: How does WebRTC paste-the-offer skip the need for a signaling server?
- options: ["The peers exchange SDP strings out-of-band (chat, email)", "They use BroadcastChannel", "They don't — a STUN server is still required"]
- answer: The peers exchange SDP strings out-of-band (chat, email)
:::
