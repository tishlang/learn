---
title: Iterating objects
summary: Object.keys, Object.values, Object.entries.
---

Three built-ins turn an object into an array, so you can iterate it like any other list.

## `Object.keys`

```tish
const user = { name: "Ada", age: 36 }
console.log(Object.keys(user))   // ["name", "age"]
```

## `Object.values`

```tish
console.log(Object.values(user))   // ["Ada", 36]
```

## `Object.entries`

```tish
console.log(Object.entries(user))
// [["name", "Ada"], ["age", 36]]
```

`Object.entries` pairs each key with its value. The classic loop:

```tish
for (const pair of Object.entries(user)) {
  console.log(pair[0], "=", pair[1])
}
```

## Capstone: inventory tracker

Given an inventory `{ apples: 12, bananas: 7, cherries: 3 }`, compute the total number of items.

:::exercise{id=20-objiter-ex expected="22"}
const inventory = { apples: 12, bananas: 7, cherries: 3 }
let total = 0
// loop over Object.values(inventory) and add each value to `total`
console.log(total)
:::

:::quiz{id=20-objiter-q1}
- prompt: What does `Object.entries({a: 1, b: 2})` return?
- options: ["[1, 2]", "[\"a\", \"b\"]", "[[\"a\", 1], [\"b\", 2]]"]
- answer: [["a", 1], ["b", 2]]
:::
