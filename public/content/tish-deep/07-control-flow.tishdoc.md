---
title: Control flow
summary: if / while / do-while / for / switch / try.
---

The full grammar mirrors JS. Highlights:

## `for...of` over arrays and strings

```tish
for (const x of [1, 2, 3]) { ... }
for (const c of "abc") { ... }
```

There is **no `for...in`** — use `Object.keys(obj)` and a `for...of`.

## `switch`

```tish
switch (kind) {
  case "info": logInfo(); break
  case "warn":
  case "error": logBad(); break
  default: logUnknown()
}
```

C-style fallthrough — explicit `break` per case, or stack `case` labels for shared bodies.

## `try` / `catch`

```tish
try {
  const data = JSON.parse(raw)
} catch (e) {
  console.error("parse failed", e)
}
```

The bound name (`e`) is whatever you `throw`. There is **no `finally`** in v0.x — wrap teardown manually if you need it.

## `throw` anything

```tish
throw "string"
throw { code: 503, message: "down" }
throw new Error("traditional")
```

There's no required Error class; `catch` receives whatever you threw.

## Loop control

`break` and `continue` work as expected. There are no labeled breaks — restructure with a helper function or a flag.

:::tryit{code="const xs = [1, 2, 3, 4, 5]\nfor (const x of xs) {\n  if (x === 3) { continue }\n  if (x === 5) { break }\n  console.log(x)\n}"}

:::quiz{id=07-cf-q1}
- prompt: Which loop is missing from Tish that's in JS?
- options: ["for...of", "for...in", "do...while"]
- answer: for...in
:::
