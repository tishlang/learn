---
title: "C1 — Chat: Client UI"
summary: Lattish UI for messages, input, room name.
---

:::project{title="Real-time chat" time="~30 min" difficulty="Beginner-friendly" summary="Build a multiplayer chat that runs in two browser tabs with no backend. End with a one-line diff to deploy as a real Tish server."}
You'll build:
- A Lattish UI with message list and compose box.
- Hash-routed rooms (`#chat/general`, `#chat/private`).
- BroadcastChannel-backed real-time sync between open tabs.
- A "take it real" appendix to upgrade to a deployable Tish HTTP server.
:::

## The shell

We'll build the UI in this chapter; wire up real-time in the next; deploy in the final.

:::sandbox{kind=ide id=cap-chat-01}
import { createRoot, useState } from "lattish"

fn parseRoom() {
  if (typeof location === "undefined") { return "general" }
  const h = location.hash
  if (h.indexOf("#chat/") === 0) { return h.substring(6) }
  return "general"
}

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

  fn send() {
    if (draft === "") { return }
    const msg = { from: "self", text: draft, at: Date.now() }
    setMessages(messages.concat([msg]))
    setDraft("")
  }

  const log = messages.map((m) => {
    return <div class={"chat-msg chat-msg-" + m.from}>
      <strong>{m.from === "self" ? "you" : m.from}</strong>
      <span>{m.text}</span>
    </div>
  })

  return <div class="chat">
    <header>
      <span>{"Room:"}</span>
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

Right now messages only show in the tab you typed in. Next chapter: make them appear in **every open tab** instantly.

:::callout{kind=tip title="Architecture preview"}
The two pieces we'll add:
1. **Subscribe**: open a `BroadcastChannel` on mount, push received messages into state.
2. **Publish**: when sending, post to the channel **and** add to local state (optimistic UI).
:::

:::quiz{id=cap-chat-01-q1}
- prompt: Why do we need separate `messages` state and `draft` state?
- options: ["Performance", "Different lifecycles — messages persist; draft clears after send", "Tish requires it"]
- answer: Different lifecycles — messages persist; draft clears after send
:::
