---
title: new and construct
summary: Why Tish parses `new` even though it has no class.
---

Tish accepts `new ExprChain(args)` syntax — same shape as JavaScript. But Tish has no `class` keyword, no prototypes, no `[[Construct]]`. So what does `new` actually do?

## On VM / interpreter / native Rust

Construction goes through a host **`construct`** path: roughly, "call this value as a function with the args, expecting it to return a new object." There is no automatic `this` binding, no prototype wiring, no `instanceof` operator.

Some builtin "constructors" are approximations:

- `new Uint8Array(n)` returns a numeric array of zeros — **not** a real typed byte buffer.
- Globals like `AudioContext` are stubs in the VM; they exist on the `--target js` build because the host engine provides them.

## On `--target js`

Emitted JavaScript uses the engine's real `new` (wrapped to keep Tish's null semantics). Whatever `new` means in V8, it means here too.

## Practical idiom

Browser globals (`new Date()`, `new URL("...")`, `new Blob([])`, `new Promise(executor)`, `new WebSocket(url)`) all work in `--target js` builds and in lessons. Avoid relying on `new` for non-host classes — there's no Tish way to **define** one.

```tish
const start = new Date()
const url = new URL("https://example.org/path?q=1")
console.log(url.searchParams.get("q"))   // "1"
```

If you'd reach for a class in JavaScript, reach for a closure-returning-object in Tish (see [09-arrays-objects](#/tish-deep/09-arrays-objects)).

:::quiz{id=10-new-q1}
- prompt: What does `new Foo()` do on the VM if `Foo` is a plain function?
- options: ["Throws — no class", "Calls Foo as a function expecting it to return an object", "Behaves identically to JavaScript [[Construct]]"]
- answer: Calls Foo as a function expecting it to return an object
:::
