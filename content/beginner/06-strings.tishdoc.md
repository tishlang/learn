---
title: Strings — text in code
summary: Quotes, escapes, and template literals.
---

Strings are text. You can wrap them in `"double"` or `'single'` quotes — both work the same.

```tish
let a = "hello"
let b = 'hello'
console.log(a === b)   // true
```

## Escapes

Inside a string, `\` is a special character. The most common escapes:

| Escape | Means |
|---|---|
| `\n` | newline |
| `\t` | tab |
| `\"` | a literal `"` |
| `\\` | a literal `\` |

:::tryit{code="console.log(\"line one\\nline two\")\nconsole.log(\"a\\tb\\tc\")\nconsole.log(\"she said \\\"hi\\\"\")"}

## Template literals

Backticks `` ` `` let you embed expressions with `${ ... }`:

```tish
const name = "Ada"
console.log(`Hello, ${name}!`)
// "Hello, Ada!"
```

Much nicer than `"Hello, " + name + "!"` once you have more than one variable.

:::tryit{code="const item = \"coffee\"\nconst price = 4.50\nconsole.log(`one ${item} is $${price}`)"}

## Capstone: receipt formatter

Print a receipt line. The expected output below uses `coffee` at `$4.50`.

:::exercise{id=06-str-ex expected="1x coffee — $4.50"}
const item = "coffee"
const price = 4.50
// build a string formatted exactly like: 1x coffee — $4.50
// note the em-dash (—) and the dollar sign
:::

:::callout{kind=tip title="Em-dash trick"}
Copy the `—` character from the expected output line. It's a Unicode em-dash, not a hyphen.
:::

:::quiz{id=06-str-q1}
- prompt: Which two strings are equal?
- options: [`"hi"` and `'hi'`, `"hi"` and `"hi "`, `"hi"` and `"HI"`]
- answer: `"hi"` and `'hi'`
:::
