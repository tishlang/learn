---
title: "tish run — interpreter & VM"
summary: The dev loop. Two backends, both in-process, both with Rust runtime.
---

`tish run` is the route you reach for during development. It does **not** produce a binary — it parses your file, runs it, and exits. Two backends share the same parser:

| Flag | Backend | Notes |
|---|---|---|
| `tish run …` (default) | Bytecode **VM** (`tishlang_vm`) | Faster on real workloads. Top-level `await` works. |
| `tish run --backend interp …` | Tree-walking **interpreter** (`tishlang_eval`) | Fewer optimizations — useful for debugging codegen mismatches. |

Both backends host a **full `tishlang_runtime`** in the same Rust process, so `tish:fs`, `tish:http`, `tish:process`, `cargo:` imports, even macOS UI hooks all work without a `cargo build` step.

## What it actually does

```text
.tish file ──► lex ──► parse ──► AST
                                ├── --backend interp ──► tree-walk eval
                                └── --backend vm     ──► compile to bytecode ──► run on VM
```

The interpreter walks the AST node-by-node and evaluates as it goes. The VM lowers the AST to a stack-based bytecode that lives only in memory (it's not written to disk), then runs it. **Same `Value` type, same builtins, same standard library** — just two different execution strategies.

```bash
tish run main.tish                       # default: VM
tish run --backend interp main.tish      # tree-walking interpreter
tish run --backend vm main.tish          # explicit VM
```

You can also pipe a program in (`bun`-style or `node -`-style):

```bash
echo 'console.log(1 + 2)' | tish
echo 'console.log(1 + 2)' | tish -
echo 'console.log(1 + 2)' | tish run -
```

## Capabilities (`--feature`)

By default the script can use **every** capability the `tish` binary was compiled with. Pass `--feature` to lock things down:

```bash
tish run untrusted.tish --feature fs --feature timers
```

| Flag | Enables |
|---|---|
| `http` | `fetch`, `fetchAll`, `serve`, Promises (and `await`); also turns on `timers` |
| `timers` | `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval` |
| `fs` | `readFile`, `writeFile`, `fileExists`, `isDir`, `readDir`, `mkdir` |
| `process` | `process.exit`, `cwd`, `exec`, `argv`, `env` |
| `regex` | `RegExp` (the regex feature flag) |
| `ws` | WebSocket client / server |
| `full` | All of the above |

Tish is **secure-by-default**: a script you don't trust gets nothing until you explicitly pass `--feature`.

> Detailed CLI doc: see [`tish run --help`](https://tishlang.com/docs/getting-started/repl) and [Feature flags](https://tishlang.com/docs/features/http) on tishlang.com.

## REPL

`tish` with no args in an interactive terminal starts the **REPL** (also `tish repl`). Same backends, same `--feature` semantics. Top-level `await` works inside REPL forms.

```bash
$ tish
Tish 1.x — :help, :quit
> let x = await fetch("https://example.com")
> x.status
200
```

## When to use `tish run`

- **Day-to-day development.** Edit, save, re-run. No build artifacts.
- **Scripts and tooling.** A `.tish` file is a fine substitute for a Bash one-liner. With `--feature fs --feature process` you get readable filesystem code.
- **REPL exploration** of a library you're learning.
- **Debugging codegen** — if a program behaves differently in `tish build`, run it with `--backend interp` first to isolate whether the bug is in the interpreter, the VM, or downstream codegen.

## When **not** to use it

- **Distribution.** Your users would need the `tish` toolchain. Use `tish build` for shippable artifacts.
- **Cold-start-sensitive serverless.** Each `tish run` invocation parses + lowers the source. Pre-compile to a binary or a `.wasm` instead.

:::quiz{id=26a-run-q1}
- prompt: Which `tish run --backend …` value is the default?
- options: ["interp", "vm", "rust"]
- answer: vm
:::

:::quiz{id=26a-run-q2}
- prompt: A user pipes you an untrusted program with `cat foo.tish | tish run --feature fs -`. Can it call `fetch`?
- options: ["Yes — features are additive", "No — you only granted fs, so http is denied", "Only on macOS"]
- answer: No — you only granted fs, so http is denied
:::

Next: how `--native-backend rust` turns your code into a real native executable.
