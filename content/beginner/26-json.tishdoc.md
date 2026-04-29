---
title: JSON — saving and loading data
summary: JSON.parse and JSON.stringify.
---

Objects and arrays in your program live in memory and disappear when the program ends. To **persist** them — write to disk, send across the network, save in `localStorage` — you turn them into strings.

The standard format is **JSON**.

## stringify — object to string

```tish
const todo = { text: "buy milk", done: false }
console.log(JSON.stringify(todo))
// {"text":"buy milk","done":false}
```

## parse — string to object

```tish
const raw = '{"text":"buy milk","done":false}'
const todo = JSON.parse(raw)
console.log(todo.text)   // "buy milk"
```

`JSON.parse` throws if the string is malformed — wrap in `try / catch` if the input might be invalid.

## Round-trip

```tish
const original = [1, 2, 3, { nested: true }]
const wire = JSON.stringify(original)
const restored = JSON.parse(wire)
console.log(restored[3].nested)   // true
```

## Capstone: save/load TODO list

Take a list of todos, JSON-encode it, decode it back, and print the texts.

:::exercise{id=26-json-ex expected="buy milk\\nwalk dog\\nfile taxes"}
const todos = [
  { text: "buy milk", done: false },
  { text: "walk dog", done: true },
  { text: "file taxes", done: false }
]

// Step 1: turn `todos` into a JSON string with JSON.stringify(...)
// Step 2: turn that string back into an array with JSON.parse(...)
// Step 3: loop over the restored array and console.log each todo's `.text`

// const saved = ...
// const restored = ...
// for (const t of restored) { ... }
:::

:::quiz{id=26-json-q1}
- prompt: What does `JSON.stringify({a:1})` return?
- options: ["{a:1}", "{\"a\":1}", "1"]
- answer: {"a":1}
:::
