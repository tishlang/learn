---
title: Functions
summary: fn / function, single-expr bodies, arrows, async, closures.
---

Tish has three function-declaration shapes:

```tish
fn add(a, b) { return a + b }            // standard
fn double(x) = x * 2                      // single-expression
const triple = (x) => x * 3               // arrow
const quad   = (x) => { return x * 4 }    // arrow with body
```

`fn` and `function` are interchangeable; `fn` is the idiomatic spelling.

## Closures

```tish
fn makeCounter() {
  let n = 0
  return () => { n = n + 1; return n }
}

const c = makeCounter()
console.log(c())   // 1
console.log(c())   // 2
```

This is the canonical "object with private state" idiom in Tish. Without `class`, closures fill the role.

## Async functions

```tish
async fn fetchUser(id) {
  const res = await fetch("/api/user/" + id)
  return await res.json()
}

const user = await fetchUser(42)
```

Top-level `await` is supported in `tish run` and module programs. For native compile, use `async fn main() { … }`.

## "No this"

Tish has no `this` keyword. Pass the receiver explicitly:

```tish
fn greetUser(user) {
  return "Hello, " + user.name
}

console.log(greetUser({ name: "Ada" }))
```

If a function needs to operate on "the calling object," accept it as a parameter. This pattern composes better and removes a whole class of `this`-loss bugs.

:::quiz{id=06-fn-q1}
- prompt: How does Tish replace `class` with private state?
- options: ["You can't — Tish has no private state", "Closures: a function returning an object that captures inner variables", "TypeScript-style #private fields"]
- answer: "Closures: a function returning an object that captures inner variables"
:::
