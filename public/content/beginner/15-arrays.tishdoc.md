---
title: Arrays
summary: Lists of values.
---

An **array** is an ordered list. You make one with square brackets:

```tish
const fruits = ["apple", "banana", "cherry"]
```

## Indexing

Items are numbered from `0`:

```tish
console.log(fruits[0])   // "apple"
console.log(fruits[2])   // "cherry"
```

`fruits[3]` would be out of range; `fruits.length` tells you the count:

```tish
console.log(fruits.length)   // 3
```

## Looping

```tish
for (const f of fruits) {
  console.log(f)
}
```

Or by index:

```tish
for (let i = 0; i < fruits.length; i = i + 1) {
  console.log(i, fruits[i])
}
```

## Capstone: shopping cart total

Sum the prices of items in a cart and print the total.

:::exercise{id=15-arr-ex expected="14.5"}
const prices = [4.50, 6.00, 4.00]
// sum them and print the total — expected: 14.5
:::

:::callout{kind=tip title="Initialize the accumulator"}
The classic pattern: `let total = 0`, then loop over the array adding each value. End by printing `total`.
:::

:::quiz{id=15-arr-q1}
- prompt: What is `["a", "b", "c"][1]`?
- options: ["a", "b", "c"]
- answer: b
:::
