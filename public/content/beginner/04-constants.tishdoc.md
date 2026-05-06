---
title: Constants — values that don't change
summary: const for values that should never be reassigned.
---

`let` lets you reassign. `const` doesn't.

```tish
const PI = 3.14159
PI = 4   // ERROR: cannot reassign const
```

Use `const` for **anything that shouldn't change** while the program runs. The Tish convention is: prefer `const` by default, switch to `let` only when you actually need to reassign.

## When `const` saves you

Imagine a typo:

```tish
let userName = "Ada"
// 50 lines later...
userNme = "Grace"   // accidentally created a NEW variable
console.log(userName)
```

The original `userName` is still `"Ada"` — but the program seemed to work. With `const`, the same typo would throw an error and you'd find the bug instantly.

:::callout{kind=tip title="The two-rule rule"}
1. Default to **const**.
2. Switch to **let** only if you actually reassign.

That's it. You'll write fewer bugs.
:::

## Capstone: temperature converter

Build a converter from Celsius to Fahrenheit. The formula: `f = c * 9 / 5 + 32`.

:::pick{id=04-const-1 mode=blanks expected="68"}
___ celsius = 20
const fahrenheit = celsius * 9 / 5 + 32
console.log(fahrenheit)
---
- { at: 0, options: [const, let, var], answer: const }
:::

:::callout{kind=note title="20°C is 68°F"}
Cool spring afternoon. Once you've got it, change `20` to `0` (freezing) or `100` (boiling) and run it again — the math should still work.
:::

:::tryit{code="const c = 0\nconst f = c * 9 / 5 + 32\nconsole.log(f)"}

:::quiz{id=04-const-q1}
- prompt: When should you use `const` instead of `let`?
- options: ["Whenever you don't plan to reassign the value", "Only for numbers", "Only for strings"]
- answer: Whenever you don't plan to reassign the value
:::

Part I done. Up next: numbers, math, and your first calculator.
