---
title: Objects
summary: Bundles of named values.
---

If an array is a list, an **object** is a labeled bag. Each value has a **key**.

```tish
const user = {
  name: "Ada",
  age: 36,
  email: "ada@lovelace.io"
}
```

## Access by name

Two ways to get a value out:

```tish
console.log(user.name)        // "Ada"
console.log(user["email"])    // "ada@lovelace.io"
```

Dot notation is shorter; bracket notation works when the key is dynamic.

## Update

```tish
user.age = 37
user["email"] = "ada@analyticalengine.io"
```

## Capstone: contact card

Build an object representing a contact, then print it as a formatted card.

:::exercise{id=19-obj-ex expected="Ada Lovelace\\n📧 ada@lovelace.io\\n📞 +44 1234 5678"}
const contact = {
  name: "Ada Lovelace",
  email: "ada@lovelace.io",
  phone: "+44 1234 5678"
}
// Print three lines:
//   <name>
//   📧 <email>
//   📞 <phone>
:::

:::callout{kind=tip title="Tish has no undefined"}
If you read a key that doesn't exist, accessing it **throws** in Tish (unlike JavaScript, which returns `undefined`). Use the `in` operator to check first: `if ("phone" in contact) { ... }`.
:::

:::quiz{id=19-obj-q1}
- prompt: How do you read `user.name`?
- options: ["user.name", "user[name]", "user(name)"]
- answer: user.name
:::
