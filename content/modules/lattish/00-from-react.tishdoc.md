---
title: "Coming from React"
summary: How Lattish maps to React, line by line.
---

If you've written React, **you already know 95% of Lattish**. This chapter is the cheat-sheet that gets you the last 5% in 10 minutes.

If you haven't written React, skip to [01 — JSX and the h runtime](/modules/lattish/01-jsx-and-h). The remaining chapters in this module teach Lattish from scratch.

## The big picture

[Lattish](https://lattish.com/docs) is a minimal JSX runtime for Tish — same shape as React, half the surface area, ~800 lines of source. The hooks model is React's. The render model is React's. The mental model transfers cleanly.

Where Lattish differs is **what it leaves out** — and a couple of small ergonomics that fall out of being a Tish-first library.

## Side-by-side

```text
React                                Lattish
---------------------------------    ---------------------------------
import React from "react"            import { h } from "lattish"
import { useState } from "react"     import { useState } from "lattish"

function Counter() {                 fn Counter() {
  const [n, setN] = useState(0)        let [n, setN] = useState(0)
  return (                             return (
    <button                              <button
      className="big"                     class="big"
      onClick={() => setN(n + 1)}>        onclick={() => setN(n + 1)}>
      {n}                                 {n}
    </button>                            </button>
  )                                    )
}                                    }

const root = createRoot(document      createRoot(document.body).render(
  .getElementById("root"))             Counter
root.render(<Counter />)             )
```

Skim that. If anything pops out, the next sections explain it.

## What's the same

| Concept | React | Lattish |
|---|---|---|
| JSX → calls | `React.createElement(tag, props, ...)` | `h(tag, props, [...children])` |
| Component | `function Foo(props) { return <div/> }` | `fn Foo(props) { return <div/> }` |
| Function-only — no classes | ✅ | ✅ |
| Hooks: state, ref, memo, effect, layoutEffect | ✅ | ✅ (same names, same signatures) |
| Functional setState | `setX(prev => next)` | `setX(prev => next)` |
| `useEffect` cleanup return | ✅ | ✅ |
| `useMemo` deps shallow-compare | ✅ | ✅ |
| `<Fragment>` and `<></>` | ✅ | `<Fragment>` (no `<></>` short syntax) |
| Refs: `useRef`, `ref={ref}` | ✅ | ✅ |
| Reconciliation on state change | ✅ | ✅ |

If your React component only uses the above, **paste it into a `.tish` file, change `function` to `fn` and `className` to `class`, and it runs**.

## What's different

### Attribute names

JSX in Lattish uses **HTML attribute names** (lowercase):

```tish
<input class="big" onclick={...} oninput={...} onmouseup={...} />
```

vs React's camelCase:

```jsx
<input className="big" onClick={...} onInput={...} onMouseUp={...} />
```

Why: Lattish's JSX lowers directly to `setAttribute` / DOM event names, no synthetic event normalization. The names match what the browser uses natively.

### Array destructuring on hooks: works, but be aware

```tish
let [n, setN] = useState(0)              // works on JS / native Rust targets
let nState = useState(0); let n = nState[0]; let setN = nState[1]   // works on every backend
```

The two-line form is what the curriculum uses because it works on **all** Tish backends (including Cranelift / LLVM, where destructuring isn't fully wired yet). For browser-only code, the destructuring form is fine.

### One global hook cursor (not per-fiber)

Lattish maintains a **single global `hookCursor`** that all hooks share. React maintains a per-fiber linked list. Practical consequence:

- The "rules of hooks" still apply (fixed order, no conditional calls).
- Hook calls in **child components** advance the same cursor as the parent.
- That's invisible 99% of the time — but it means **hook order across the whole tree must be consistent between renders**, not just within a single component.

This affects you only if you're doing something exotic. Standard usage is fine.

### Components are called by `h`, eagerly

In React, `<MyComp />` is a vnode that React renders later during reconciliation. In Lattish, `h(MyComp, props, children)` calls `MyComp(props)` **synchronously** and returns its vnode tree. The end result is similar (the tree gets reconciled), but the call order is more "JS-ish": components evaluate top-to-bottom as JSX is constructed.

### No React-style `key` prop yet

Reconciliation uses position in the children list. For dynamic lists where items get reordered, that means the DOM may not preserve identity the way React does. For most apps this isn't visible. For complex animated lists, you may need to give each item a stable wrapper.

### `state` returns of `Symbol`, `BigInt`, `Map`, `Set`

These don't exist in Tish. Use plain numbers / strings / objects. If you need a `Map`-like, use `{}` and `"key" in obj`. If you need a `Set`-like, use `{ key: true }` lookups. Same data structures, slightly different idioms.

### Children API

`props.children` is **always an array** in Lattish, never a single child. The flatten happens during JSX lowering.

```tish
fn Wrap(props) {
  return <div>{props.children}</div>   // children is always an array
}
```

### What's missing (vs React)

- No `useReducer` — use `useState` + a switch.
- No `useContext` — pass props or use a module-level state object.
- No `useId` — generate ids from a `useRef` counter or `Date.now()`.
- No `useTransition` / `useDeferredValue` / Concurrent Mode.
- No Suspense / `<Suspense>` boundaries.
- No `forwardRef` (refs forward via `apiRef` props as a convention).
- No `memo()` / `PureComponent` (no automatic component skipping; use `useMemo` for subtree caching).
- No portals (yet) — a `<dialog>` or `position: fixed` covers most cases.
- No StrictMode / dev-only double-render.

If the missing piece blocks you, you can usually get there with a useState + a small helper function. The full list of "missing but not impossible" things is in the [Lattish docs](https://lattish.com/docs/api/hooks).

## A real-world translation

Same component, two implementations.

### React

```jsx
function TodoList({ items, onToggle }) {
  const [filter, setFilter] = useState("all")
  const visible = useMemo(
    () => filter === "done" ? items.filter(t => t.done) : items,
    [items, filter]
  )
  return (
    <div className="card">
      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="done">Done</option>
      </select>
      <ul>
        {visible.map(t => (
          <li key={t.id}>
            <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} />
            {t.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Lattish

```tish
fn TodoList(props) {
  let items = props.items
  let onToggle = props.onToggle
  let filterState = useState("all")
  let filter = filterState[0]
  let setFilter = filterState[1]

  let visible = useMemo(() => {
    return filter === "done" ? items.filter((t) => t.done) : items
  }, [items, filter])

  let rows = visible.map((t) => {
    let cap = t.id
    return <li>
      <input type="checkbox" checked={t.done} onchange={() => onToggle(cap)} />
      {t.text}
    </li>
  })

  return <div class="card">
    <select value={filter} onchange={(e) => setFilter(e.target.value)}>
      <option value="all">{"All"}</option>
      <option value="done">{"Done"}</option>
    </select>
    <ul>{rows}</ul>
  </div>
}
```

Translation rules used:

- `function` → `fn`
- `className` → `class`
- `onChange` → `onchange`
- `const [x, setX] = useState(...)` → `let xState = useState(...); let x = xState[0]; let setX = xState[1]`
- Closure capture in `.map`: pull `t.id` into a local (`let cap = t.id`) before passing to `onclick` for safety across all backends.
- Bare strings inside `<li>` need to be JSX expressions: `{"All"}` instead of `All`.

## When to keep using React

If you're shipping a complex SPA with Suspense, server components, or anything that depends on Concurrent Mode — keep React. Lattish doesn't try to compete on those features.

Lattish wins when you want:

- A **single language** (Tish) for both your UI and the rest of the app.
- A **tiny runtime** (~30 KB) you actually understand top-to-bottom.
- **No JS toolchain** — `tish build --target js` does it all.
- A path to **native compile** (the same components run under `tish:macos`, etc.).

## Where to learn more

- The [next chapter](/modules/lattish/01-jsx-and-h) starts the lesson series proper.
- Lattish's official docs: [lattish.com/docs](https://lattish.com/docs) — short reference; this track is the long-form version.
- Source: [github.com/tishlang/lattish](https://github.com/tishlang/lattish) — about 800 lines, readable in half an hour.

:::quiz{id=mod-lattish-00-q1}
- prompt: What's the React → Lattish translation for `className`?
- options: ["className", "class", "classList"]
- answer: class
:::

:::quiz{id=mod-lattish-00-q2}
- prompt: Which React feature is NOT in Lattish today?
- options: ["useState", "useEffect", "useReducer"]
- answer: useReducer
:::
