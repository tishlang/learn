---
title: "tish-tailwind — emit and build"
summary: How the scanner picks classes; integrating into your build.
---

`tish-tailwind` ships an emitter you call from your build script. It scans source files, finds which utility classes are used, and writes one CSS file containing only those.

## The build script

```tish
// build-css.tish
import { emitStylesheet } from "tish-tailwind"

await emitStylesheet({
  sourceFiles: [
    "app/main.tish",
    "app/Header.tish",
    "app/Sidebar.tish",
    "content/page.tishdoc.md"
  ],
  outputPath: "public/utilities.css"
})
```

Run with `tish run --feature fs build-css.tish`. Output:

```
tish-tailwind: emitted public/utilities.css (28/310 utilities used)
```

The emitter scanned each source file for substring matches against the utility table and output only the matching rules.

## Walking a directory tree

For real projects you don't want to maintain a hand-listed `sourceFiles` array. `tish-learn`'s build script walks `app/**/*.tish` and `content/**/*.tishdoc.md`:

```tish
import { readDir } from "fs"

async fn collectFiles(root, suffix, out) {
  let entries = []
  try { entries = await readDir(root) } catch (e) { return }
  let i = 0
  while (i < entries.length) {
    let name = entries[i]
    let p = root + "/" + name
    // Heuristic: name with a dot is a file; else recurse.
    if (name.indexOf(".") >= 0) {
      if (p.endsWith(suffix)) { out.push(p) }
    } else {
      await collectFiles(p, suffix, out)
    }
    i = i + 1
  }
}

let sources = []
await collectFiles("app", ".tish", sources)
await collectFiles("content", ".tishdoc.md", sources)
```

## Always-include classes

Some classes are computed dynamically (e.g. you build a class name from state) so the substring scanner can't see them. Use `alwaysInclude`:

```tish
await emitStylesheet({
  sourceFiles: sources,
  outputPath: "public/utilities.css",
  alwaysInclude: [
    "px-1", "px-2", "px-3", "px-4", "px-5"  // generated from a number
  ]
})
```

## Extending the utility table

The shipped table covers the common 80%. To add a class:

1. Open `node_modules/tish-tailwind/src/utilities.tish`.
2. Add a row: `{ cls: "text-balance", css: `.text-balance { text-wrap: balance; }` },`.
3. Rebuild.

Send a PR back upstream if it's a generally useful class.

## Custom prefixes / themes

`tish-tailwind` doesn't yet have a config file like `tailwind.config.cjs`. Two ways to extend in pure Tish:

1. **Append CSS** to the emitted file via `extraCss`:
   ```tish
   await emitStylesheet({
     sourceFiles: sources,
     outputPath: "public/utilities.css",
     extraCss: ".brand { color: #a78bfa; font-weight: 700; }"
   })
   ```
2. **Wrap `getUtilities()`** to add or override entries before passing to your own emitter.

## A complete dev pipeline

`tish-learn`'s `justfile` ties it together:

```just
build-css:
    tish run --feature fs --feature http build-css.tish

build-app:
    tish build app/main.tish -o public/dist/learn.js --target js

build: build-css build-app

dev: build
    tish run --feature fs --feature http --feature process dev-server.tish
```

Result: one `tish` toolchain rebuilds everything. **No npm tailwindcss CLI, no PostCSS, no Autoprefixer.**

:::callout{kind=tip title="When the npm CLI is the right call"}
If you need every Tailwind feature (variants, JIT arbitrary values, `@apply`, full Tailwind v3+ syntax), keep the npm CLI. `tish-tailwind` is for projects that want the ergonomics of utility CSS without an npm build step. The take-it-real swap is straightforward — utility class names are the same.
:::

:::quiz{id=mod-tw-02-q1}
- prompt: When should you use `alwaysInclude`?
- options: ["For class names assembled dynamically (where the substring scanner can't see them)", "For classes you might use someday", "Never — the scanner finds everything"]
- answer: For class names assembled dynamically (where the substring scanner can't see them)
:::
