---
title: Reading the docs
summary: How to find and use documentation.
---

The most important skill of an experienced programmer isn't memorizing functions — it's **finding and using documentation efficiently**.

## Tish's primary references

- **[LANGUAGE.md](https://github.com/tishlang/tish/blob/main/docs/LANGUAGE.md)** — the canonical syntax + semantics spec.
- **[tishlang.com/docs](https://tishlang.com/docs)** — narrative tutorials and API reference.
- **`/builtins`** in this app's tish-deep track — searchable list of console / Math / Array / String / Object methods with examples.

## How to search

When you want to know "how do I do X?":

1. Search the docs for the closest verb (`split`, `format`, `parse`).
2. Read the **examples** before the prose. One example is worth a paragraph.
3. **Try it.** Open a `:::tryit` block (or the playground) and verify your understanding.

## Capstone: build `Array.last(n)` from scratch

Tish's `Array` has `slice` but no `last(n)`. Build it yourself using only `slice`.

:::exercise{id=29-doc-ex expected="[3,4,5]"}
// Write a function `last(arr, n)` that returns the last `n` elements of `arr`.
// Read the docs for arr.slice — `slice(start)` returns from `start` to the end.

fn last(arr, n) {
  // return ...
}

const xs = [1, 2, 3, 4, 5]
console.log(JSON.stringify(last(xs, 3)))   // expected: [3,4,5]
:::

:::callout{kind=tip title="The trick"}
`slice(start)` returns from `start` to the end. So `arr.slice(arr.length - n)` returns the last `n` elements.
:::

:::quiz{id=29-doc-q1}
- prompt: When learning a new function, what should you read first?
- options: ["The full prose description", "The examples", "The implementation source"]
- answer: The examples
:::
