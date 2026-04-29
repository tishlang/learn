---
title: Functions
summary: Reusable named recipes.
---

A **function** is a named recipe. You write it once and use it anywhere.

```tish
fn greet(name) {
  return "Hello, " + name
}

console.log(greet("Ada"))    // "Hello, Ada"
console.log(greet("Grace"))  // "Hello, Grace"
```

Three pieces:
1. **Name** — `greet`
2. **Parameters** — the inputs in `( ... )` (here, `name`)
3. **Body** — what the function does, in `{ ... }`. `return` sends a value back.

## Multiple parameters

```tish
fn add(a, b) {
  return a + b
}
console.log(add(2, 3))   // 5
```

## Capstone: mini-bank

Build three functions that operate on a single shared balance.

:::exercise{id=21-fn-ex expected="100\\n70\\n170"}
let balance = 0

// Write three functions: deposit(amount), withdraw(amount), check().
// Each of deposit/withdraw should update `balance` and return the new value.
// check() should return the current balance.

// fn deposit(amount) { ... }
// fn withdraw(amount) { ... }
// fn check() { ... }

// Then call them so the output is exactly:
//   100
//   70
//   170
// console.log(deposit(100))
// console.log(withdraw(30))
// console.log(deposit(100))
:::

:::callout{kind=tip title="The return value matters"}
`return` is what a function gives back. Without it, the function returns `null`. A function with no `return` is fine when it just performs an action (like printing).
:::

:::quiz{id=21-fn-q1}
- prompt: What does `return` do?
- options: ["Sends a value back to the caller", "Restarts the function", "Prints to the console"]
- answer: Sends a value back to the caller
:::
