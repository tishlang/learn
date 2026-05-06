---
title: Persisting with localStorage
summary: Save state across reloads.
---

Reload a page and your state is gone. **`localStorage`** survives reloads (it's a tiny key/value store the browser keeps for each origin).

## API

```tish
localStorage.setItem("key", "string value")
const v = localStorage.getItem("key")     // "string value" or null
localStorage.removeItem("key")
```

Values are **strings** — `JSON.stringify` / `parse` are your friends for objects.

## Save the sticky notes

Add load-on-startup and save-on-change to last chapter's notes board.

:::sandbox{kind=ide id=33-persist}
import { createRoot, useState, useEffect } from "lattish"

const KEY = "sticky-notes"

fn loadNotes() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) { return [{ id: 1, text: "Welcome — your notes will survive a reload" }] }
    return JSON.parse(raw)
  } catch (e) { return [] }
}

fn saveNotes(notes) {
  try { localStorage.setItem(KEY, JSON.stringify(notes)) } catch (e) { }
}

fn StickyApp() {
  const notesState = useState(loadNotes())
  const notes = notesState[0]
  const setNotes = notesState[1]
  const nextIdState = useState(2)
  const nextId = nextIdState[0]
  const setNextId = nextIdState[1]

  useEffect(() => { saveNotes(notes) }, [notes])

  fn addNote() {
    setNotes(notes.concat([{ id: nextId, text: "New note" }]))
    setNextId(nextId + 1)
  }
  fn updateNote(id, text) {
    setNotes(notes.map((n) => n.id === id ? { id: n.id, text: text } : n))
  }
  fn deleteNote(id) {
    setNotes(notes.filter((n) => n.id !== id))
  }

  const noteEls = notes.map((n) => {
    const captured = n.id
    return <div class="sticky">
      <textarea value={n.text} oninput={(e) => updateNote(captured, e.target.value)} />
      <button class="sticky-delete" onclick={() => deleteNote(captured)}>{"×"}</button>
    </div>
  })

  return <div>
    <header><h1>{"Sticky notes (persistent)"}</h1>
      <button class="add-note" onclick={addNote}>{"+ Add"}</button>
    </header>
    <div class="board">{noteEls}</div>
  </div>
}

createRoot(document.body).render(StickyApp)
:::

:::callout{kind=tip title="useEffect"}
`useEffect(() => { ... }, [deps])` runs after the render whenever any value in `[deps]` changed. Perfect for "save to disk when the data changes."
:::

:::quiz{id=33-persist-q1}
- prompt: Why JSON.stringify before localStorage.setItem?
- options: ["localStorage only stores strings", "Faster reads", "It's optional"]
- answer: localStorage only stores strings
:::
