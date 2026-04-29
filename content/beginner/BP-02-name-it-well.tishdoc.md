---
title: "Best practice: name things well"
summary: Clear names beat clever names.
---

You'll spend more time **reading** code than writing it — your own and others'. Names are the single biggest factor in whether reading is pleasant or punishing.

## Three rules that compound

### 1. Name things by what they are, not how they're stored

```tish
// bad
let x = 50

// good
let billAmount = 50
```

The first line forces the reader to scroll up to figure out what `x` means. The second line is self-explanatory.

### 2. Boolean variables read like questions

```tish
// bad
let valid = true

// good
let isValid = true
let hasErrors = false
let canSubmit = true
```

When the variable name reads like a yes/no question, code that uses it reads like English: `if (canSubmit) ...`.

### 3. Name the unit when it matters

```tish
// bad
const timeout = 5000

// good
const timeoutMs = 5000
```

The reader doesn't have to guess whether `5000` is seconds, milliseconds, or microseconds.

:::callout{kind=tip title="When in doubt, longer is better"}
A variable named `userInput` is better than `ui`. A function called `parseTimestampToDate` is better than `pt`. Modern editors auto-complete; you only type the name once but read it forever.
:::

:::quiz{id=BP02-q1}
- prompt: Which name is best for a variable holding the user's age in years?
- options: ["a", "x", "ageYears"]
- answer: ageYears
:::

:::quiz{id=BP02-q2}
- prompt: Which name reads best for a boolean indicating "the form is valid"?
- options: ["valid", "isFormValid", "v"]
- answer: isFormValid
:::
