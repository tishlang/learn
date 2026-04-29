---
title: For loops
summary: C-style `for` and `for (let x of arr)`.
---

`for` is `while` with the counter setup baked in.

## C-style

```tish
for (let i = 0; i < 5; i = i + 1) {
  console.log(i)
}
```

The three pieces in `( ... )`:
1. **Init** — runs once before the loop.
2. **Condition** — checked each iteration; loop ends when false.
3. **Update** — runs after each body.

## `for ... of` over arrays and strings

```tish
const fruits = ["apple", "banana", "cherry"]
for (const f of fruits) {
  console.log(f)
}
```

This is the cleanest way to look at every item in a collection. It also works on strings:

```tish
for (const c of "Tish") {
  console.log(c)
}
// T
// i
// s
// h
```

## Capstone: multiplication table

Print the 5-times table from 1 to 5: `5`, `10`, `15`, `20`, `25` — each on its own line.

:::exercise{id=13-for-ex expected="5\\n10\\n15\\n20\\n25"}
// loop i from 1 to 5 inclusive, print i * 5 each time
:::

:::tryit{code="for (let i = 1; i <= 5; i = i + 1) {\n  console.log(i, \"*\", 5, \"=\", i * 5)\n}"}

:::quiz{id=13-for-q1}
- prompt: What does `for (const x of arr)` do?
- options: ["Iterates over each element of `arr`", "Adds an element to `arr`", "Sorts the array"]
- answer: Iterates over each element of `arr`
:::
