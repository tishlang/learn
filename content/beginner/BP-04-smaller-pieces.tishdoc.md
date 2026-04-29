---
title: "Best practice: smaller pieces"
summary: One function, one job.
---

When a function does too much, it gets hard to test, hard to read, and hard to reuse.

The fix: **split it into smaller functions**. Each function should do one thing.

## A function that's doing too much

```tish
fn buildReceipt(items, taxRate) {
  // sum prices, format each line, build the totals, format the footer...
  let subtotal = 0
  let lines = []
  for (const item of items) {
    subtotal = subtotal + item.price
    lines.push(item.name + " — $" + item.price)
  }
  const tax = subtotal * taxRate
  const total = subtotal + tax
  let receipt = lines.join("\n")
  receipt = receipt + "\n--\nSubtotal: $" + subtotal
  receipt = receipt + "\nTax: $" + tax
  receipt = receipt + "\nTotal: $" + total
  return receipt
}
```

## Same logic, smaller pieces

```tish
fn lineItems(items) {
  return items.map((it) => it.name + " — $" + it.price).join("\n")
}

fn subtotal(items) {
  return items.reduce((s, it) => s + it.price, 0)
}

fn footer(sub, taxRate) {
  const tax = sub * taxRate
  return "--\nSubtotal: $" + sub + "\nTax: $" + tax + "\nTotal: $" + (sub + tax)
}

fn buildReceipt(items, taxRate) {
  const sub = subtotal(items)
  return lineItems(items) + "\n" + footer(sub, taxRate)
}
```

The big function reads like an outline. Each helper is independently testable.

:::callout{kind=tip title="The five-line guideline"}
A useful (not absolute) rule: if a function is more than 5–10 lines, ask whether part of it could be a smaller named function.
:::

:::quiz{id=BP04-q1}
- prompt: Why split a long function into smaller ones?
- options: ["Because the computer runs faster", "Because each piece is easier to read, test, and reuse", "It's not actually better"]
- answer: Because each piece is easier to read, test, and reuse
:::
