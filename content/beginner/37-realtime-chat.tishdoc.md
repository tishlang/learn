---
title: Real-time chat (no backend!)
summary: BroadcastChannel-backed WebSocket between two browser tabs.
---

A real-time chat app **with no backend**. Two browser tabs of this lesson can talk to each other directly via the browser's `BroadcastChannel` API. We expose it through `tish-browser-server`'s `WebSocket` shim — the API matches the real `WebSocket`, so the same code is one-line away from running on a deployable server (see the Capstones track).

## Send and receive

:::sandbox{kind=ide id=37-chat}
import { createRoot, useState, useEffect, useRef } from "lattish"
import { createBcWebSocket } from "tish-browser-server"

fn ChatApp() {
  const messagesState = useState([])
  const messages = messagesState[0]
  const setMessages = messagesState[1]
  const draftState = useState("")
  const draft = draftState[0]
  const setDraft = draftState[1]
  const wsRef = useRef(null)

  useEffect(() => {
    const ws = createBcWebSocket("bc://chat/general")
    wsRef.current = ws
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        setMessages(messages.concat([msg]))
      } catch (e) { }
    }
    return () => { ws.close() }
  }, [messages])

  fn send() {
    if (draft === "") { return }
    const msg = { from: "me", text: draft, at: Date.now() }
    if (wsRef.current !== null) { wsRef.current.send(JSON.stringify(msg)) }
    setMessages(messages.concat([{ from: "self", text: draft, at: msg.at }]))
    setDraft("")
  }

  const lines = messages.map((m) => {
    return <div class={"chat-msg chat-msg-" + m.from}>
      <strong>{m.from === "self" ? "you" : "other"}</strong>
      <span>{m.text}</span>
    </div>
  })

  return <div class="chat">
    <h2>{"Chat — open this lesson in two tabs"}</h2>
    <div class="chat-log">{lines}</div>
    <div class="chat-compose">
      <input value={draft} oninput={(e) => setDraft(e.target.value)}
        onkeydown={(e) => { if (e.key === "Enter") { send() } }}
        placeholder="type a message…" />
      <button onclick={send}>{"Send"}</button>
    </div>
  </div>
}

createRoot(document.body).render(ChatApp)
:::

To verify: **open this lesson in a second tab**, type in either, watch the other update instantly.

## Why this works

`BroadcastChannel` is a browser API that delivers messages between same-origin browser contexts (tabs, iframes, workers). `tish-browser-server`'s `createBcWebSocket("bc://...")` wraps it in a `WebSocket`-shaped object so you can write the same code that you'd write for a real server.

:::callout{kind=tip title="Take it real"}
If you wanted multiple **users on different machines** chatting, you'd run a real Tish server and import `WebSocket` from `'http'` instead of from `tish-browser-server`. The capstone track shows the line-for-line diff.
:::

:::quiz{id=37-chat-q1}
- prompt: Why does this chat work without a server?
- options: ["BroadcastChannel delivers messages between same-origin browser tabs", "It's secretly using a server", "Browsers have built-in chat"]
- answer: BroadcastChannel delivers messages between same-origin browser tabs
:::
