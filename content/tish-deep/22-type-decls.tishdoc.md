---
title: type and declare
summary: Naming types, declaring ambient builtins.
---

Two type-only forms exist, both erased at runtime.

## `type` aliases

```tish
type UserId = number
type Status = "open" | "closed" | "pending"

type Post = {
  id: number,
  title: string,
  authorId: UserId
}
```

The compiler doesn't enforce these yet (see chapter 21), but the LSP and `tish-fmt` understand them.

## `declare` for ambient values

`declare let`, `declare const`, and `declare function` (no body) describe values the runtime provides without you writing a definition:

```tish
declare const fetch: (url: string) => Promise<Response>
declare let location: { hash: string, search: string, origin: string }

declare function alert(msg: string): void
```

## stdlib/builtins.d.tish

The Tish repo ships [`stdlib/builtins.d.tish`](https://github.com/tishlang/tish/blob/main/stdlib/builtins.d.tish) as the canonical surface for `console`, `Math`, timers, etc. Lines like:

```tish
// @tish-source console.log crates/tishlang_runtime/src/console.rs 152
```

tie symbols to Rust source positions. `tish-lsp` reads these and powers **Go to definition** when `TISHLANG_SOURCE_ROOT` (or LSP `tishlangSourceRoot`) points at the `tish` checkout.

## Native module pragmas

A package may ship `lsp-pragmas.d.tish` next to `package.json`. Each line:

```
// @tish-source modName.method src/path.rs 42 | one-line hover blurb
```

makes the LSP jump to the right spot for native-module dotted symbols, even when there's no matching `pub fn`.

## What `type` doesn't do (yet)

- No structural enforcement on assignment.
- No interface merging.
- No generics. (The grammar parses bare `T<...>` placeholders for future work.)

:::quiz{id=22-decl-q1}
- prompt: What is a `declare const` for?
- options: ["Defining a constant value", "Telling the compiler about a value the runtime provides", "Running once at load time"]
- answer: "Telling the compiler about a value the runtime provides"
:::
