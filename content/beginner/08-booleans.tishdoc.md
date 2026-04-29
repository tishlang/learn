---
title: Booleans and comparisons
summary: true, false, ===, !==, <, >.
---

A **boolean** is one of two values: `true` or `false`. They come from comparing things.

## Strict equality

Tish uses `===` (and `!==`) for equality. **There is no `==` in Tish.**

```tish
console.log(5 === 5)        // true
console.log(5 === "5")      // false (different types — never equal)
console.log("a" !== "b")    // true
```

:::callout{kind=tip title="No type coercion"}
`5 === "5"` is `false` because a number and a string are different things. This rule prevents a whole class of confusing bugs that JavaScript's `==` invites.
:::

## Comparisons

```tish
console.log(3 < 5)        // true
console.log(10 <= 10)     // true
console.log(7 > 100)      // false
console.log(2 >= 1)       // true
```

## Capstone: simple password validator

A password is "strong" if it's at least 8 characters long. Build a check:

:::exercise{id=08-bool-ex expected="true"}
const password = "supersecret"
// print true if password.length is at least 8, false otherwise
:::

:::tryit{code="const pw = \"abc\"\nconsole.log(pw.length >= 8)"}

:::quiz{id=08-bool-q1}
- prompt: What does `5 === "5"` evaluate to in Tish?
- options: ["true", "false", "error"]
- answer: false
:::

:::quiz{id=08-bool-q2}
- prompt: Which operator should you use for equality in Tish?
- options: ["==", "===", "="]
- answer: ===
:::
