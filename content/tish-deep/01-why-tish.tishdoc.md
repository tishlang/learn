---
title: Why Tish?
summary: Design intent and what's different from JavaScript.
---

Tish is a small, JS-shaped language that runs three ways from one source:

1. **Tree-walking interpreter** (`tish run`) — instant feedback, no build step.
2. **Bytecode VM** — embedded in WASM (and used by this site's Run buttons).
3. **Compiled** to Rust + `tishlang_runtime`, native binaries, JS, or WASM/WASI.

**Same source, three runtimes.** That's the design north star.

## Why a new language?

If you already know JavaScript or TypeScript, you'll feel at home. The syntax is intentionally familiar (`let`, `const`, `fn`, arrows, template literals, JSX). Tish removes the parts of JS that historically caused bugs:

- No `undefined` — only `null`.
- No `==` — only strict `===` and `!==`.
- No `var`, no hoisting, no `this` keyword, no `class`/`prototype`/`super`.
- No `Symbol`/`BigInt`/`Map`/`Set` (yet).
- Optional chaining `?.` yields `null` instead of `undefined`.

What you get back: a language that's easier to reason about, **secure by default** (no fs/http/process unless you explicitly enable features), and ahead-of-time compilable to a single binary.

## Read along

The canonical spec lives at [`tish/docs/LANGUAGE.md`](https://github.com/tishlang/tish/blob/main/docs/LANGUAGE.md). Pin it in another tab — every chapter in this track points back to specific sections.

:::sandbox{kind=ide id=01-tish-tour}
import { createRoot } from "lattish"

fn App() {
  const greeting = `Hello, ${"world"}!`
  return <div class="card">
    <h1>{greeting}</h1>
    <p>{"Same source. Three runtimes."}</p>
  </div>
}

createRoot(document.body).render(App)
:::

:::callout{kind=tip title="If you came from TypeScript"}
You can write `let x: number = 1` and `fn f(a: T): R`. The annotations are **parsed but not enforced** today (Phase 2 roadmap). Use them for documentation; don't rely on them for runtime correctness.
:::

:::quiz{id=01-why-q1}
- prompt: How many runtimes share a single Tish source file?
- options: [1, 3, "depends on the build flag"]
- answer: 3
:::
