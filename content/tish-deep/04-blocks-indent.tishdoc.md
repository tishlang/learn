---
title: Blocks — braces vs indentation
summary: Two equivalent block styles; pick one per project.
---

The lexer emits `Indent` / `Dedent` tokens, so the parser accepts indentation as a synonym for `{ ... }`. Pick **one style per project** for sanity.

## The rule

> 1 tab = 1 level. 2 spaces = 1 level.

Don't mix tabs and spaces in the same file. Don't use four-space indentation expecting two levels — Tish counts visual columns, not "indentation units."

## Equivalent forms

```tish
fn renderRow(item) {
  if (item.done) {
    return <li class="done">{item.text}</li>
  }
  return <li>{item.text}</li>
}
```

```tish
fn renderRow(item)
  if (item.done)
    return <li class="done">{item.text}</li>
  return <li>{item.text}</li>
```

## When indentation gets awkward

Indentation is appealing in scripts and short utilities. For:

- JSX-heavy components
- Multi-line object literals
- Anything you'd format with Prettier

…braces tend to read better. The standard library and `tish-fmt` default to braces.

:::callout{kind=tip title="tish-fmt is opinionated"}
`tish-fmt` rewrites your file in a canonical form. Run it on save in your editor and the brace-vs-indent debate disappears.
:::

:::quiz{id=04-blocks-q1}
- prompt: How many spaces equal one indentation level in Tish?
- options: [2, 4, "either"]
- answer: 2
:::
