---
title: "C1 — Chat: Real-time sync"
summary: BroadcastChannel + WebSocket-shaped shim.
---

`tish-browser-server` exposes `createBcWebSocket("bc://...")`. The returned object has `onopen` / `onmessage` / `onclose` / `send` / `close` — same shape as a real `WebSocket`. Underneath, it's a `BroadcastChannel`, so any same-origin tab that opens the same channel name can talk.

## Wire up subscribe + publish

:::sandbox{kind=ide id=cap-chat-02}
import { createRoot, useState, useEffect, useRef } from "lattish"
import { createBcWebSocket } from "tish-browser-server"

fn parseRoom() {
  if (typeof location === "undefined") { return "general" }
  const h = location.hash
  if (h.indexOf("#chat/") === 0) { return h.substring(6) }
  return "general"
}

fn randomName() {
  const adj = ["Quick", "Brave", "Calm", "Sharp", "Witty", "Curious"]
  const noun = ["Otter", "Heron", "Fox", "Lynx", "Crane", "Moth"]
  return adj[Math.floor(Math.random() * adj.length)] + noun[Math.floor(Math.random() * noun.length)]
}

const NAME = randomName()

fn ChatApp() {
  const roomState = useState(parseRoom())
  const room = roomState[0]
  const setRoom = roomState[1]
  const messagesState = useState([])
  const messages = messagesState[0]
  const setMessages = messagesState[1]
  const draftState = useState("")
  const draft = draftState[0]
  const setDraft = draftState[1]
  const wsRef = useRef(null)

  useEffect(() => {
    const ws = createBcWebSocket("bc://chat/" + room)
    wsRef.current = ws
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        setMessages(messages.concat([msg]))
      } catch (e) { }
    }
    return () => { ws.close() }
  }, [room, messages])

  fn send() {
    if (draft === "") { return }
    const msg = { from: NAME, text: draft, at: Date.now() }
    if (wsRef.current !== null) { wsRef.current.send(JSON.stringify(msg)) }
    setMessages(messages.concat([{ from: "self (" + NAME + ")", text: draft, at: msg.at }]))
    setDraft("")
  }

  const log = messages.map((m) => {
    return <div class="chat-msg">
      <strong>{m.from}</strong>
      <span>{m.text}</span>
    </div>
  })

  return <div class="chat">
    <header>
      <span>{"You are: " + NAME + " · Room:"}</span>
      <input value={room} oninput={(e) => setRoom(e.target.value)} />
    </header>
    <div class="chat-log">{log}</div>
    <div class="chat-compose">
      <input
        value={draft}
        oninput={(e) => setDraft(e.target.value)}
        onkeydown={(e) => { if (e.key === "Enter") { send() } }}
        placeholder="type a message..." />
      <button onclick={send}>{"Send"}</button>
    </div>
  </div>
}

createRoot(document.body).render(ChatApp)
:::

Now **open this lesson in a second tab** and type in either. The other updates instantly.

:::callout{kind=tip title="Why optimistic UI"}
We add the message to local state *before* the round-trip. Without that, your own messages would only appear when the BroadcastChannel callback fires — which works, but feels laggy. Optimistic adds keep the UI snappy.
:::

:::quiz{id=cap-chat-02-q1}
- prompt: Two tabs of this lesson are connected because BroadcastChannel...
- options: ["...goes through a server", "...delivers messages between same-origin browser contexts (tabs, iframes, workers)", "...uses WebRTC peer-to-peer"]
- answer: ...delivers messages between same-origin browser contexts (tabs, iframes, workers)
:::
