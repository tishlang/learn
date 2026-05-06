---
title: JSX and Lattish
summary: Hooks, createRoot, render model.
---

Tish parses **JSX** out of the box. The default JSX runtime is [**Lattish**](https://github.com/tishlang/lattish) — small, hooks-based, very React-shaped.

## The hooks

```tish
import { createRoot, useState, useRef, useMemo, useEffect, useLayoutEffect } from "lattish"
```

| Hook | Use |
|---|---|
| `useState(initial)` | `[value, setValue]`. `setValue(x)` or `setValue((prev) => next)`. |
| `useRef(initial)` | `{ current: ... }`. Mutable across renders, doesn't trigger re-render. |
| `useMemo(factory, deps?)` | Cached value; recomputes when `deps` shallow-changes (numbers/strings/bools/null + nested arrays of those). Omit deps to memoize forever. |
| `useEffect(cb, deps)` | After render. Return a cleanup. |
| `useLayoutEffect(cb, deps)` | Synchronously after DOM update; for layout reads/writes. |

Function values are **not compared by identity** in `deps` today. Wrap stable callbacks in `useMemo` if you need referential stability.

## Capstone exercise: Lattish todo with memoized counts

:::sandbox{kind=ide id=23-todo-lattish}
import { createRoot, useState, useMemo } from "lattish"

fn TodoApp() {
  const itemsState = useState([
    { id: 1, text: "Learn Tish", done: true },
    { id: 2, text: "Build a thing", done: false },
    { id: 3, text: "Ship it", done: false }
  ])
  const items = itemsState[0]
  const setItems = itemsState[1]

  const counts = useMemo(() => {
    let done = 0
    let i = 0
    while (i < items.length) {
      if (items[i].done) { done = done + 1 }
      i = i + 1
    }
    return { done: done, total: items.length }
  }, [items])

  fn toggle(id) {
    setItems(items.map((t) => t.id === id ? { id: t.id, text: t.text, done: !t.done } : t))
  }

  const rows = items.map((t) => {
    const cap = t.id
    return <li class={t.done ? "done" : ""}>
      <input type="checkbox" checked={t.done} onchange={() => toggle(cap)} />
      <span>{t.text}</span>
    </li>
  })

  return <div class="card">
    <h2>{"Todos — " + counts.done + " / " + counts.total}</h2>
    <ul>{rows}</ul>
  </div>
}

createRoot(document.body).render(TodoApp)
:::

## Render model

Each flush re-runs the root component. **`useMemo`** caches subtrees and returns a `Value` that the host can `Rc`-reuse when unchanged. **AppKit / native UI hosts** may still rebuild widgets from scratch until they implement incremental commit — `React.memo` automatic component skipping is **not** the default in the language today.

:::callout{kind=note title="The Lattish module track"}
This chapter is the language-spec view of Lattish. For an applied tour with worked examples, see the **Modules → Lattish** track: JSX + the h runtime, hooks deep-dive, effects + memoization, and a substantial chapter on choosing the right HTML element + the four ways to apply CSS.
:::

:::quiz{id=23-jsx-q1}
- prompt: When does `useMemo` recompute its value?
- options: ["Every render", "When deps shallow-change", "Never"]
- answer: When deps shallow-change
:::
