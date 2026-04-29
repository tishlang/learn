---
title: Process
summary: process.argv, env, cwd, exit.
---

The `process` feature gives you a familiar global.

```tish
import { process } from "process"

console.log(process.argv)   // ["script.tish", "--flag", "value"]
console.log(process.cwd)    // "/users/me/proj"

if ("PORT" in process.env) {
  const port = parseInt(process.env["PORT"])
}

if (process.argv.length < 2) {
  console.error("usage: tish run script.tish <name>")
  process.exit(1)
}
```

`process.exit(code)` ends the program immediately; non-zero codes signal failure to the shell.

## Patterns

### Env-or-default

```tish
fn envOr(key, fallback) {
  if (key in process.env) { return process.env[key] }
  return fallback
}

const port = parseInt(envOr("PORT", "8080"))
```

### Simple arg parsing

```tish
fn flag(name) {
  let i = 0
  while (i < process.argv.length) {
    if (process.argv[i] === "--" + name) { return true }
    i = i + 1
  }
  return false
}

if (flag("verbose")) { console.log("verbose mode on") }
```

For more complex CLIs, write a tiny argument-parser library — there's no built-in `commander`-equivalent yet.

:::quiz{id=16-proc-q1}
- prompt: What feature flag enables `process.exit`?
- options: [http, fs, process]
- answer: process
:::
