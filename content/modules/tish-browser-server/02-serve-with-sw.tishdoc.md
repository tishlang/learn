---
title: "tish-browser-server — serve() via Service Worker"
summary: How an in-tab REST API actually routes requests.
---

`serve(port, handler)` from this package looks identical to its `http` counterpart, but a Service Worker stands between the browser and your handler.

## Architecture

```
   Page                      Service Worker            Page (handler)
   ────                      ───────────────           ─────────────
   fetch("/api/notes") ─────► (intercepts) ─postMessage─► your handler runs
                                                            │
                              ◄──Response──────────postMessage─ returns { status, body }
   <- result
```

1. Page registers `/dist/tish-sw.js` as a Service Worker on first call to `serve(...)`.
2. Page sends `{ kind: "tish-route-set", scope: "/" }` to the SW.
3. Any in-page `fetch(...)` whose path isn't `/dist/...` or `/content/...` is intercepted.
4. SW asks the controlling client (the page) for a response via `postMessage`.
5. Page runs your handler, returns `{ status, body, headers? }` via `postMessage`.
6. SW resolves the original `fetch` with the response.

The whole round-trip is a few milliseconds.

## What `serve(port, handler)` accepts

```tish
import { serve } from "tish-browser-server"

serve(8080, async (req) => {
  // req.method  -> "GET" / "POST" / etc.
  // req.path    -> "/api/notes"
  // req.query   -> "?foo=bar" (raw)
  // req.headers -> { "content-type": "application/json", ... }
  // req.body    -> string (JSON or form data)
  return { status: 200, body: { ok: true } }
})
```

`port` is ignored — there's no port to bind. All routing is by path within the page's origin.

The handler can be **async** and return a Promise of `{ status, body, headers? }`. Bodies that aren't strings are JSON-stringified and `Content-Type: application/json` is set automatically.

## A complete REST API in your tab

:::sandbox{kind=ide id=mod-bs-02}
import { createRoot, useState, useEffect } from "lattish"
import { serve } from "tish-browser-server"

let notes = []
let nextId = 1

fn handle(req) {
  if (req.method === "GET" && req.path === "/api/notes") {
    return { status: 200, body: notes }
  }
  if (req.method === "POST" && req.path === "/api/notes") {
    const body = JSON.parse(req.body)
    const note = { id: nextId, text: body.text }
    nextId = nextId + 1
    notes = notes.concat([note])
    return { status: 201, body: note }
  }
  if (req.method === "DELETE" && req.path.indexOf("/api/notes/") === 0) {
    const id = parseInt(req.path.substring("/api/notes/".length), 10)
    notes = notes.filter((n) => n.id !== id)
    return { status: 204, body: "" }
  }
  return { status: 404, body: "Not Found" }
}

serve(8080, handle)

fn UI() {
  const itemsState = useState([])
  const items = itemsState[0]
  const setItems = itemsState[1]
  const draftState = useState("")
  const draft = draftState[0]
  const setDraft = draftState[1]

  async fn refresh() {
    const r = await fetch("/api/notes")
    setItems(await r.json())
  }
  useEffect(() => { refresh() }, [])

  async fn add() {
    if (draft === "") { return }
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: draft })
    })
    setDraft("")
    refresh()
  }
  async fn remove(id) {
    await fetch("/api/notes/" + id, { method: "DELETE" })
    refresh()
  }

  const rows = items.map((n) => {
    const cap = n.id
    return <li>{n.text} <button onclick={() => remove(cap)}>{"×"}</button></li>
  })

  return <div class="card">
    <h1>{"Notes API in your tab"}</h1>
    <input value={draft} oninput={(e) => setDraft(e.target.value)} />
    <button onclick={add}>{"Add"}</button>
    <ul>{rows}</ul>
  </div>
}

createRoot(document.body).render(UI)
:::

Open DevTools → Network. Each `fetch("/api/notes")` shows a real request that's served by your handler — but no network packet leaves the tab.

## Constraints

- **HTTPS or localhost.** Service Workers require a secure origin. Plain `file://` and `http://` (non-localhost) won't work.
- **Scope = origin.** SW can only intercept requests inside its origin and scope path.
- **First load is cold.** The SW registers + activates on first call; subsequent loads are instant.
- **Headers normalized to lowercase.** Match against `req.headers["content-type"]`, not `Content-Type`.

## "Take it real"

When you're ready to deploy, change one import:

```diff
- import { serve } from "tish-browser-server"
+ import { serve } from "http"
```

…build for native:

```bash
tish build server.tish -o server --feature http,fs --feature process
./server   # listening on :8080
```

Same code. Same client. Real network traffic.

:::quiz{id=mod-bs-02-q1}
- prompt: Why is the `port` argument ignored in tish-browser-server's serve()?
- options: ["The shim routes by path inside the page; there's nothing to bind", "Performance", "Backwards compatibility"]
- answer: The shim routes by path inside the page; there's nothing to bind
:::

That's a complete REST API in a browser tab. Next we'll briefly cover BroadcastChannel and `process`.
