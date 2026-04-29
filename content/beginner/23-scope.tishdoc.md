---
title: Scope and shadowing
summary: Where a variable is visible.
---

Each `{ ... }` block in Tish creates a new **scope**. A variable declared inside a block is only visible inside that block.

```tish
let x = 10
if (true) {
  let x = 20
  console.log(x)   // 20  (the inner x)
}
console.log(x)     // 10  (the outer x)
```

The inner `let x = 20` doesn't change the outer `x`; it creates a new one. This is called **shadowing**.

## Why no `var`

Tish doesn't have `var`. In JavaScript, `var` ignores blocks and leaks to the surrounding function — a notorious bug source. Tish only has `let` and `const`, both of which respect blocks.

## Function parameters are scoped to the function

```tish
fn greet(name) {
  console.log(name)
}
greet("Ada")
// console.log(name)   // ERROR: name is not defined here
```

## Capstone: refactor the mess

The function below repeats logic for two different prefixes. Use a helper to deduplicate. Both versions should produce the same output.

:::exercise{id=23-scope-ex expected="Hello, Ada\\nHello, Grace\\nHi, Ada\\nHi, Grace"}
const names = ["Ada", "Grace"]
// write a helper fn that takes (prefix, names) and prints "<prefix>, <name>" for each
// then call it twice — once with "Hello", once with "Hi"
:::

:::quiz{id=23-scope-q1}
- prompt: When does a `let` variable go out of scope?
- options: ["At the end of the program", "At the end of the enclosing block", "Never"]
- answer: At the end of the enclosing block
:::
