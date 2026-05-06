---
title: HTTP server
summary: serve(port, handler) — request and response shape.
---

`serve(port, handler)` is the built-in HTTP server. **No Express, no Node, no `body-parser`** — it's a host primitive.

```tish
import { serve } from "http"

fn handle(req) {
  if (req.path === "/health") {
    return { status: 200, body: "OK" }
  }
  if (req.method === "POST" && req.path === "/echo") {
    return { status: 200, body: req.body, headers: { "Content-Type": "text/plain" } }
  }
  return { status: 404, body: "Not Found" }
}

console.log("listening on :8080")
serve(8080, handle)
```

## Request shape

`req` has at least:
- `method`: `"GET"` / `"POST"` / etc.
- `path`: `/api/users`
- `query`: `?id=42` (raw query string)
- `headers`: object of header name → value
- `body`: a **string** for server requests (not a stream like the client).

## Response shape

Return:
- `status`: number, defaults 200
- `body`: string, OR
- `file`: path to a file to stream (for binary like `.wasm`, `.png`)
- `headers`: object

The dev server pattern:

```tish
fn isBinary(path) { return path.endsWith(".wasm") || path.endsWith(".png") }

fn handleStatic(req) {
  const path = "public" + req.path
  if (!fileExists(path)) { return { status: 404, body: "Not Found" } }
  const ct = contentType(path)
  if (isBinary(path)) {
    return { status: 200, headers: { "Content-Type": ct }, file: path }
  }
  const body = readFile(path)
  return { status: 200, headers: { "Content-Type": ct }, body: body }
}
```

## In-browser equivalent

The Capstones track shows the same handler signature running in-browser via `tish-browser-server` (Service Worker). Code is portable: change `from "http"` to `from "tish-browser-server"` and the server-side code runs in a tab.

:::quiz{id=14-srv-q1}
- prompt: Server-side `req.body` is what type?
- options: ["A ReadableStream", "A string", "A Uint8Array"]
- answer: A string
:::
