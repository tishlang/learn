---
title: Variables — naming things
summary: let you give a value a name so you can use it later.
---

Right now every value disappears as soon as you print it. **Variables** let you give a value a name so you can use it again.

```tish
let name = "Ada"
console.log("Hello, " + name)
```

That program does three things:

1. **Make** a variable called `name` and store the string `"Ada"` in it.
2. Build a new string by joining `"Hello, "` with whatever's in `name`.
3. Print it.

## Build it from chips

:::pick{id=03-var-1 mode=assemble expected="Hello, Ada"}
let name = "Ada"
console . log ( "Hello, " + name )
distractors: const, var, print
:::

:::callout{kind=tip title="The + does two things"}
With **numbers**, `+` adds. With **strings**, `+` joins. So `"Hello, " + "Ada"` becomes `"Hello, Ada"`. Tish picks the right behavior based on what's on each side.
:::

## Reassign a variable

`let` makes a variable you **can** reassign:

:::tryit{code="let name = \"Ada\"\nname = \"Grace\"\nconsole.log(\"Hello, \" + name)"}

Try changing `"Grace"` to your own name and run it again.

## Capstone: name-tag generator

Write a program that prints `"Hello, my name is "` followed by a name **of your choosing**. The expected output below uses `Tish`, but feel free to put your own name in.

:::exercise{id=03-var-ex expected="Hello, my name is Tish"}
let name = "Tish"
// add a console.log here that prints exactly: Hello, my name is <name>
:::

:::quiz{id=03-var-q1}
- prompt: What does `let` do?
- options: ["Declares a variable you can reassign later", "Prints a message", "Stops the program"]
- answer: Declares a variable you can reassign later
:::

Next: a small but powerful detour — how to read errors fast.
