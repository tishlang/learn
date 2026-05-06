---
title: "Lattish — useEffect, useLayoutEffect, useMemo"
summary: Side effects, layout reads, and skipping work.
---

Three more hooks. Each solves a specific problem. **All three match React's signatures and semantics one-to-one** — if you've used React's `useEffect`, `useLayoutEffect`, and `useMemo`, the rest of this chapter is review.

## `useEffect(cb, deps)` — async after render

Run a side effect (fetch, subscribe, log, persist) **after** the DOM has been committed:

```tish
import { useEffect } from "lattish"

fn Posts() {
  // ... posts state above ...
  useEffect(() => {
    fn run() {
      fetch("/api/posts").then((r) => r.json()).then((data) => setPosts(data))
    }
    run()
  }, [])  // empty deps = once on mount
}
```

The callback can return a **cleanup** function. Lattish runs it before re-running the effect (when deps change) and on unmount:

```tish
useEffect(() => {
  fn onResize() { setWidth(window.innerWidth) }
  window.addEventListener("resize", onResize)
  return () => window.removeEventListener("resize", onResize)
}, [])
```

## `useLayoutEffect(cb, deps)` — synchronous after layout

Same shape, but runs **synchronously** after the DOM is updated, before the browser paints. Use it when you need to **read layout** (sizes, scroll positions) and possibly mutate the DOM before the user sees the frame:

```tish
useLayoutEffect(() => {
  const r = boxRef.current.getBoundingClientRect()
  setMeasured(r.height)
}, [])
```

Rule of thumb: prefer `useEffect`; reach for `useLayoutEffect` only when async would cause a visible flash.

## `useMemo(factory, deps?)` — cache derived values

Avoid recomputing expensive derived values when inputs haven't changed:

```tish
import { useMemo } from "lattish"

fn Charts(props) {
  // Imagine processData is slow.
  const summary = useMemo(() => processData(props.rows), [props.rows])
  return <Chart data={summary} />
}
```

Two rules:

1. `deps` is compared with **shallow structural equality** on number / string / bool / null + nested arrays of those. Functions are not compared by identity.
2. Omit `deps` (or pass `[]`) to memoize forever — useful for "stable identity" wrappers.

:::callout{kind=tip title="vs React: dep comparison"}
React compares deps with `Object.is` (reference identity for objects, strict equality for primitives). Lattish goes one level deeper: arrays of primitives are compared element-by-element. **Functions are not compared by identity** in either Lattish or React, but Lattish's design makes this more visible — if you pass a freshly-created callback as a dep, the memo will recompute every render. Wrap stable callbacks in `useMemo` (Lattish has no `useCallback`; `useMemo(() => fn, deps)` is the equivalent).
:::

## Dependency arrays in detail

Lattish compares this render's `deps` to last render's. If any element differs, the effect re-runs (or memo recomputes).

| `deps` value | When it re-runs |
|---|---|
| `[a, b]` (numbers/strings) | When `a !== prev.a` or `b !== prev.b` |
| `[]` | Once (on mount); never again |
| omitted | Every render |

**Common mistake**: forgetting a dep causes a stale closure. The effect captured the old `props.foo` and ignores the new one.

```tish
// BAD: pretending count is stable
useEffect(() => {
  setTimeout(() => console.log(count), 1000)
}, [])  // missing `count`

// GOOD
useEffect(() => {
  setTimeout(() => console.log(count), 1000)
}, [count])
```

## A real example: live clock

`useEffect` with an interval, cleanup on unmount.

:::sandbox{kind=ide id=mod-lattish-03}
import { createRoot, useState, useEffect } from "lattish"

fn Clock() {
  const nowState = useState(Date.now())
  const now = nowState[0]
  const setNow = nowState[1]

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const date = new Date(now)
  const pad = (n) => n < 10 ? "0" + n : String(n)
  const time = pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds())

  return <div class="card big">{time}</div>
}

createRoot(document.body).render(Clock)
:::

The cleanup function (`return () => clearInterval(id)`) runs when the component unmounts — without it, the interval would keep firing forever.

:::callout{kind=tip title="setState inside useEffect"}
Calling setState inside an effect is normal. Calling setState **on every render**, however, causes an infinite loop. The fix is almost always a missing or wrong `deps` array. If your app freezes on mount, check the effect deps first.
:::

:::callout{kind=warn title="No StrictMode double-render"}
React 18+ in StrictMode mounts every component **twice in dev** to catch effects that aren't safely re-runnable. Lattish doesn't do this. The discipline of "every effect must be idempotent and have a clean cleanup" still applies — your code just won't catch the bug at dev time. Test cleanup paths manually.
:::

:::quiz{id=mod-lattish-03-q1}
- prompt: What does `useEffect(cb, [])` do?
- options: ["Runs cb on every render", "Runs cb once on mount; cleanup on unmount", "Never runs"]
- answer: Runs cb once on mount; cleanup on unmount
:::

Next: HTML, CSS, and how they fit Lattish.
