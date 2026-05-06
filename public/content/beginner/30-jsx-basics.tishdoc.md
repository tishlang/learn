---
title: Your first webpage
summary: JSX, createRoot, useState, click handlers.
---

Until now, our programs printed text. **From here on we build webpages.**

Tish has built-in support for **JSX** — HTML-shaped expressions you can mix with regular code. Combined with [Lattish](https://github.com/tishlang/lattish) (Tish's small React-shaped UI runtime), that's enough to ship real apps.

## The smallest webpage

```tish
import { createRoot } from "lattish"

fn App() {
  return <h1>{"Hello, web!"}</h1>
}

createRoot(document.body).render(App)
```

Three things to notice:

- `<h1>{"Hello, web!"}</h1>` — JSX. Looks like HTML, **is** code.
- `fn App()` — a **component**. Functions that return JSX are components.
- `createRoot(document.body).render(App)` — mount it into the page.

## Adding state with `useState`

A static page is boring. **State** lets the page change in response to clicks.

```tish
import { createRoot, useState } from "lattish"

fn App() {
  const [count, setCount] = useState(0)
  return <div>
    <h1>{"Count: " + count}</h1>
    <button onclick={() => setCount(count + 1)}>{"+1"}</button>
  </div>
}

createRoot(document.body).render(App)
```

`useState(0)` returns a pair: the current value and a setter. Calling the setter triggers a re-render.

## Capstone: counter button

Build the counter above. The expected behavior: clicking the button increments the count.

:::sandbox{kind=ide id=30-jsx-counter}
import { createRoot, useState } from "lattish"

fn App() {
  const countState = useState(0)
  const count = countState[0]
  const setCount = countState[1]
  return <div class="box">
    <h1>{"Count: " + count}</h1>
    <button onclick={() => setCount(count + 1)}>{"+1"}</button>
    <button onclick={() => setCount(0)}>{"Reset"}</button>
  </div>
}

createRoot(document.body).render(App)
:::

:::callout{kind=tip title="Why countState[0] instead of [count, setCount]?"}
Tish supports array destructuring on the Rust/JS targets. The two-line `let count = countState[0]; let setCount = countState[1]` works on every backend — that's why we use it here. Once you're past the basics, the destructuring form is fine too.
:::

:::callout{kind=note title="Going deeper"}
This chapter is a tasting menu. The full **Lattish + HTML + CSS** module covers JSX semantics, every hook, the four ways to style, and HTML accessibility — head to the **Modules** track when you want the full picture.
:::

:::quiz{id=30-jsx-q1}
- prompt: What does useState return?
- options: ["The current value only", "A pair: [value, setter]", "The setter only"]
- answer: A pair: [value, setter]
:::
