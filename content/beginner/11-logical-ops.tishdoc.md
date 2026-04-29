---
title: Logical operators
summary: && (and), || (or), ! (not), ?? (nullish coalescing).
---

Booleans combine with three operators (plus one quirky helper).

## `&&` — and

True only if **both** sides are true.

```tish
const age = 25
const hasTicket = true
if (age >= 18 && hasTicket) {
  console.log("Welcome")
}
```

## `||` — or

True if **at least one** side is true.

```tish
const isAdmin = false
const isOwner = true
if (isAdmin || isOwner) {
  console.log("Allowed")
}
```

## `!` — not

Flips a boolean.

```tish
const empty = false
console.log(!empty)   // true
```

## `??` — nullish coalescing

Returns the right side if the left is `null`, otherwise the left.

```tish
const userInput = null
const value = userInput ?? "default"
console.log(value)    // "default"
```

:::callout{kind=tip title="Why ?? and not ||"}
`||` returns the right side for any "falsy" value (`0`, `""`, `false`, `null`). `??` only does so for `null`. Use `??` when `0` and `""` should count as valid.
:::

## Capstone: magic-8-ball

Pick a random answer from a fixed pool. Use `Math.random()` (returns 0 ≤ x < 1) and `Math.floor`.

:::exercise{id=11-log-ex expected="Yes"}
const answers = ["Yes", "No", "Ask again later"]
// pick answers[0] and print it.
// In a real magic-8-ball you'd pick a random index; here we hardcode 0
// so the test is deterministic.
:::

:::quiz{id=11-log-q1}
- prompt: When does `a && b` evaluate to true?
- options: ["When both a and b are true", "When at least one is true", "Always"]
- answer: When both a and b are true
:::

That's Part II. Up next: making the program do something **many times**.
