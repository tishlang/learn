---
title: Arrays and objects
summary: Plain data, fixed shapes at parse time.
---

## Arrays

Standard methods: `push`, `pop`, `shift`, `unshift`, `slice`, `concat`, `includes`, `indexOf`, `lastIndexOf`, `map`, `filter`, `reduce`, `forEach`, `join`, `reverse`, `sort`. `Array.isArray(x)` works.

```tish
const xs = [1, 2, 3]
const sum = xs.reduce((s, x) => s + x, 0)
const even = xs.filter((x) => x % 2 === 0)
```

## Objects

Object literals have **fixed keys at parse time** — the parser captures the shape. Reads are by name (`obj.key`) or string (`obj["key"]`).

**Accessing a missing key throws.** Use `"key" in obj` to test presence, or `?.` to short-circuit to `null`:

```tish
const u = { name: "Ada" }

console.log("name" in u)      // true
console.log("age" in u)       // false
console.log(u?.age)           // null
// console.log(u.age)         // ERROR: Property 'age' not found
```

## Object iteration

```tish
const u = { name: "Ada", age: 36 }

console.log(Object.keys(u))      // ["name", "age"]
console.log(Object.values(u))    // ["Ada", 36]
console.log(Object.entries(u))   // [["name", "Ada"], ["age", 36]]
```

`Object.assign(target, source)` and `Object.fromEntries(pairs)` work.

## "Class-shaped" objects

Without `class`, the idiomatic factory:

```tish
fn makeAccount(initial) {
  let balance = initial
  return {
    deposit: (n) => { balance = balance + n; return balance },
    withdraw: (n) => { balance = balance - n; return balance },
    balance: () => balance
  }
}

const a = makeAccount(100)
a.deposit(50)
console.log(a.balance())   // 150
```

The closure captures `balance`; the returned object exposes the methods. Equivalent ergonomics, no prototype chain.

:::quiz{id=09-ao-q1}
- prompt: What happens if you read a key that doesn't exist on a Tish object?
- options: ["Returns null", "Returns undefined", "Throws an error"]
- answer: Throws an error
:::
