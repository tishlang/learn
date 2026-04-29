---
title: Closures
summary: Functions that remember their surroundings.
---

A **closure** is what you get when a function uses a variable that lives outside its own body. The function "closes over" that variable — it holds onto it for as long as the function exists, even after the surrounding code has finished running.

## The basic shape

```tish
fn outer() {
  const greeting = "Hello"
  return () => {
    console.log(greeting)
  }
}

const sayHi = outer()
sayHi()   // Hello
```

By the time `sayHi()` runs, `outer` has already returned. Normally that would mean `greeting` is gone — but the inner arrow function captured it, so it's kept alive for as long as `sayHi` exists.

The variables a closure captures are decided by **where the function is written**, not where it's called. This is called *lexical scope*.

## Counter factory — a closure with mutable state

```tish
fn makeCounter() {
  let n = 0
  return () => {
    n = n + 1
    return n
  }
}

const click = makeCounter()
console.log(click())   // 1
console.log(click())   // 2
console.log(click())   // 3
```

Each `click()` reaches back into the `n` that belongs to the `makeCounter` call that produced it. Two separate counters keep separate counts:

```tish
const a = makeCounter()
const b = makeCounter()
a(); a(); a()
console.log(a())   // 4
console.log(b())   // 1
```

`a` and `b` each have their own captured `n`. Closures are how you get *isolation* without using classes.

## Why closures matter — common use cases

### 1. Private state (data hiding)

The `n` inside `makeCounter` is **invisible** from the outside. Nothing can reach in and set it directly. The only way to change it is by calling the function the factory returned. That's the same idea as a "private field" in object-oriented languages — without needing `class` or `private`.

### 2. Function factories — building specialized functions

Closures let you bake configuration into a function once, then reuse it.

```tish
fn multiplyBy(n) {
  return (x) => x * n
}

const double = multiplyBy(2)
const triple = multiplyBy(3)
console.log(double(7))   // 14
console.log(triple(7))   // 21
```

`double` and `triple` are tiny, fast, specialized functions. Each one carries the `n` it was built with.

### 3. Configuration captured once

```tish
fn greeter(prefix) {
  return (name) => prefix + ", " + name
}

const hello = greeter("Hello")
const hola  = greeter("Hola")
console.log(hello("Ada"))    // Hello, Ada
console.log(hola("Grace"))   // Hola, Grace
```

You set `prefix` *once*, when you create the greeter. After that, every call benefits from it without you having to pass it again.

### 4. Memoization — remembering past results

A closure can hold a cache between calls.

```tish
fn memoize(f) {
  const cache = {}
  return (x) => {
    if (x in cache) { return cache[x] }
    const r = f(x)
    cache[x] = r
    return r
  }
}

const slowSquare = (x) => x * x
const fastSquare = memoize(slowSquare)
console.log(fastSquare(9))   // 81 (computed)
console.log(fastSquare(9))   // 81 (from cache)
```

The `cache` object lives in the closure — it survives across calls but isn't visible from anywhere else.

### 5. Bundle behavior + state into an object

You can return a whole object whose methods all close over the same private state.

```tish
fn makeStack() {
  const items = []
  return {
    push: (x) => { items.push(x) },
    pop:  () => items.pop(),
    size: () => items.length
  }
}

const s = makeStack()
s.push("a"); s.push("b"); s.push("c")
console.log(s.size())   // 3
console.log(s.pop())    // c
console.log(s.size())   // 2
```

`items` is fully encapsulated. The outside world only ever sees `push`, `pop`, and `size`.

This pattern is **the Tish way to make objects with state**. Tish has no `class` keyword — closures cover the same ground in fewer lines.

## Capstone: click-counter factory

Build a closure-based counter object yourself. It should expose two methods:

- `tick()` — increment the private counter and return the new value
- `count()` — return the current value without changing it

The trick is that both methods need to share the same hidden `n`.

:::exercise{id=24-closure-ex expected="1\\n2\\n3\\n3"}
// Write `make()` so that:
//   - it has a private `let n = 0` inside
//   - it returns { tick, count } where both are arrow functions that
//     close over that same `n`
//   - tick increments n and returns the new value
//   - count returns the current n without changing it

fn make() {
  // your code here
}

const c = make()
// Uncomment when `make` is finished:
// console.log(c.tick())    // 1
// console.log(c.tick())    // 2
// console.log(c.tick())    // 3
// console.log(c.count())   // 3
:::

:::callout{kind=tip title="No `class` needed"}
Tish has no `class` keyword. The closure-returning-object pattern above is the idiomatic way to bundle behavior with private state. If you've used JavaScript classes or Python's `__init__`, this fills the same role with about a third of the syntax.
:::

:::callout{kind=note title="Watch out for shared captures"}
If you create many functions inside a loop, they may all close over the *same* loop variable. Use `const` (block-scoped, fresh per iteration) or pull the work into a factory function — exactly the pattern you just saw with `makeCounter` — so each function gets its own snapshot.
:::

:::quiz{id=24-closure-q1}
- prompt: A function "remembers" which variables?
- options: ["The variables visible at the place it was defined", "Only its parameters", "All variables in the program"]
- answer: The variables visible at the place it was defined
:::

:::quiz{id=24-closure-q2}
- prompt: Why is `makeStack`'s `items` array considered "private"?
- options: ["Because it's `const`", "Because it lives inside the closure and nothing outside has a reference to it", "Because Tish hides arrays by default"]
- answer: Because it lives inside the closure and nothing outside has a reference to it
:::

:::quiz{id=24-closure-q3}
- prompt: After `const double = multiplyBy(2)`, what does `multiplyBy(2)` return?
- options: ["The number 2", "A new function that multiplies its argument by 2", "A copy of the multiplyBy source"]
- answer: A new function that multiplies its argument by 2
:::

That's Part IV. Up next: handling errors and saving data.
