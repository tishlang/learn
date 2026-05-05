---
title: "C1 — Chat: Take it real"
summary: One-line diff to make it a deployable Tish server.
---

Local-first demos cheat in the best way: they let you learn physics without learning operations. Tabs on your laptop obey different rules than phones on LTE, though, and at some point you want the latter. The comforting truth is that **most of what you authored is honest application code.** The shim was only standing in for a socket constructor and a routing layer you will own on a host.

This chapter reads like release notes crossed with architecture notes. You will see the smallest diff that swaps the BroadcastChannel shim for a real WebSocket endpoint, sketch what a relay server shape looks like in Tish, and name the forks in the road—managed WebSockets, DIY HTTP, or WebRTC if you truly want to avoid a relay. None of that invalidates the UI you already built; it relocates the wire.

## The diff

The client changes **one import**:

```diff
- import { createBcWebSocket } from "tish-browser-server"
+ // (use the global WebSocket constructor — no shim needed)
```

…and the construction:

```diff
- const ws = createBcWebSocket("bc://chat/" + room)
+ const ws = new WebSocket("wss://chat.example.com/" + room)
```

## The server

A minimal real server. **Save as `chat-server.tish`** on your machine and run:

```bash
tish run --feature http chat-server.tish
```

```tish
import { serve } from "http"

const rooms = {}

fn handle(req) {
  // Static handshake — a real WS server would do the upgrade dance.
  // Many embedders ship a `serveWebSocket(port, onConnect)` helper that
  // wraps this; check your embedder docs.
  return { status: 200, body: "Tish chat relay" }
}

serve(8080, handle)
console.log("listening on :8080")
```

`tish-runtime` doesn't ship a WebSocket *server* in v0.x — you'd typically front the chat with a small Node or Bun process and let Tish handle business logic via `serve(...)`, **OR** use a WS-capable embedder (some Tish hosts add `serveWebSocket`).

## Cheaper: cross-device WebRTC

Skip the server entirely. The whiteboard capstone (C5) covers a paste-the-offer WebRTC handshake that connects two devices peer-to-peer. The chat could use the same approach.

## Deploy patterns

| Where | How |
|---|---|
| Single VPS | `tish build server.tish -o server --feature http,fs,process`; copy binary; `systemd` unit file. |
| Cloudflare Workers | `tish build server.tish --target js`; wrap with a Worker handler. |
| Docker | Two-stage Dockerfile (see [tish-deep / 28-deploy](#/tish-deep/28-deploy)). |

## Wrap-up

You built:
- A multiplayer chat (within a single browser, multiple tabs).
- A drop-in deploy story to make it a real service.

The Capstones C5 (whiteboard) and the beginner Part-VII chat lesson share this engine — same `createBcWebSocket` API, identical "take it real" diff.


:::quiz{id=cap-chat-03-q1}
- prompt: To go from same-origin chat to cross-device chat, the simplest no-server path is...
- options: ["A real WebSocket server", "WebRTC peer-to-peer with paste-the-offer signaling", "Email"]
- answer: WebRTC peer-to-peer with paste-the-offer signaling
:::
