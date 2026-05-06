---
title: String methods
summary: length, slice, includes, split, trim, toUpperCase.
---

Once you have a string, there are many useful operations. They all use **dot notation**: `someString.method(args)`.

## Length

```tish
console.log("Hello".length)   // 5
```

## Slice — take part of a string

```tish
console.log("Hello, world".slice(7))      // "world"
console.log("Hello, world".slice(0, 5))   // "Hello"
```

## Includes — does it contain X?

```tish
console.log("Hello".includes("ell"))   // true
console.log("Hello".includes("xyz"))   // false
```

## Case

```tish
console.log("hello".toUpperCase())   // "HELLO"
console.log("HELLO".toLowerCase())   // "hello"
```

## Split — break a string into parts

```tish
const csv = "a,b,c"
console.log(csv.split(","))   // ["a", "b", "c"]
```

## Trim — remove leading/trailing whitespace

```tish
console.log("   hi  ".trim())   // "hi"
```

:::tryit{code="const s = \"  Hello, World!  \"\nconsole.log(s.trim().toLowerCase().slice(0, 5))"}

## Capstone: username slugifier

Turn a name like `"Ada Lovelace"` into a URL-friendly slug `"ada-lovelace"`.

Recipe:
1. Lowercase the whole string.
2. Trim outer whitespace.
3. Replace spaces with `-`.

:::exercise{id=07-str-ex expected="ada-lovelace"}
const fullName = "  Ada Lovelace  "
// produce: ada-lovelace
// hint: .toLowerCase() then .trim() then .split(" ").join("-")
:::

:::quiz{id=07-str-q1}
- prompt: What does `"abc".length` return?
- options: ["3", "abc", "true"]
- answer: 3
:::
