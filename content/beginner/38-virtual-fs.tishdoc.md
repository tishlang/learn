---
title: A file system in your tab
summary: IndexedDB-backed fs.readFile / writeFile.
---

`localStorage` is fine for small key/value storage. For multi-file, multi-megabyte data, the browser has **IndexedDB**. `tish-browser-server` wraps it as a familiar `fs`-style API:

```tish
import { readFile, writeFile, readDir, fileExists } from "tish-browser-server"

await writeFile("/notes/welcome.md", "# Welcome\n")
const text = await readFile("/notes/welcome.md")
const list = await readDir("/notes")
```

Same API as the real `fs` module — making the take-it-real diff a one-liner.

## Capstone: in-browser notes app

Multiple files. Survives reload. Add, edit, delete, switch.

:::sandbox{kind=ide id=38-fs}
import { createRoot, useState, useEffect } from "lattish"
import { readDir, readFile, writeFile, mkdir } from "tish-browser-server"

const DIR = "/notes"

fn NotesApp() {
  const filesState = useState([])
  const files = filesState[0]
  const setFiles = filesState[1]
  const currentState = useState(null)
  const current = currentState[0]
  const setCurrent = currentState[1]
  const textState = useState("")
  const text = textState[0]
  const setText = textState[1]

  async fn refresh() {
    try { await mkdir(DIR) } catch (e) { }
    const all = await readDir(DIR)
    const real = all.filter((n) => n !== ".keep")
    setFiles(real)
    if (real.length > 0 && current === null) {
      const first = real[0]
      setCurrent(first)
      const t = await readFile(DIR + "/" + first)
      if (typeof t === "string") { setText(t) }
    }
  }

  useEffect(() => { refresh() }, [])

  async fn open(name) {
    setCurrent(name)
    const t = await readFile(DIR + "/" + name)
    setText(typeof t === "string" ? t : "")
  }

  async fn save() {
    if (current === null) { return }
    await writeFile(DIR + "/" + current, text)
  }

  async fn add() {
    const name = "note-" + (files.length + 1) + ".md"
    await writeFile(DIR + "/" + name, "# " + name + "\n")
    refresh()
  }

  const fileList = files.map((n) => {
    const captured = n
    const isCurrent = n === current
    return <button class={isCurrent ? "fs-file fs-file-active" : "fs-file"} onclick={() => open(captured)}>{n}</button>
  })

  return <div class="fs">
    <div class="fs-sidebar">
      <button onclick={add}>{"+ New file"}</button>
      {fileList}
    </div>
    <div class="fs-main">
      {current !== null
        ? <div>
            <div class="fs-path">{current}</div>
            <textarea value={text} oninput={(e) => setText(e.target.value)} />
            <button class="fs-save" onclick={save}>{"Save"}</button>
          </div>
        : <p>{"No files. Click + New file."}</p>}
    </div>
  </div>
}

createRoot(document.body).render(NotesApp)
:::

:::callout{kind=tip title="Reload to verify"}
After saving a few notes, reload this page and re-open the lesson. Your notes will still be there — IndexedDB persists across browser sessions.
:::

:::quiz{id=38-fs-q1}
- prompt: Where do tish-browser-server's "files" actually live?
- options: ["In a real filesystem on disk", "In the browser's IndexedDB", "In RAM only"]
- answer: In the browser's IndexedDB
:::
