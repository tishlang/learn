---
title: "C4 — REST API: Persistence"
summary: Survive a reload via the IndexedDB-backed fs.
---

The API works, but reloading the page wipes all notes. Time to persist.

## Save on every mutation

```tish
import { readFile, writeFile, fileExists } from "tish-browser-server"

const DB_PATH = "/api-notes.json"

async fn loadNotes() {
  if (!(await fileExists(DB_PATH))) { return { notes: [], nextId: 1 } }
  const raw = await readFile(DB_PATH)
  if (typeof raw !== "string") { return { notes: [], nextId: 1 } }
  try { return JSON.parse(raw) } catch (e) { return { notes: [], nextId: 1 } }
}

async fn saveNotes(state) {
  await writeFile(DB_PATH, JSON.stringify(state))
}
```

Initialize from disk; save after each mutation:

```tish
let state = await loadNotes()

fn handle(req) {
  if (req.method === "POST" && req.path === "/api/notes") {
    const body = JSON.parse(req.body)
    const note = { id: state.nextId, text: body.text }
    state = { notes: state.notes.concat([note]), nextId: state.nextId + 1 }
    saveNotes(state)
    return { status: 201, body: JSON.stringify(note) }
  }
  // ... GET / PUT / DELETE similar — call saveNotes(state) after each mutation
}
```

## Concurrency

A "real" server needs to think about concurrent writes; the SW shim runs handlers serially in the page so you don't have to. **When you take this real**, swap to the host `'fs'` and consider:

- File locking (`flock`).
- Write to `data.tmp` then rename for atomicity.
- A real DB (SQLite via `tish:sqlite` when it lands).

The Capstones-track REST API is intentionally a starting point — production-shape persistence is a chapter unto itself.

:::callout{kind=tip title="Browser caveat"}
IndexedDB is async and per-origin. If a user opens this lesson in two tabs, both tabs see the same data. That's fine here, but in a real app you'd add a locking pattern or use a single-writer service worker.
:::

:::quiz{id=cap-rest-02-q1}
- prompt: Where do tish-browser-server's API state files actually live?
- options: ["A real disk", "Browser IndexedDB", "RAM only — lost on reload"]
- answer: Browser IndexedDB
:::
