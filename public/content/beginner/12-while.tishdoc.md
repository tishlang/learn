---
title: While loops
summary: Repeat until a condition is false.
---

A `while` loop runs its body again and again, **as long as** the condition is true.

```tish
let i = 1
while (i <= 3) {
  console.log(i)
  i = i + 1
}
// 1
// 2
// 3
```

Three things to notice:

1. The condition `i <= 3` is checked **before** each repetition.
2. We change `i` inside the loop. **Without that, the loop never ends.**
3. The body runs zero or more times — if the condition is `false` from the start, it never runs.

## Infinite loops

If you forget to change the variable, the loop runs forever (the page will hang). Don't worry — close the tab and try again.

```tish
// DO NOT RUN
let x = 0
while (x < 10) {
  console.log(x)
  // forgot: x = x + 1
}
```

## Capstone: number-guessing game

In a real number-guessing game we'd use `Math.random()`, but for testing we'll hard-code the secret. Print every guess until we hit the right one.

:::exercise{id=12-while-ex expected="1\\n2\\n3\\n4\\n5\\nfound!"}
const secret = 5
let guess = 1
// loop while guess < secret: print guess, increment by 1.
// when guess === secret, print "found!"
:::

:::callout{kind=tip title="Read your output line by line"}
The expected output uses `\n` between numbers — that's just `console.log` running multiple times.
:::

:::quiz{id=12-while-q1}
- prompt: What's the most common while-loop bug?
- options: ["Forgetting to increment the loop variable", "Using ===", "Spelling 'while' wrong"]
- answer: Forgetting to increment the loop variable
:::
