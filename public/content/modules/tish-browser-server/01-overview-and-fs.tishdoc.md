---
title: "tish-browser-server — overview + virtual fs"
summary: serve / fs / WebSocket / process — entirely in your tab.
---

**`tish-browser-server`** is the secret sauce that makes the Capstones run **with no backend**. It mirrors the host module APIs (`'http'` / `'fs'` / `'process'`) over Service Worker, BroadcastChannel, and IndexedDB.

## Why it exists

Tish's standard `'http'` and `'fs'` modules require a host runtime that can bind ports and access the filesystem. In a browser tab, neither is possible. **But** the same code shape is achievable using browser primitives:

| Server-side API | Browser equivalent | Lives in |
|---|---|---|
| `serve(port, handler)` | Service Worker intercepting in-page `fetch()` | `sw_serve.tish` + `sw_worker.tish` |
| `WebSocket(url)` cross-tab | `BroadcastChannel` | `bc_websocket.tish` |
| `readFile` / `writeFile` | IndexedDB | `idb_fs.tish` |
| `process.env` / `argv` | URLSearchParams + localStorage | `process_mock.tish` |

The result: **one-line "take-it-real" diff** between in-browser code and a deployable Tish server.

```diff
- import { serve, readFile, writeFile } from "tish-browser-server"
+ import { serve } from "http"
+ import { readFile, writeFile } from "fs"
```

## Virtual fs

The IndexedDB-backed module is the easiest entry point. It exposes the same five functions as the real `fs`:

```tish
import { readFile, writeFile, fileExists, readDir, mkdir } from "tish-browser-server"

await writeFile("/notes/welcome.md", "# Welcome\n")
const text = await readFile("/notes/welcome.md")
const exists = await fileExists("/notes/welcome.md")
const list = await readDir("/notes")
await mkdir("/notes/2026")
```

Differences from a real disk:

- **Per-origin, persistent**. Each origin (host + port + protocol) gets its own database. Survives reload, browser restart, etc.
- **Async only.** The IndexedDB API is async; we mirror that in the shim.
- **No real directories.** `readDir` returns immediate children by prefix. `mkdir` writes a `.keep` sentinel so empty directories appear.
- **Quotas vary.** Browsers typically allow tens to hundreds of MB before prompting. Don't ship a 5GB disk image.
- **`readFile` returns `{ error: "..." }` on miss.** Same as the host fs module. Always handle it:

```tish
const r = await readFile("/maybe-missing.txt")
if (r !== null && typeof r === "object" && "error" in r) {
  console.log("missing:", r.error)
} else {
  console.log("got:", r)
}
```

## Try it

:::sandbox{kind=ide id=mod-bs-01}
import { createRoot, useState, useEffect } from "lattish"
import { writeFile, readFile, readDir, mkdir, unlink } from "tish-browser-server"

const DIR = "/demo-notes"

fn FsDemo() {
  const filesState = useState([])
  const files = filesState[0]
  const setFiles = filesState[1]
  const draftState = useState("")
  const draft = draftState[0]
  const setDraft = draftState[1]

  async fn refresh() {
    try { await mkdir(DIR) } catch (e) { }
    const all = (await readDir(DIR)).filter((n) => n !== ".keep")
    setFiles(all)
  }
  useEffect(() => { refresh() }, [])

  async fn add() {
    if (draft === "") { return }
    const name = "note-" + Date.now() + ".txt"
    await writeFile(DIR + "/" + name, draft)
    setDraft("")
    refresh()
  }
  async fn remove(name) {
    await unlink(DIR + "/" + name)
    refresh()
  }

  const rows = files.map((n) => {
    const captured = n
    return <li>
      <code>{n}</code>
      <button onclick={() => remove(captured)}>{"×"}</button>
    </li>
  })

  return <div class="card">
    <h1>{"Virtual fs demo"}</h1>
    <p>{"Add a note. Reload the page. The list survives."}</p>
    <input value={draft} oninput={(e) => setDraft(e.target.value)} placeholder="note text..." />
    <button onclick={add}>{"Save"}</button>
    <ul>{rows}</ul>
  </div>
}

createRoot(document.body).render(FsDemo)
:::

Add a few notes, reload the page, the list is still there. They're in **your browser's IndexedDB** under this origin.

:::callout{kind=tip title="Inspecting IndexedDB"}
DevTools → Application → IndexedDB → `tish-browser-server` → `files` shows every key/value. Useful when debugging a stuck file.
:::

:::quiz{id=mod-bs-01-q1}
- prompt: How does tish-browser-server's `readFile` signal a missing file?
- options: ["Throws an exception", "Returns { error: \"...\" }", "Returns null"]
- answer: Returns { error: "..." }
:::

Next: the Service Worker that makes `serve()` work.
