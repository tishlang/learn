---
title: "C4 — REST API: Client + take it real"
summary: A Lattish frontend that talks to your in-browser API.
---

There is a meme in backend tutorials: you write `app.get("/posts")` but you never see another window call it. This chapter closes the loop. We'll run a **real `serve` handler** alongside a **real Lattish UI** in the same iframe, so the Network tab shows JSON round-trips—even though everything still lives inside the tab's Service Worker shim.

If that sounds like sleight of hand, lean into the lesson: **same URL space, same verbs, same payloads** you would use on a VPS. The only difference later is which import registers the listener. Read the responsibilities first, then scroll to the Playground and watch the machinery you already understand from prior chapters actually move data.

Concretely, the capstone runs **one compiled program** that does two jobs: register an HTTP handler with `serve(8080, handle)` and mount a small **Notes** UI that uses ordinary **`fetch("/api/notes")`**. The browser still does real HTTP — DevTools can show the requests — but the Service Worker from `tish-browser-server` terminates them in-process and calls your `handle(req)`.

## Handler responsibilities

- `GET /api/notes` → JSON array of notes  
- `POST /api/notes` → parse JSON body, append with `id`, return 201  
- `DELETE /api/notes/:id` → remove and return 204  
- else → 404  

## Client responsibilities

On mount, `GET` to populate the list. Add sends `POST` then refreshes. Delete sends `DELETE` then refreshes. No magic client library — just `fetch` and `JSON`.

## Full runnable

The **Playground** at the bottom bundles handler + UI so you can try CRUD in one place. Read the flow above first; then open Network in DevTools **after** you run it to watch the round-trips.

:::sandbox{kind=ide id=cap-rest-03}
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
  const prefix = "/api/notes/"
  if (req.path.indexOf(prefix) === 0) {
    const id = parseInt(req.path.substring(prefix.length), 10)
    if (req.method === "DELETE") {
      notes = notes.filter((n) => n.id !== id)
      return { status: 204, body: "" }
    }
  }
  return { status: 404, body: "Not Found" }
}

serve(8080, handle)

fn NotesUI() {
  const itemsState = useState([])
  const items = itemsState[0]
  const setItems = itemsState[1]
  const draftState = useState("")
  const draft = draftState[0]
  const setDraft = draftState[1]

  async fn refresh() {
    const res = await fetch("/api/notes")
    const data = await res.json()
    setItems(data)
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
    return <li>
      <span>{n.text}</span>
      <button onclick={() => remove(cap)}>{"×"}</button>
    </li>
  })

  return <div class="card">
    <h1>{"Notes API"}</h1>
    <div class="add">
      <input value={draft}
        oninput={(e) => setDraft(e.target.value)}
        onkeydown={(e) => { if (e.key === "Enter") { add() } }} />
      <button onclick={add}>{"Add"}</button>
    </div>
    <ul>{rows}</ul>
  </div>
}

createRoot(document.body).render(NotesUI)
:::

## Take it real

Three lines. Swap one import; remove the SW registration; change the URL prefix to your deployed origin.

### Server side

```diff
- import { serve } from "tish-browser-server"
+ import { serve } from "http"
```

```bash
tish build server.tish -o server --feature http,fs --feature process
./server                # listening on :8080
```

### Client side

```diff
- await fetch("/api/notes")
+ await fetch("https://api.example.com/api/notes")
```

Drop CORS headers in your handler:

```tish
fn corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE",
    "Access-Control-Allow-Headers": "Content-Type"
  }
}
```

### Optional: swap IndexedDB for Postgres

The in-browser capstone keeps `notes` in RAM (or you extended it with the virtual `fs` / IndexedDB patterns from earlier chapters). On a real server, point the same route handlers at **`@tishlang/pg`**: `connect(process.env.DATABASE_URL)`, `prepare` once at startup, and inside `GET /api/notes` call `queryPrepared` instead of returning the in-memory array. Build with **`--feature http,pg`** (plus whatever else you use). See the [@tishlang/pg module](/modules/tish-pg/01-connect-and-query) for a full walk-through.

That's it. Same handler code. Same client code.

When you run the **Playground** below (after the quiz), the `fetch("/api/notes")` calls **really do go through HTTP** — your DevTools Network tab will show them. They terminate at the in-page Service Worker, not a remote server, which is why the same handler can become a real daemon with a one-line import swap.


:::quiz{id=cap-rest-03-q1}
- prompt: What does "take it real" require for the REST API capstone?
- options: ["Three+ files of changes", "Swap one import; build with --feature http; add CORS headers", "Full rewrite"]
- answer: Swap one import; build with --feature http; add CORS headers
:::
