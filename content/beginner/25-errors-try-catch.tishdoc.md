---
title: try / catch
summary: Recover gracefully when something goes wrong.
---

Some errors are **expected**: parsing user input, fetching data, anything touching the outside world. For those, wrap risky code in `try` / `catch`.

```tish
try {
  const data = JSON.parse("{ broken json")
} catch (e) {
  console.log("couldn't parse:", e)
}
console.log("program continues")
```

If the code in `try` throws, control jumps to `catch`. The program keeps going.

## Throwing your own errors

```tish
fn divide(a, b) {
  if (b === 0) {
    throw "Cannot divide by zero"
  }
  return a / b
}

try {
  console.log(divide(10, 0))
} catch (e) {
  console.log("error:", e)
}
```

## Capstone: form validator

Validate a form: email must contain `@`, age must be ≥ 18. Throw on the first invalid field; print a friendly message in the catch.

:::exercise{id=25-err-ex expected="Invalid: email must contain @"}
// Write a `validate(form)` function that throws a descriptive string
// when `form.email` doesn't contain "@", or when `form.age < 18`.
// fn validate(form) { ... }

const form = { email: "broken-email", age: 25 }

// Call validate inside a try/catch.
// On success print "Valid".
// On failure print "Invalid: " followed by the thrown message.
try {
  // validate(form)
  console.log("Valid")
} catch (e) {
  // console.log("Invalid: " + e)
}
:::

:::quiz{id=25-err-q1}
- prompt: What happens to the program after a `throw` inside a `try`?
- options: ["The program crashes", "Control jumps to the catch and continues", "The throw is silently ignored"]
- answer: Control jumps to the catch and continues
:::
