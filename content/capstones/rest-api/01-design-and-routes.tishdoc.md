---
title: "C4 — REST API: Design and routes"
summary: CRUD endpoints with serve(...) — Service-Worker-backed.
---

:::project{title="Tiny REST API" time="~45 min" difficulty="Intermediate" summary="Build a real REST API for notes — CRUD, JSON, status codes, CORS — entirely in the browser via a Service Worker shim. Take-it-real to a Tish HTTP server is one line."}
You'll build:
- `GET / POST / PUT / DELETE /api/notes` endpoints.
- IndexedDB-backed persistence.
- A Lattish frontend that calls the API via real `fetch()`.
- A "take it real" diff — same code on a deployable server.
:::

## REST in 30 seconds

| Verb | Path | Meaning |
|---|---|---|
| GET  | /api/notes        | list all |
| POST | /api/notes        | create |
| GET  | /api/notes/:id    | read one |
| PUT  | /api/notes/:id    | replace |
| DELETE | /api/notes/:id  | remove |

Tish's `serve(port, handler)` gives you `req.method` / `req.path` / `req.body` (string). You parse the path, dispatch by verb, return `{ status, body, headers? }`.

## The router

```tish
import { serve } from "tish-browser-server"

let notes = []
let nextId = 1

fn matchNote(path) {
  // Returns the id from "/api/notes/123" or null.
  const prefix = "/api/notes/"
  if (path.indexOf(prefix) === 0) {
    return parseInt(path.substring(prefix.length), 10)
  }
  return null
}

fn handle(req) {
  if (req.method === "GET" && req.path === "/api/notes") {
    return { status: 200, body: JSON.stringify(notes), headers: { "Content-Type": "application/json" } }
  }
  if (req.method === "POST" && req.path === "/api/notes") {
    const body = JSON.parse(req.body)
    const note = { id: nextId, text: body.text }
    nextId = nextId + 1
    notes.push(note)
    return { status: 201, body: JSON.stringify(note), headers: { "Content-Type": "application/json" } }
  }
  const id = matchNote(req.path)
  if (id !== null) {
    if (req.method === "GET") {
      const found = notes.filter((n) => n.id === id)
      if (found.length === 0) { return { status: 404, body: "Not found" } }
      return { status: 200, body: JSON.stringify(found[0]) }
    }
    if (req.method === "PUT") {
      const body = JSON.parse(req.body)
      notes = notes.map((n) => n.id === id ? { id: id, text: body.text } : n)
      return { status: 200, body: JSON.stringify({ id: id, text: body.text }) }
    }
    if (req.method === "DELETE") {
      notes = notes.filter((n) => n.id !== id)
      return { status: 204, body: "" }
    }
  }
  return { status: 404, body: "Not Found" }
}

serve(8080, handle)
```

The `port` is ignored — the SW shim dispatches by path within the page. The user's `fetch("/api/notes")` is intercepted and routed through `handle`.

## Pre-flight check

Open the browser DevTools Network tab. The `fetch("/api/notes")` calls go to the **Service Worker**, not over the network. Beautiful.

:::callout{kind=tip title="Status codes that matter"}
- `200` OK (read/update success).
- `201` Created (POST returns the new resource).
- `204` No Content (DELETE — nothing to return).
- `400` Bad Request (malformed JSON).
- `404` Not Found.
- `409` Conflict (e.g. duplicate id).
:::

:::quiz{id=cap-rest-01-q1}
- prompt: What status code does a successful DELETE typically return?
- options: ["200", "201", "204"]
- answer: 204
:::
