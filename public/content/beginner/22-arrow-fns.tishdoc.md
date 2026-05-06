---
title: Arrow functions and short bodies
summary: Compact one-line functions.
---

When a function is small, the full `fn name(args) { return ... }` form feels heavy. Tish has two short forms.

## Arrow functions

```tish
const add = (a, b) => a + b
console.log(add(2, 3))   // 5
```

Arrows are anonymous — they're values you can assign to a variable, pass as arguments, etc. They're what you've already been using inside `map` / `filter` / `reduce`:

```tish
[1, 2, 3].map((x) => x * 2)
```

## Single-expression `fn` form

```tish
fn double(x) = x * 2
console.log(double(5))   // 10
```

Just `=` instead of `{ return ... }`. Useful when the body fits on one line.

## Multi-line arrow

For arrows with more than one statement, wrap in `{ }` and use `return`:

```tish
const greet = (name) => {
  const upper = name.toUpperCase()
  return "HELLO, " + upper
}
console.log(greet("ada"))   // "HELLO, ADA"
```

## Capstone: Mad Libs

Build a function that takes a `noun`, `verb`, and `place`, and prints a silly story line.

:::exercise{id=22-arrow-ex expected="The cat danced in the kitchen"}
// Write an arrow function `story` that takes (noun, verb, place) and
// returns a string formatted exactly like:
//   The <noun> <verb> in the <place>
//
// const story = (noun, verb, place) => ...

// Then call it with ("cat", "danced", "kitchen") and console.log the result.
:::

:::tryit{code="const square = (n) => n * n\nconsole.log(square(7))"}

:::quiz{id=22-arrow-q1}
- prompt: Which is the shortest valid syntax for `add(a, b) = a + b`?
- options: ["fn add(a, b) = a + b", "function add(a, b) { return a + b }", "Both work"]
- answer: Both work
:::
