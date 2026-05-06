---
title: Modules — split your code
summary: import and export across files.
---

So far everything's been in one file. Real programs span dozens. **Modules** are how you split code without losing your mind.

## Two halves: `export` and `import`

A module **exports** what it wants others to use, and **imports** from other modules.

`mathHelpers.tish`:
```tish
export fn add(a, b) = a + b
export fn double(x) = x * 2
```

`main.tish`:
```tish
import { add, double } from "./mathHelpers.tish"

console.log(add(2, 3))    // 5
console.log(double(7))    // 14
```

## Try it in the IDE

This sandbox has two files (look at the file list — click between them). `main.tish` imports from `tasks.tish`.

:::sandbox{kind=ide id=27-modules}
import { format, total } from "./tasks.tish"

const tasks = [
  { name: "Write report", hours: 3 },
  { name: "Review PRs", hours: 2 },
  { name: "Deploy", hours: 1 }
]

console.log(format(tasks))
console.log("Total hours:", total(tasks))
---FILE: tasks.tish---
export fn format(tasks) {
  return tasks.map((t) => "• " + t.name + " (" + t.hours + "h)").join("\n")
}

export fn total(tasks) {
  return tasks.reduce((s, t) => s + t.hours, 0)
}
:::

:::callout{kind=tip title="Why bother?"}
Once a file gets longer than ~150 lines, splitting helps **enormously**. You read each smaller file in isolation. You can move pieces around without breaking everything. The file names become a table of contents.
:::

:::quiz{id=27-mod-q1}
- prompt: How do you let another file use a function from this one?
- options: ["Add `export` before the function definition", "Add it to a global object", "Nothing — all functions are shared"]
- answer: Add `export` before the function definition
:::
