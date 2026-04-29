---
title: Variables and scope
summary: Lexical scope, no TDZ, source-order semantics.
---

## Bindings

```tish
let x = 1     // mutable, block-scoped
const y = 2   // immutable, block-scoped
y = 3         // RUNTIME ERROR: cannot reassign const
```

There is no `var`. There is no hoisting in the JavaScript sense.

## Lexical scope

Each `{ ... }` (and the body of `if`/`else`/loops/`catch`/functions) introduces a new scope. An inner name **shadows** an outer one; the outer becomes visible again after the inner scope ends.

```tish
const x = 10
{
  const x = 20
  console.log(x)   // 20
}
console.log(x)     // 10
```

## No TDZ — source-order semantics

JavaScript's `let`/`const` have a **temporal dead zone**: the binding "exists" before its declaration but reading it throws. Tish doesn't model TDZ.

Think of it as: **the declaration runs where it's written**. Code before the declaration that references the name is a use-before-declare error and may be reported as such, but the wording differs from V8/Node.

```tish
console.log(x)      // error: x is not defined yet
let x = 5
```

## Closures

Functions capture by name. The capture is by **the variable**, not by its value at the time of capture. The classic loop-counter pitfall in JS doesn't apply because `let` is block-scoped:

```tish
const fns = []
for (let i = 0; i < 3; i = i + 1) {
  fns.push(() => i)
}
console.log(fns.map((f) => f()))   // [0, 1, 2]
```

Each iteration gets a fresh `i`, and each closure captures that iteration's `i`.

:::tryit{code="const fns = []\nfor (let i = 0; i < 3; i = i + 1) { fns.push(() => i) }\nconsole.log(fns.map((f) => f()))"}

:::quiz{id=05-scope-q1}
- prompt: When does a `const` binding go out of scope?
- options: ["At the end of the program", "At the end of the enclosing block", "Never"]
- answer: At the end of the enclosing block
:::
