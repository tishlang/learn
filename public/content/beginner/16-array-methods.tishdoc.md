---
title: Array methods
summary: push, pop, slice, concat, includes, indexOf.
---

The most-used array operations.

## Add and remove

```tish
const items = ["a", "b"]
items.push("c")     // ["a", "b", "c"]
const last = items.pop()  // "c", items is now ["a", "b"]
```

## Slice — copy a part

```tish
const all = [1, 2, 3, 4, 5]
console.log(all.slice(1, 4))   // [2, 3, 4]
console.log(all.slice(2))      // [3, 4, 5]
```

`slice` does not modify the original.

## Concat — join two arrays

```tish
const a = [1, 2]
const b = [3, 4]
console.log(a.concat(b))   // [1, 2, 3, 4]
```

## Membership

```tish
const fruits = ["apple", "banana"]
console.log(fruits.includes("banana"))   // true
console.log(fruits.indexOf("apple"))     // 0
console.log(fruits.indexOf("nope"))      // -1
```

## Capstone: pop-quiz scorer

Given a list of student answers and the correct answer, print how many got it right.

:::exercise{id=16-arr-ex expected="3"}
const answers = ["b", "a", "b", "c", "b", "b"]
const correct = "b"
let count = 0
// loop and count occurrences of `correct`
console.log(count)
:::

:::quiz{id=16-arr-q1}
- prompt: Which method adds an item to the end of an array?
- options: ["push", "pop", "slice"]
- answer: push
:::
