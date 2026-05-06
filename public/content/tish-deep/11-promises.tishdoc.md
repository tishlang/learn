---
title: Promises
summary: ECMA Promise objects, .then / .catch / .finally / .all / .race.
---

Tish's Promise implementation matches ECMA-262: `Promise(executor)`, `.then`, `.catch`, `.finally`, `Promise.resolve`, `Promise.reject`, `Promise.all`, `Promise.race`. Available with the `http` feature.

## Constructor

```tish
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve(42), 50)
})

p.then((v) => console.log("got", v))    // "got 42"
```

## Combinators

```tish
const a = Promise.resolve(1)
const b = Promise.resolve(2)
const c = Promise.resolve(3)

const all = await Promise.all([a, b, c])   // [1, 2, 3]
const fst = await Promise.race([a, b, c])  // 1
```

## Generators are not supported

Some Promise patterns built on generators (e.g. early `co`-style libraries) won't work. Use `async`/`await` instead.

:::tryit{code="async fn delay(ms, val) {\n  return new Promise((resolve) => setTimeout(() => resolve(val), ms))\n}\n\nconst all = await Promise.all([delay(10, \"a\"), delay(5, \"b\"), delay(20, \"c\")])\nconsole.log(all)"}

:::quiz{id=11-prom-q1}
- prompt: Which feature flag enables Promises and timers?
- options: [http, fs, regex]
- answer: http
:::
