---
title: "Best practice: comment WHY, not what"
summary: Code shows what; comments should show why.
---

A comment that just narrates the code is noise:

```tish
// Increment i by 1
i = i + 1
```

We can see that. The reader's question isn't "what does `i = i + 1` do?" — it's "why?".

## Better comments

Explain **intent**, **trade-offs**, **constraints**.

```tish
// Round up so partially-filled pages still count as a full page.
const pageCount = Math.ceil(items / pageSize)
```

```tish
// We dedupe on lower-case email because users frequently mix capitalization
// and we treat ada@x.io and Ada@x.io as the same account.
const key = email.toLowerCase()
```

```tish
// IMPORTANT: order matters here — must check 15 before 3 and 5 individually.
if (i % 15 === 0) { ... }
```

## When you don't need a comment

If the code is already self-explanatory because of good names, **don't** add a comment.

```tish
// bad
const e = users.filter((u) => u.active)   // filter for active users

// good
const activeUsers = users.filter((u) => u.active)
```

The variable name does the work the comment was trying to do.

:::callout{kind=tip title="The 'six months later' test"}
Imagine yourself reading this code in six months. What would you wish the comment told you? Usually it's "why," not "what."
:::

:::quiz{id=BP05-q1}
- prompt: Which is the most useful comment?
- options: ["// Add 1 to i", "// Skip the first row because it's a header", "// Variable named result"]
- answer: // Skip the first row because it's a header
:::
