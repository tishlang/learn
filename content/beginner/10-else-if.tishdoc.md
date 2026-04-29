---
title: Else-if and the ternary
summary: Chained conditions and the short ? : form.
---

When you have more than two cases, use `else if`:

```tish
const score = 85
if (score >= 90) {
  console.log("A")
} else if (score >= 80) {
  console.log("B")
} else if (score >= 70) {
  console.log("C")
} else {
  console.log("F")
}
```

The first condition that's `true` wins; the rest are skipped.

## Ternary `? :`

For one-or-the-other choices, the ternary is shorter:

```tish
const age = 17
const status = age >= 18 ? "adult" : "minor"
console.log(status)   // "minor"
```

`condition ? whenTrue : whenFalse`.

:::tryit{code="const score = 75\nconst label = score >= 60 ? \"pass\" : \"fail\"\nconsole.log(label)"}

## Capstone: letter grade

Map a number to a letter:

| Score | Grade |
|---|---|
| ≥ 90 | A |
| ≥ 80 | B |
| ≥ 70 | C |
| < 70 | F |

:::exercise{id=10-elseif-ex expected="B"}
const score = 85
// print the right letter grade for `score`
:::

:::quiz{id=10-elseif-q1}
- prompt: In a chain of `if / else if / else`, how many bodies run?
- options: ["All of them", "Exactly one", "All matching"]
- answer: Exactly one
:::
