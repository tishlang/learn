---
title: Tish vs JavaScript
summary: Definitive list of differences from JS.
---

Source of truth: [`LANGUAGE.md`](https://github.com/tishlang/tish/blob/main/docs/LANGUAGE.md) ("Omitted vs typical JS" section).

## Removed

- **`undefined`** — Tish has only `null`.
- **`==` / `!=`** — strict `===`/`!==` only.
- **`var`** — `let`/`const` only; block-scoped, no hoisting.
- **`this`** — pass values explicitly.
- **`class` / `super`** — plain objects + closures instead.
- **prototypes** / `instanceof`
- **`for..in`**
- **generators**, **`Symbol`**, **`BigInt`**, **`Map`**, **`Set`**
- **`delete`**

## Changed

- **`typeof null`** is `"null"` (JS gives `"object"`).
- **`?.`** yields `null` instead of `undefined`.
- **String indices** follow Unicode scalar values (Rust `char`), matching BMP JS strings. Astral characters (some emoji) differ — one Tish index, two UTF-16 code units in JS.
- **Bitwise** ops use 32-bit integer semantics.

## Added

| Feature | Notes |
|---|---|
| `fn` keyword | Shorthand for `function`. |
| Indentation blocks | Same rules as braces; pick one per project. |
| Optional `: T` annotations | Parsed, not enforced (Phase 2). |
| `serve(port, handler)` | Built-in HTTP server, no Express. |
| `fetch` / `fetchAll` | Promise-returning. **Body is a `ReadableStream`** — single-consumer rule applies. |
| Feature flags | `http`, `fs`, `process`, `regex`. **Secure by default.** |
| `cargo:` imports | Pull Rust crates by package name (Rust native compile only). |
| Tree-walking + VM + native + WASM/WASI + JS targets | Same source, multiple back-ends. |

## Practical: try the deltas

:::tryit{code="console.log(typeof null)\nconsole.log(null === null)\nconsole.log(null === undefined)"}

The third line is interesting: it's `false` because `undefined` (in code) just resolves to the language's notion of absence, but `null === <anything-else>` is `false` strictly.

:::callout{kind=warn title="Don't write `=== undefined`"}
It compiles, but it's misleading: in Tish there is no `undefined` value. Write `=== null` or use `"key" in obj` to test for missing object properties.
:::

:::quiz{id=03-vs-q1}
- prompt: What's the right way to test if `obj.foo` exists in Tish?
- options: ["obj.foo === undefined", "\"foo\" in obj", "typeof obj.foo === 'undefined'"]
- answer: "foo" in obj
:::
