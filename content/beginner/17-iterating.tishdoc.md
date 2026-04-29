---
title: Iterating with for...of
summary: The cleanest way to look at every item.
---

We've used `for ... of` already; here's the canonical form alongside the patterns it makes natural.

## Basic shape

```tish
const xs = [10, 20, 30]
for (const x of xs) {
  console.log(x)
}
```

## With an index

If you need the position too, use a normal `for`:

```tish
const xs = [10, 20, 30]
for (let i = 0; i < xs.length; i = i + 1) {
  console.log(i, xs[i])
}
```

## Iterating a string

A string is iterable — `for ... of` walks its characters:

```tish
let count = 0
for (const c of "hello") {
  if (c === "l") { count = count + 1 }
}
console.log(count)   // 2
```

## Capstone: word-frequency counter

Given a sentence, count how many times the word "the" appears (case-insensitive).

:::exercise{id=17-iter-ex expected="3"}
const text = "The cat sat on the mat. THE end."
let count = 0
const words = text.toLowerCase().split(" ")
// loop over words and count those that equal "the"
// hint: punctuation matters — split on " " then strip trailing "." with .replace
console.log(count)
:::

:::callout{kind=tip title="Hint for trailing punctuation"}
`word.split(".").join("")` removes every `.` from the word.
:::

:::quiz{id=17-iter-q1}
- prompt: Which loop is best when you only need each item, not its index?
- options: ["for...of", "C-style for", "while"]
- answer: for...of
:::
