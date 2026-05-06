---
title: HTTP client
summary: fetch, ReadableStream body, single-consumer rule.
---

`fetch(url, opts?)` returns `Promise<Response>`. The response has `status`, `ok`, `headers`, `body`, `text()`, `json()`.

```tish
import { fetch } from "http"

const res = await fetch("https://api.example.com/things", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Ada" })
})
console.log(res.status, res.ok)
const data = await res.json()
```

## Single-consumer rule

`response.body` is an opaque **`ReadableStream`** of bytes. Once you call `body.getReader()`, **the body is locked** — calling `await res.text()` or `await res.json()` on the same response will fail.

Two patterns:

### Stream the body

```tish
const reader = res.body.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) { break }
  // value is a number[] of UTF-8 bytes
  process(value)
}
```

### Read the whole body

```tish
const text = await res.text()    // OR
const json = await res.json()
```

Pick **one path** per response. The runtime errors if you try both.

## Concurrent requests: fetchAll

```tish
import { fetchAll } from "http"

const responses = await fetchAll([
  "https://a.example.com",
  "https://b.example.com",
  "https://c.example.com"
])
const bodies = await Promise.all(responses.map((r) => r.text()))
```

:::callout{kind=warn title="JS target"}
On `--target js`, `body` follows the engine's spec, but the single-consumer rule applies just the same.
:::

:::quiz{id=13-http-q1}
- prompt: After `body.getReader()`, can you also call `await res.text()`?
- options: ["Yes, both work", "No, the body is locked", "Yes, but it returns null"]
- answer: No, the body is locked
:::
