---
title: Map, filter, reduce
summary: Power tools for arrays.
---

These three methods replace nine out of ten loops you'd otherwise write.

## `map` — transform every element

```tish
const nums = [1, 2, 3]
const doubled = nums.map((x) => x * 2)
console.log(doubled)   // [2, 4, 6]
```

The `(x) => x * 2` is an **arrow function** — a tiny one-line function. We'll go deeper on those in chapter 22.

## `filter` — keep only matching elements

```tish
const nums = [1, 2, 3, 4, 5]
const even = nums.filter((x) => x % 2 === 0)
console.log(even)   // [2, 4]
```

## `reduce` — fold all elements into one value

```tish
const nums = [1, 2, 3, 4]
const total = nums.reduce((sum, x) => sum + x, 0)
console.log(total)   // 10
```

The `0` is the starting value. The function gets called with `(accumulatedSoFar, currentElement)`.

## See it run

:::sandbox{kind=console id=18-mfr}
const players = [
  { name: "Ada", score: 85 },
  { name: "Grace", score: 92 },
  { name: "Linus", score: 78 },
  { name: "Alan", score: 95 }
]

const names = players.map((p) => p.name)
console.log("names:", names)

const winners = players.filter((p) => p.score >= 90)
console.log("winners:", winners.map((w) => w.name))

const total = players.reduce((sum, p) => sum + p.score, 0)
console.log("total:", total)
console.log("avg:", total / players.length)
:::

## Capstone: leaderboard

Given a list of scores, print the average. The expected output is the average rounded to one decimal.

:::exercise{id=18-mfr-ex expected="87.5"}
const scores = [85, 92, 78, 95]
// 1) sum the scores using reduce — start with an accumulator of 0
// 2) divide by scores.length to get the average
// 3) console.log the average

// const total = scores.reduce(...)
// const avg = ...
// console.log(avg)
:::

:::quiz{id=18-mfr-q1}
- prompt: What does `[1, 2, 3].map((x) => x + 10)` produce?
- options: ["[11, 12, 13]", "[1, 2, 3]", "[10, 20, 30]"]
- answer: [11, 12, 13]
:::
