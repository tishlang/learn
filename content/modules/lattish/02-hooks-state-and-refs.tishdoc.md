---
title: "Lattish — useState and useRef"
summary: Reactive state, mutable handles, and the gotcha you need to know.
---

Two hooks cover ~80% of what you'll write. **Both signatures are React's** — same names, same shapes, same intuition. If you've used React's `useState` and `useRef`, the only adjustment here is a syntactic one (the two-line read pattern).

## `useState(initial) -> [value, setValue]`

```tish
import { useState } from "lattish"

fn Counter() {
  const countState = useState(0)
  const count = countState[0]
  const setCount = countState[1]

  return <div>
    <p>{"Count: " + count}</p>
    <button onclick={() => setCount(count + 1)}>{"+1"}</button>
  </div>
}
```

Calling `setCount(n)` schedules a re-render. The next render reads the new value.

:::callout{kind=tip title="vs React: the two-line read"}
React idiom is `const [count, setCount] = useState(0)`. Lattish supports that on JS / native-Rust targets, but the curriculum uses the explicit two-line form (`let countState = useState(0); let count = countState[0]; let setCount = countState[1]`) because it works on **every** Tish backend including the bytecode VM, Cranelift, and LLVM where array destructuring isn't fully wired. Pick whichever feels right for your target.
:::

### Functional updater

When you compute the next value from the current one, prefer the **updater form**:

```tish
setCount((prev) => prev + 1)
```

Not for style — for **correctness**. Inside callbacks (timers, effects), the closed-over `count` is stale by the time the callback fires.

:::tryit{code="// Imagine this counter inside a button held down for a long press.\n// Without the updater form, multiple rapid clicks would all see the same\n// 'count' from the same render, and the count would only advance by 1.\n\nlet c = 0\nfn fakeClick() { c = c + 1 }   // outside React: works fine\nfakeClick(); fakeClick(); fakeClick()\nconsole.log(\"plain:\", c)\n\n// React/Lattish state setters need the updater form to compose."}

## `useRef(initial) -> { current }`

A ref is **mutable across renders** but does **not** trigger re-renders.

Two uses:

### 1. Hold a DOM node

```tish
import { useRef, useLayoutEffect } from "lattish"

fn AutoFocus() {
  const inputRef = useRef(null)
  useLayoutEffect(() => {
    if (inputRef.current !== null) { inputRef.current.focus() }
  }, [])
  return <input ref={inputRef} />
}
```

The `ref={inputRef}` prop sets `inputRef.current = <the DOM element>` after mount.

### 2. Hold a "non-state" value

A timer ID, a previous-value snapshot, a flag that doesn't need to drive UI:

```tish
fn DragHandler() {
  const draggingRef = useRef(false)
  const lastXRef = useRef(0)
  // ... mousedown sets draggingRef.current = true and lastXRef.current = e.clientX
  // ... mousemove reads them; no re-renders needed
}
```

If reading the value should rerender → `useState`. If it shouldn't → `useRef`.

## The hook-order rule

Hooks are matched **by call order**, not by name. So:

- ❌ Don't put hooks inside an `if` / `for` that runs different paths between renders.
- ❌ Don't `return` early before all your hooks have run.
- ✅ All hooks at the top of the function body, in a fixed order.

Lattish-specific gotcha (vs React): `useState`, `useRef`, `useMemo`, `useEffect`, and `useLayoutEffect` all share **one global hook cursor**. React keeps a per-fiber linked list, so each component's hooks are isolated. Lattish indexes hooks by cursor position **across the whole tree per render**. Practical consequence:

- Same "rules of hooks" apply: fixed call order, no conditional calls, no hooks in loops.
- A child component's hooks bump the same cursor as its parent — but since component render order is deterministic, this is invisible 99% of the time.

If you ever conditionally render `<MyComp />` based on state, the hook indices shift across renders. The standard fix is to render `<MyComp />` **always** and have `MyComp` itself decide whether to render anything based on props.

:::callout{kind=warn title="Don't conditionally call hooks"}
This breaks:

```tish
if (props.kind === "card") {
  const x = useState(0)   // BAD — sometimes called, sometimes not
}
```

Move hooks above the branch:

```tish
const x = useState(0)
if (props.kind === "card") { ... }
```
:::

## Capstone: temperature converter

Build a controlled input with `useState` for the value and live-derived Fahrenheit output:

:::sandbox{kind=ide id=mod-lattish-02}
import { createRoot, useState } from "lattish"

fn TempConverter() {
  const cState = useState(20)
  const c = cState[0]
  const setC = cState[1]

  const f = c * 9 / 5 + 32

  return <div class="card">
    <h1>{"°C → °F"}</h1>
    <label>{"Celsius: "}
      <input type="number" value={c} oninput={(e) => setC(parseFloat(e.target.value))} />
    </label>
    <p class="big">{c + " °C = " + f + " °F"}</p>
  </div>
}

createRoot(document.body).render(TempConverter)
:::

:::quiz{id=mod-lattish-02-q1}
- prompt: When inside a setTimeout callback, which form of setState is correct?
- options: ["setCount(count + 1)", "setCount((prev) => prev + 1)", "Both — they're equivalent"]
- answer: setCount((prev) => prev + 1)
:::

Next: side effects and memoization.
