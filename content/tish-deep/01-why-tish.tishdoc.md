---
title: Why Tish?
summary: Design intent and what's different from JavaScript.
---

Tish is a small, JS-shaped language. **Write your program once, then choose how to run it** — no rewrite, no second toolchain, no extra runtime to install.

There are three ways the same `.tish` file can execute:

1. **Run it directly** with `tish run`. The interpreter walks your code as-is, so there's no build step. Best for scripts, the REPL, and the dev loop.
2. **Run it on a tiny embedded VM.** The source is compiled to compact bytecode and executed by `tishlang_vm` — small enough to fit inside a WebAssembly module. That's how the Run buttons on this site work.
3. **Compile it to a final artifact** — a native binary, a JavaScript bundle, or a WASM/WASI module — and ship that on its own.

These are *alternatives*, not layers stacked on top of each other: you pick one per program. The source file doesn't change. [Chapter 26](/tish-deep/26-build-targets) goes through every artifact in detail.

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
    <p>{"One source file. Three ways to run it."}</p>
  </div>
}

createRoot(document.body).render(App)
:::

:::callout{kind=tip title="If you came from TypeScript"}
You can write `let x: number = 1` and `fn f(a: T): R`. The annotations are **parsed but not enforced** today (Phase 2 roadmap). Use them for documentation; don't rely on them for runtime correctness.
:::

:::quiz{id=01-why-q1}
- prompt: How many different ways can the same Tish source file be executed?
- options: [1, 3, "depends on the build flag"]
- answer: 3
:::
