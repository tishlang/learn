---
title: 10-minute syntax tour
summary: Everything you need to start reading Tish.
---

A condensed grammar sweep. If a section looks like JavaScript, that's because it is — Tish copies syntax aggressively.

## Variables, functions, control flow

```tish
let mutable = 1
const fixed = "hello"

fn add(a, b) { return a + b }
fn double(x) = x * 2                  // single-expression body
const triple = (x) => x * 3            // arrow

if (mutable > 0) { ... } else { ... }

while (cond) { ... }
do { ... } while (cond)
for (let i = 0; i < 10; i = i + 1) { ... }
for (const x of [1, 2, 3]) { ... }     // arrays
for (const c of "abc") { ... }         // strings

switch (val) {
  case 1: ...
  default: ...
}

try { riskyOp() } catch (e) { console.log(e) }
throw "boom"
```

## Literals

```tish
const n = 42                  // integer
const f = 3.14                // float
const s = "double"            // string
const t = `tagged ${name}`    // template literal
const b = true                // boolean
const z = null                // null
const arr = [1, 2, 3]
const obj = { x: 1, y: 2 }
```

## Operators

| Class | Operators |
|---|---|
| arithmetic | `+ - * / % **` |
| bitwise (32-bit ints) | `& | ^ ~ << >>` |
| compare | `< <= > >= === !==` |
| logical | `&& || !` |
| nullish | `??` |
| optional chain | `?.` (yields `null`) |
| ternary | `? :` |
| postfix | `++ --` |

`+` is overloaded: numeric on numbers, string concat on strings.

## Blocks: braces or indentation

These are equivalent:

```tish
fn handle(req) {
  if (req.path === "/health") {
    return { status: 200, body: "OK" }
  }
  return { status: 404, body: "Not Found" }
}

fn handle(req)
    if req.path === "/health"
        return { status: 200, body: "OK" }
    return { status: 404, body: "Not Found" }
```

**1 tab = 1 level. 2 spaces = 1 level.** Don't mix tabs and spaces in the same file.

## Imports / exports

```tish
import { fetch, serve } from "http"
import { foo } from "./helpers.tish"
import { greet as hello } from "./greet.tish"

export fn add(a, b) = a + b
export const MAX = 100
```

Shop the rest of this track to dig into each topic. The sequence is loose — feel free to jump.

:::quiz{id=02-tour-q1}
- prompt: What does `null === null` evaluate to?
- options: [true, false, "error — both null"]
- answer: true
:::
