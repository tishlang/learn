---
title: Errors are friends
summary: How to read and recover from a mistake.
---

Mistakes are normal. The computer won't yell at you — it'll show you a short message called an **error**, point at the line, and stop.

Reading errors is the single most useful skill you can build today.

## Make a deliberate mistake

The chips below are missing the closing `)`. Tap them in order anyway and click **Check** — see what happens.

:::pick{id=02-err-1 mode=assemble}
console . log ( "broken"
distractors: ), ;
:::

You'll see something like:

```text
Bytecode compile error:
ParseError: expected ')'
```

That's the error. It's telling you: "I was reading your program and got to where I expected a closing parenthesis, but the program ended first."

Now find the missing `)` chip in the tray and add it. Click **Check** again.

:::callout{kind=tip title="Errors point to a fix, not a failure"}
Almost every error message names what was missing or wrong. Read it slowly. The fix is usually the thing it just told you.
:::

## A second kind of error

Try running this — every chip you need is here, but watch what happens:

:::pick{id=02-err-2 mode=assemble expected="oops"}
console . log ( "oops" )
distractors: console.log, "wow"
:::

Two of the chips look almost-right but aren't quite what we want. **The program runs perfectly when you assemble it correctly.** Errors aren't always shouted in red — sometimes the wrong output is the only signal.

:::quiz{id=02-err-q1}
- prompt: What's the right reaction to seeing an error message?
- options: ["Panic and start over", "Read the message slowly — it usually names the fix", "Delete everything"]
- answer: Read the message slowly — it usually names the fix
:::

Next chapter: storing a value so you can use it more than once.
