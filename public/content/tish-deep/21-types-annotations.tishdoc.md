---
title: Optional type annotations
summary: Parsed today, checked tomorrow.
---

Tish accepts TypeScript-shaped annotations. They're parsed and used by the formatter, the LSP, and resolution walks — but they **don't yet drive a checker**.

```tish
let n: number = 1
const name: string = "Ada"

fn add(a: number, b: number): number {
  return a + b
}

let xs: number[] = [1, 2, 3]
let either: number | string = "hi"
let opt: number | null = null

fn fmt(parts: string[]): string {
  return parts.join(" - ")
}

// Function types: parsed for future checker work
let cmp: (a: number, b: number) => number = (a, b) => a - b
```

## Treat them as documentation today

Use annotations to **encode intent**. The LSP shows them on hover; reviewers read them like JSDoc-but-cleaner. Don't rely on them for runtime correctness — `fn add(a: number, b: number)` will happily accept strings.

## Tooling that does use them

- `tish-fmt` keeps annotations stable.
- `tish-lsp` does name lookup and "go to definition" on type references when supported.

## What's missing (Phase 2)

Real type checking — a unifier in `tish build`, LSP diagnostics for mismatches, navigation on `: Foo`. Generics, declaration merging, and full TypeScript compatibility are explicitly **out of scope** until spelled out in `LANGUAGE.md`.

:::quiz{id=21-types-q1}
- prompt: What runs when you call `add("hi", "there")` even though the signature says `(number, number)`?
- options: ["Throws a type error", "Concatenates the strings (no enforcement yet)", "Refuses to compile"]
- answer: Concatenates the strings (no enforcement yet)
:::
