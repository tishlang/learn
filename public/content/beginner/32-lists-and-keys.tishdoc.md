---
title: Rendering lists
summary: Build, edit, and delete a list of items.
---

The most common UI pattern is **a list of things** — todos, posts, notes. Lattish renders an array of JSX nodes and you're done.

## Sticky-notes board

Each note has an `id` and `text`. We add new ones, edit them in place, and delete them.

:::sandbox{kind=ide id=32-sticky}
import { createRoot, useState } from "lattish"

fn StickyApp() {
  const notesState = useState([
    { id: 1, text: "Welcome — click + to add a note" }
  ])
  const notes = notesState[0]
  const setNotes = notesState[1]
  const nextIdState = useState(2)
  const nextId = nextIdState[0]
  const setNextId = nextIdState[1]

  fn addNote() {
    const n = { id: nextId, text: "New note" }
    setNotes(notes.concat([n]))
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
      <textarea
        value={n.text}
        oninput={(e) => updateNote(captured, e.target.value)} />
      <button class="sticky-delete" onclick={() => deleteNote(captured)}>{"×"}</button>
    </div>
  })

  return <div>
    <header><h1>{"Sticky notes"}</h1>
      <button class="add-note" onclick={addNote}>{"+ Add"}</button>
    </header>
    <div class="board">{noteEls}</div>
  </div>
}

createRoot(document.body).render(StickyApp)
:::

:::callout{kind=tip title="Why `const captured = n.id`?"}
Inside `notes.map`, the arrow function `(e) => deleteNote(n.id)` would capture the variable `n` from each iteration — but in some compilation targets the closure could see the latest `n` rather than the one when the click was wired. Pulling `n.id` into a fresh `const` (`captured`) makes the binding explicit and bulletproof.
:::

:::quiz{id=32-list-q1}
- prompt: How do you remove an item from a state array?
- options: ["Mutate the array directly", "Set state to a new array filtered without the item", "Both work the same"]
- answer: Set state to a new array filtered without the item
:::
