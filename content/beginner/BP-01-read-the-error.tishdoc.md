---
title: "Best practice: read the error"
summary: A mindset shift that pays for itself every day you write code.
---

When something breaks — and it will — the temptation is to start changing things at random. Don't.

**Slow down. Read the message.** Two sentences from the computer almost always contain the fix.

## A heuristic that works 90% of the time

1. **Look for a line number.** The error usually says where it happened.
2. **Look for a quoted name.** Most errors mention a word in quotes — that's what was wrong.
3. **Look for the verb.** Words like "expected", "missing", "undefined", "not a function" each have a specific meaning.

## Common Tish errors and what they mean

| Message | What it really says |
|---|---|
| `expected ';'` or `expected ')'` | "I'm halfway through reading something and you stopped." Add the missing punctuation. |
| `Property 'X' not found` | "You wrote `obj.X`, but `obj` doesn't have a key called `X`." Spelling mistake or wrong object. |
| `'X' is not defined` | "You used a name `X` that nothing has been assigned to." Did you mean a different name? |
| `Cannot read property of null` | "You tried to look inside a value that was `null`." Check what produced that value. |

:::callout{kind=tip title="Search second, read first"}
After you've read the message and stared at the line for 30 seconds, **then** copy the message into a search engine. The pattern repeats: you fix far more bugs by reading carefully than by frantic Googling.
:::

:::quiz{id=BP01-q1}
- prompt: When you see an error, what should you do first?
- options: ["Read the message slowly", "Restart the computer", "Delete the program and start over"]
- answer: Read the message slowly
:::
