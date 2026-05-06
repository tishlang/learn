---
title: Modules
summary: import / export across files; native and npm specifiers.
---

Three kinds of import specifiers:

```tish
// 1) Built-in feature modules
import { fetch, serve } from "http"
import { readFile } from "fs"

// 2) Native tish: modules (Rust native backend only)
import { Polars } from "tish:polars"

// 3) Relative or bare-package paths
import { greet } from "./greet.tish"
import { useState, createRoot } from "lattish"
```

## Resolution

For relative paths (`./foo`, `../bar/baz.tish`), the loader walks the filesystem from the importing file. **Always include the `.tish` extension** for clarity (the resolver supports it without, but tooling is happier with the suffix).

For bare specifiers (`lattish`, `tish-tailwind`), the loader walks `node_modules/` from the importing file's directory upward. The package's `package.json` may include a `tish.module` field pointing at the entry point:

```json
{
  "name": "lattish",
  "tish": { "module": "./src/Lattish.tish" }
}
```

## What does NOT work

- `@tishlang/<name>` is **reserved** for native (Rust) modules. The compiler refuses to resolve those for `--target js`. If you publish a Tish-source npm package, use an unscoped name or a different scope.
- **Dynamic** `import()` and **`import.meta`** are out of scope (no plans).
- npm package graphs that **transitively** require Node-only modules (`fs`, `path`, `crypto`) won't run. Tish-source packages only.

## Re-exports

`export { x } from "y"` is **not** supported today. Re-export the explicit way:

```tish
import { foo as _foo } from "./helpers.tish"
export const foo = _foo
```

That pattern is used throughout `tish-ide-panels` / `tish-tailwind` / `tish-browser-server`.

## Multi-file in the playground / lesson IDE

The in-browser compiler resolves a flat **file map** that the host page passes in (see `tish-ide-panels/src/runtime/compileAndRun.tish`). Lesson capstone sandboxes use this — `import { foo } from "./other.tish"` works inside the iframe, no node_modules needed.

:::quiz{id=19-mod-q1}
- prompt: Why does `import { x } from "@tishlang/foo"` fail to compile to JS?
- options: ["@tishlang is reserved for native Rust modules", "TypeScript scope conflict", "It's a bug"]
- answer: "@tishlang is reserved for native Rust modules"
:::
