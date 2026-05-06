---
title: Break and continue
summary: Early-exit and skip.
---

Two keywords adjust loop flow.

## `break` — exit the loop

```tish
for (let i = 1; i <= 10; i = i + 1) {
  if (i === 5) { break }
  console.log(i)
}
// 1, 2, 3, 4
```

Useful when you found what you were looking for and want to stop early.

## `continue` — skip this iteration

```tish
for (let i = 1; i <= 5; i = i + 1) {
  if (i === 3) { continue }
  console.log(i)
}
// 1, 2, 4, 5  (3 was skipped)
```

## Capstone: FizzBuzz

The classic interview question. For numbers 1 through 15:

- If divisible by 3 **and** 5: print `"FizzBuzz"`.
- Else if divisible by 3: print `"Fizz"`.
- Else if divisible by 5: print `"Buzz"`.
- Else: print the number.

:::exercise{id=14-fb-ex expected="1\\n2\\nFizz\\n4\\nBuzz\\nFizz\\n7\\n8\\nFizz\\nBuzz\\n11\\nFizz\\n13\\n14\\nFizzBuzz"}
for (let i = 1; i <= 15; i = i + 1) {
  // your code here
}
:::

:::callout{kind=tip title="Order matters"}
Check divisible-by-15 (or 3-and-5 together) **before** the individual cases. Otherwise the FizzBuzz case is unreachable.
:::

:::quiz{id=14-loop-q1}
- prompt: `break` does what?
- options: ["Skips to the next iteration", "Exits the loop entirely", "Restarts the loop"]
- answer: Exits the loop entirely
:::
