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

Most tutorials jump straight into `WebSocket` and lose people before they have anything on screen. That is backwards. A chat app is **UX first**: scrolling history, drafting text, swapping rooms—all of that is boring web UI, but it is the part users touch. Nail it early and the transport layer feels like plugging in a cable instead of rewriting the house.

Here we pretend the backend does not exist yet. You will render a plausible room picker, transcript, and compose box entirely with Lattish state. When you eventually wire real-time messaging, none of those components need to become cleverer—they only subscribe to events the same way you already append to local arrays today.

## What this chapter builds

By the end you have a **single-tab chat shell**: room name in the hash (`#chat/general`), a message list, and a compose box. Nothing leaves the browser yet — messages you send only appear in **this** tab. The next chapter swaps the data path for a WebSocket-shaped channel so every open tab sees the same room.

## Why three pieces of state?

- **`room`** — driven from `location.hash` so bookmarks and refreshes keep you in the same room (we only *read* the hash in this chapter; you can still type a room name in the input to experiment).
- **`messages`** — append-only log of `{ from, text, at }` for the transcript.
- **`draft`** — the string in the compose field; it clears on send so the input does not fight the log.

## Hash helper

The playground uses a tiny parser so the app knows which room label to show:

```tish
fn parseRoom() {
  if (typeof location === "undefined") { return "general" }
  const h = location.hash
  if (h.indexOf("#chat/") === 0) { return h.substring(6) }
  return "general"
}
```

**Playground** — at the end of this page — is the full Lattish UI: header, log, send button, and starter code you can edit before we wire up sync.

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

After you run the Playground, try sending a few lines: they only show in the tab you typed in. The next chapter makes them appear in **every open tab** instantly.

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
