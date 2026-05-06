---
title: Feature flags
summary: Secure-by-default I/O.
---

Tish runs in **secure mode** unless you opt in. Console, Math, JSON, parsing, Object/Array/String methods are always available; everything else needs a flag.

| Flag | Enables |
|---|---|
| `http` | `fetch`, `fetchAll`, `serve`, `Promise`, `setTimeout`/`setInterval` |
| `fs` | `readFile`, `writeFile`, `fileExists`, `readDir`, `mkdir` |
| `process` | `process.exit`, `cwd`, `argv`, `env` |
| `regex` | `RegExp`, `String.match`/`replace` with regex |
| `full` | All of the above |

## Run

`tish run` is built-in: features depend on how the binary was compiled. The default `tish` from Homebrew/cargo install includes `full`. Restricted environments may use a `tish-secure` binary that omits I/O.

## Build

`tish build` accepts `--feature` (singular, repeatable):

```bash
tish build server.tish -o server --feature http --feature fs
```

The resulting binary only links the runtime support for the listed features — small, fast, audit-friendly.

## Why this matters

For lessons, libraries, untrusted code: the secure subset (just `console` + `Math` + `JSON`) is enough to teach algorithmic thinking with **zero attack surface**. The `regex` engine, the HTTP stack, the filesystem layer — none of them ship in `tish-vm.wasm` (the bytecode VM you're running in this site's `Run` button) by default.

```bash
# A secure script: can do math, allocate strings, but cannot touch the world.
tish run --feature regex script.tish
```

:::quiz{id=18-feat-q1}
- prompt: What's in scope without any feature flag?
- options: ["console, Math, JSON, parseInt — pure compute", "Nothing", "Everything"]
- answer: console, Math, JSON, parseInt — pure compute
:::
