---
title: Strings and numbers
summary: Unicode scalar indices, 32-bit bitwise.
---

## Strings

Methods you'd expect — `length`, `slice`, `substring`, `indexOf`/`lastIndexOf`, `includes`, `split`, `trim`, `toUpperCase`/`toLowerCase`, `startsWith`/`endsWith`, `replace`/`replaceAll`, `charAt`/`charCodeAt`, `repeat`, `padStart`/`padEnd`. Plus `String.fromCharCode(…)`.

### Unicode note

String indices follow **Unicode scalar values** (Rust `char`). For BMP characters this matches JS. For astral characters (some emoji), JS uses two UTF-16 code units and Tish uses one scalar — indices can differ.

```tish
console.log("café".length)    // 4 in Tish, 4 in JS (BMP)
console.log("👋hi".length)     // 3 in Tish, 4 in V8 (astral emoji)
```

If you're parsing/comparing strings byte-exactly with JS, account for this.

## Numbers

Tish has a single numeric type backed by `f64`, like JS. `parseInt`, `parseFloat`, `isFinite`, `isNaN`, `Infinity`, `NaN` work as expected.

`n.toFixed(digits?)` returns a string with 0–20 digits of precision.

```tish
console.log((1 / 3).toFixed(4))   // "0.3333"
```

### Bitwise — 32-bit semantics

`& | ^ ~ << >>` operate on 32-bit signed ints (same as JS).

```tish
console.log(0xFF & 0x0F)   // 15
console.log(1 << 30)       // 1073741824
console.log(1 << 31)       // -2147483648
```

`>>>` (unsigned right-shift) is **not** in the current grammar; if you need it, mask with `& 0xFFFFFFFF` and divide.

## Math

`Math.abs`, `sqrt`, `min`, `max`, `floor`, `ceil`, `round`, `random`, `pow`, `sin`/`cos`/`tan`, `log`, `exp`, `sign`, `trunc`, etc. — JS-compatible names.

:::tryit{code="console.log(Math.floor(3.7))\nconsole.log(Math.round(2.5))\nconsole.log(Math.PI.toFixed(4))"}

:::quiz{id=08-sn-q1}
- prompt: For an astral emoji like 👋, how many scalars is `"👋".length` in Tish?
- options: [1, 2, "depends on the platform"]
- answer: 1
:::
