---
title: "Best practice: console.log is your microscope"
summary: When something is mysterious, print it.
---

Programs feel magical until they don't. The fastest way to demystify any program is to print what you can't see.

## The "what's in this variable?" pattern

You wrote a loop that's behaving weirdly. **Add a `console.log` inside the loop** to see what's actually happening:

```tish
const numbers = [3, 1, 4, 1, 5]
let total = 0
for (const n of numbers) {
  console.log("adding", n, "to total", total)
  total = total + n
}
console.log("final:", total)
```

The output traces every step. You'll usually spot the bug in five seconds.

## Print labeled values

`console.log("foo:", foo)` is much more useful than `console.log(foo)` once you have several variables to inspect.

## Don't be afraid to spam

Add 10 `console.log`s. Run. See what's happening. Delete the ones you don't need. Repeat.

:::callout{kind=tip title="Why not a real debugger?"}
Real debuggers exist and are great. But `console.log` is **always available**, **needs no setup**, and works the same in every environment. It's the universal first move.
:::

:::quiz{id=BP03-q1}
- prompt: What's the fastest way to figure out what a variable's value is at some point in a program?
- options: ["Read the source code very carefully", "Print it with console.log", "Restart the program"]
- answer: Print it with console.log
:::
