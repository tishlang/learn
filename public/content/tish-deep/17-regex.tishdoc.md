---
title: RegExp
summary: The `regex` feature.
---

`RegExp` is gated behind the `regex` feature flag. Without it, `RegExp` is `undefined` and `String.match` / `String.replace` lose their regex overloads.

```tish
const re = RegExp("\\d+", "g")
const matches = "foo 12 bar 34".match(re)
console.log(matches)    // ["12", "34"]
```

Or with `String.replace`:

```tish
console.log("hi  there".replace(RegExp("\\s+", "g"), " "))   // "hi there"
```

## Patterns

The regex engine matches Rust's [`regex`](https://docs.rs/regex) crate semantics — Perl-compatible mostly, with some differences from JavaScript's:

- No lookbehind in default mode.
- Unicode class names use `\p{...}`.
- Capture groups are 1-indexed.

If a pattern that worked in JS doesn't here, check the regex crate docs first.

## Performance

`RegExp("...", "")` constructs a fresh regex each call — pull constants out of hot loops:

```tish
// Faster
const RE = RegExp("\\d+", "g")
fn extractNums(s) { return s.match(RE) }

// Slower
fn extractNums(s) { return s.match(RegExp("\\d+", "g")) }
```

:::quiz{id=17-regex-q1}
- prompt: What's available without the `regex` feature?
- options: ["Just RegExp constructors", "Full regex including String.match overloads", "Nothing — RegExp is undefined"]
- answer: Nothing — RegExp is undefined
:::
