---
title: "Best practice: run early, run often"
summary: Tiny iterations beat big rewrites.
---

The slowest way to write a working program is to write a lot of it before running it.

The fastest way: write **one tiny step**, run it, see it work, then write the next.

## A typical mistake

> "I'll just write all five functions, then run the whole thing."

When the program doesn't work — and it won't on the first run — you have **five functions** to debug at once. You don't know which one is wrong.

## A better rhythm

```
1. Write 5 lines.
2. Run.
3. See it work (or fix the small issue you just made).
4. Write 5 more lines.
5. Run.
```

Each run only added 5 lines, so any new bug is in those 5 lines.

## The MiniRunner is built for this

Throughout these chapters, the **Run** button is right next to the editor. That's deliberate. **Click it constantly.** Even if you only added one character.

:::callout{kind=tip title="The compounding effect"}
This habit feels slow at first ("why am I running it for one tiny change?"), but it pays off enormously: you almost never spend more than a minute lost. Over a week, that adds up to *hours*.
:::

:::quiz{id=BP06-q1}
- prompt: When should you run your program?
- options: ["Only when it's complete", "Every few lines, constantly", "Once a day"]
- answer: Every few lines, constantly
:::

That's the end of Part V. Up next: your first webpage.
