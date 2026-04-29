---
title: Numbers and math
summary: Arithmetic operators in Tish.
---

Tish has two kinds of numbers: **integers** like `42` and **floats** like `3.14`. They mix freely — `1 + 0.5` is `1.5`.

The operators you'd expect:

| Op | Meaning |
|---|---|
| `+` | add |
| `-` | subtract |
| `*` | multiply |
| `/` | divide |
| `%` | remainder (`7 % 3` is `1`) |
| `**` | exponent (`2 ** 10` is `1024`) |

:::tryit{code="console.log(2 + 3)\nconsole.log(10 - 4)\nconsole.log(6 * 7)\nconsole.log(20 / 4)\nconsole.log(7 % 3)\nconsole.log(2 ** 10)"}

## Operator precedence

`*` and `/` happen before `+` and `-`, just like math class. Use `( ... )` to force a different order.

:::tryit{code="console.log(2 + 3 * 4)        // 14, not 20\nconsole.log((2 + 3) * 4)      // 20"}

## Capstone: tip calculator

Given a bill and a tip percentage, print the total. The expected answer for `$50` with 18% tip is `59`.

:::exercise{id=05-num-ex expected="59"}
const bill = 50
const tipPercent = 18
// compute the total bill including tip and console.log it as a number
:::

:::callout{kind=tip title="Hint"}
Total = bill + (bill * tipPercent / 100). Or equivalently, bill * (1 + tipPercent/100).
:::

:::quiz{id=05-num-q1}
- prompt: What is `2 + 3 * 4` in Tish?
- options: ["20", "14", "9"]
- answer: 14
:::
