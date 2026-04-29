---
title: Hello, code
summary: Run your first Tish program.
---

Code is a list of instructions you give a computer. The computer reads the list, top to bottom, and does what you wrote.

This first lesson does **one thing**: print the word `Hello`.

## What "the console" is

You'll see the word **console** a lot. In coding, the console is just a small window where the computer writes text for you to read. Think of it as a scratchpad the program uses to show you what it's doing.

Throughout this site, the console looks like a thin strip below the code:

- When the program runs **correctly**, you'll see a **green ✓ Correct!** strip.
- When the program prints text, that text appears in the strip.
- When something goes wrong, you'll see a **red Error** strip with the message.

:::callout{kind=note title="Many kinds of consoles"}
- In this site: a **strip below the code** shows the output.
- In a web browser: open **DevTools → Console** (right-click → Inspect, then click "Console") to see the same kind of output for any webpage.
- On a Mac or Linux machine: a **Terminal** app is a black-and-white text window where you type commands and read results. Same idea, different look.
- On Windows: it's called **Command Prompt** or **PowerShell**.

They all do the same job: text in, text out. **You don't need to install anything for this site** — the strip below each code block is your console.
:::

## How the chip puzzles work

The next box has two parts:

1. **Slots** at the top (the empty `_` boxes). This is where your program lives. Slots fill **from left to right**.
2. **A tray** of chips at the bottom. Tap a chip and it slides into the next empty slot.

Tapped a chip you didn't mean to? **Tap the slotted chip** (the highlighted one at the top) and it goes back to the tray. Then tap the right one.

When all slots are full, click **Check**. The site assembles your chips into a real program, runs it, and tells you if the output matched what we expected.

:::callout{kind=tip title="No typing yet"}
For the first few chapters you'll never need the keyboard. Just tap chips. Once your eye is used to what code looks like, we'll graduate to typing.
:::

## Your first program

Print the word **Hello**. The chips you need are: `console`, `.`, `log`, `(`, `"Hello"`, `)`. The tray also has a few **distractors** — chips that look plausible but aren't quite right (`print`, `say`, `'Hello'` with single quotes). Use the right ones.

:::pick{id=01-hello-1 mode=assemble expected="Hello"}
console . log ( "Hello" )
distractors: print, say, 'Hello'
:::

That's it. You wrote your first program.

The green checkmark means the program ran and printed exactly `Hello`. **Order matters** — the same chips in a different order would have produced something different (or no output at all).

:::callout{kind=tip title="What just happened?"}
- `console.log(...)` is the most-used instruction in code: "**show this value**".
- `"Hello"` is a **string** — text, wrapped in double quotes. Strings always have matching quotes around them.
- The dots, parentheses, and quotes are **syntax** — punctuation the computer needs. Feels picky at first, indispensable later.
:::

## Try changing the message

Now do it once more, but make it greet someone. Same recipe, different string. The expected output is `Hello, friend`.

:::pick{id=01-hello-2 mode=assemble expected="Hello, friend"}
console . log ( "Hello, friend" )
distractors: print, ;
:::

:::callout{kind=tip title="Reading the result strip"}
- **Green ✓ Correct!** — your program's output matched what we expected.
- **Red diff** — your output and the expected output side by side. The difference points at the chip that's in the wrong spot (or missing). Read carefully.
- **Red Error** — something tripped the computer up before it finished reading your program. Don't panic; the next chapter is all about reading errors.
:::

:::quiz{id=01-hello-q1}
- prompt: What does `console.log` do?
- options: ["Print a value to the console", "Save the program", "Restart the computer"]
- answer: Print a value to the console
:::

:::quiz{id=01-hello-q2}
- prompt: How do you put a chip back in the tray after slotting it?
- options: ["Refresh the page", "Tap the slotted chip", "Tap Reset"]
- answer: Tap the slotted chip
:::

Next chapter: what to do when something goes wrong.
