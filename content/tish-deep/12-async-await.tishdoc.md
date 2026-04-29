---
title: async / await
summary: Top-level await, timers, the async fn main pattern.
---

`async` and `await` work like JavaScript's. Top-level `await` is supported in `tish run` (module programs).

## In a script

```tish
import { fetch } from "http"

async fn fetchTitle(url) {
  const res = await fetch(url)
  const html = await res.text()
  const m = html.match(/<title>(.*?)<\/title>/)
  return m === null ? "(no title)" : m[1]
}

console.log(await fetchTitle("https://example.org"))
```

## In a native build

When `tish build` produces a binary, top-level `await` doesn't work — wrap your entry in `async fn main()`:

```tish
async fn main() {
  const title = await fetchTitle("https://example.org")
  console.log(title)
}
main()
```

## Timers

```tish
setTimeout(() => console.log("later"), 100)
const id = setInterval(() => tick(), 1000)
clearInterval(id)
```

`setTimeout` returns immediately (non-blocking). The callback runs after the delay on the event loop.

## Avoid blocking patterns

Tish doesn't have a built-in `sleep` that blocks; use `await new Promise((r) => setTimeout(r, ms))`:

```tish
async fn sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

await sleep(500)
console.log("after delay")
```

:::quiz{id=12-aw-q1}
- prompt: Where can you use top-level await?
- options: ["Anywhere", "Only in `tish run` module programs", "Only inside async fn main()"]
- answer: Only in `tish run` module programs
:::
