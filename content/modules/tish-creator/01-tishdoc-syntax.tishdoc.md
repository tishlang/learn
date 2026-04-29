---
title: "tish-creator — TishDoc syntax"
summary: Markdown + frontmatter + directives.
---

**TishDoc** (the format implemented by the `tish-creator` package) is a Markdown dialect with directives. Every chapter you've read in `tish-learn` is a `.tishdoc.md` file parsed by this format.

## Frontmatter

YAML-style metadata at the top, separated by `---`:

```text
---
title: "My chapter"
summary: "What this chapter teaches."
date: 2026-04-15
---

# The body starts here
```

The minimal subset (key-value strings, numbers, booleans) is enough for most uses. JSON frontmatter (a leading `{...}` block) works too if you need nested structures.

## Standard Markdown

ATX headings, paragraphs, fenced code, lists, inline `code`, **bold**, [links](https://example.com).

```text
# H1
## H2

A paragraph with **bold** and `code` and [a link](https://tishlang.com).

- bullet
- another

```tish
console.log("fenced code")
```
```

That's the subset both [`tish-learn`'s parser](/Users/a_/Projects/tish/tish-learn/app/tishdoc.tish) and [`@tishlang/tishdoc-parse`](/Users/a_/Projects/tish/tish-creator/packages/tishdoc-parse) recognize.

## Block directives — `:::name{attrs}`

Where TishDoc differs from CommonMark: **directives**. A `:::name` block opens a section that's parsed as a `DirectiveBlock` AST node:

```text
:::callout{kind=tip title="Heads up"}
Inner *Markdown* is parsed normally.

You can have multiple paragraphs.
:::
```

The renderer (in our case, `app/views/LessonView.tish`) walks the AST and decides what to do with each named directive. `tish-learn` recognizes:

| Directive | Renders as |
|---|---|
| `:::callout{kind=info|tip|warn|danger|note title=...}` | Bordered aside |
| `:::pick{id=... mode=assemble|blanks expected-output=...}` | Duolingo-style chip assembler |
| `:::tryit{code=...}` | Free-typing run-and-show widget |
| `:::exercise{id=... expected="..."}` | MiniRunner with expected stdout |
| `:::quiz{id=...}` | Single-choice question |
| `:::sandbox{kind=console|ide id=... files="..."}` | Editor + terminal (+ web preview) |
| `:::project{title=... time=... difficulty=... summary=...}` | Capstone hero card |

Unknown directive names render as a debug box so authors notice the typo.

## Leaf directives — `::name{attrs}`

A single line (no body):

```text
::status{phase=draft}
::tryit{code="console.log(1 + 2)"}
```

Same parser, but produces a `DirectiveLeaf` node instead of `DirectiveBlock`.

## Custom attribute parsing

Inside `{...}`:

- `key=value` — bareword (no quotes); stops at whitespace.
- `key="value"` — quoted; allows spaces.
- `key='value'` — single-quoted.
- `key` (no `=`) — boolean true.

Examples:

```text
:::callout{kind=tip title="No undefined" emphasized}
:::
```

Renders to attrs `{ kind: "tip", title: "No undefined", emphasized: "true" }`.

## Includes (full TishDoc)

The full `tishdoc-parse` package supports `::include{path=...}` for transclusion. `tish-learn` doesn't use it directly because lessons are flat files, but the [Capstones / Static blog generator](/capstones/blog/02-tishdoc-rendering) uses includes for shared snippets.

## Authoring tips

- **Use frontmatter** for `title` and `summary`. The chapter sidebar reads these.
- **Number chapters** (`01-`, `02-`) so directory order matches study order.
- **One H1 per file** and let frontmatter own it (LessonView renders frontmatter title as H1).
- **Stay inside the supported subset.** Tables, blockquotes, ordered lists, setext headings, and HTML inline are NOT yet parsed by `tish-learn`'s minimal renderer. The full `tishdoc-parse` adds some but not all.
- **Test locally** with the dev server. Refresh on save — `useTextResource` re-fetches.

:::quiz{id=mod-creator-01-q1}
- prompt: How do you mark a callout as "tip" with a title?
- options: [":::callout tip 'Heads up'", ":::callout{kind=tip title=\"Heads up\"}", "[callout|tip|Heads up]"]
- answer: :::callout{kind=tip title="Heads up"}
:::

That's the syntax surface. The same format powers this lesson and every other capstone in tish-learn.
