---
title: If / else
summary: Branching: do this, or that.
---

`if` runs code only when a condition is true. `else` is the fallback.

```tish
const hour = 9
if (hour < 12) {
  console.log("Good morning")
} else {
  console.log("Good afternoon")
}
```

The condition goes in `( ... )`. The body in `{ ... }`.

## Build it

:::pick{id=09-if-1 mode=assemble expected="Good morning"}
const hour = 9
if ( hour < 12 ) {
console . log ( "Good morning" )
} else {
console . log ( "Good afternoon" )
}
distractors: when, then
:::

## Capstone: greeting by time-of-day

If the hour is before 12, greet with `"Good morning"`. Otherwise greet with `"Good afternoon"`. The expected output below uses hour=9 → `Good morning`.

:::exercise{id=09-if-ex expected="Good morning"}
const hour = 9
// add an if/else that prints the right greeting
:::

:::callout{kind=tip title="Try changing hour"}
Open the editor, change `hour = 9` to `hour = 14`, and run again. The output should switch.
:::

:::quiz{id=09-if-q1}
- prompt: What runs when the if condition is `false`?
- options: ["The if body", "The else body", "Both"]
- answer: The else body
:::
