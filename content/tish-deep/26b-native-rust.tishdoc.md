---
title: "tish build — native (rust)"
summary: The default native path. Emits Rust, lets cargo build the binary.
---

`tish build --native-backend rust` (or just `tish build`, since it's the default) is the **only** native exit that supports the full Tish ecosystem — `tish:*` modules, `cargo:` imports, npm-style native packages. It's the path you reach for when you want to ship a real desktop or server binary.

## What it actually produces

```text
.tish source ─► tishlang_compile ─► Rust source ─► cargo build --release ─► native binary
                                            │
                                            └── linked against tishlang_runtime
```

The compiler emits a Rust crate that calls into **`tishlang_runtime`** — the same `Value` enum, the same `get_index` / `set_index` / arithmetic helpers used by the interpreter and VM. `cargo build --release` then optimizes the **glue**: it doesn't yet flatten your Tish program into a numeric kernel.

```bash
tish build main.tish -o app
# explicit:
tish build main.tish -o app --native-backend rust
./app
```

## Why this path is special

It's the **only** native exit where the full Rust runtime is in-process. That unlocks:

- **`tish:*` native modules** — `tish:fs`, `tish:http`, `tish:process`, `tish:macos`, `tish:waterui`, `tish:shadertoy`, …
- **`cargo:` imports** — pull in any Rust crate by Cargo package name. Requires `tish.rustDependencies` in your `package.json`.
- **`@scope/pkg` native imports** — npm packages whose binding crates implement `pub fn name(args: &[Value]) -> Value`.
- **Destructuring in function parameters.** The bytecode VM doesn't yet implement that pattern; the Rust backend does.

```tish
import { readFile } from "tish:fs"
import { spawn_blocking } from "cargo:tokio_helpers"
const data = await readFile("./input.json")
```

Pure-Tish programs work too, of course — the Rust path is a strict superset of the others.

## What `cargo` brings to the table

- LTO + `codegen-units=1` in release mode → smaller, faster binaries.
- The full target triple ecosystem — cross-compile to Linux, macOS (x86_64 & arm64), Windows, FreeBSD, etc., with [`cargo --target`](https://doc.rust-lang.org/cargo/commands/cargo-build.html#compilation-options).
- Rust's link-time symbol resolution — your `cargo:` crates are statically linked into one binary.
- Future improvements (primitive lowering, AOT) plug in here first.

The trade-off: **build time**. A first build of a non-trivial program can take 30s–2min while cargo compiles `tishlang_runtime` and your dependencies. Incremental builds are fast.

## Required tooling

- **Rust + cargo 1.75+** — install via [rustup](https://rustup.rs/).
- Optionally a sysroot for cross-compilation (`rustup target add aarch64-apple-darwin`, etc.).
- For `cargo:` imports: a `package.json` with `tish.rustDependencies`, plus a `Cargo.toml` listing the same crate. The bindgen step (and the **`tishlang-cargo-bindgen`** tool that drives it) is described in the **Modules** part of [`LANGUAGE.md`](https://github.com/tishlang/tish/blob/main/docs/LANGUAGE.md).

## Capabilities (`--feature`)

For native builds, `--feature` chooses what's **linked into the produced binary**, not just what your source can call. Omit it and the binary inherits the same set as the `tish` CLI you're building with.

```bash
tish build server.tish -o server \
  --feature http --feature fs --feature process
```

If you want a truly minimal `tish` (e.g. a 1-feature audit binary), build the toolchain itself with `cargo build -p tishlang --no-default-features` and pick capabilities at link time.

## When to use it

- **Production native deploys** — CLI tools, daemons, GUI apps.
- **Anything using `tish:*` or `cargo:` imports.**
- When you want **`async` / `await` support backed by Tokio** through `tishlang_runtime`'s feature set.
- When you might one day benefit from **primitive lowering** (the future of this backend).

## When **not** to use it

- **Browsers / Workers / sandboxed runtimes** — see `--target wasm` or `--target wasi`.
- **No-Rust environments** — if your user can't `rustup` and you can't ship the binary yourself, prefer `--target js`.
- **Build-time sensitive CI** — Cranelift builds in seconds; cargo can take a minute.

## Limitations today

- Output is **dynamically tagged**. No `f64`-only loops yet (work in progress).
- Cold-start of large binaries is similar to other native programs (a few ms); LLVM-level inlining of Tish hot paths is still on the roadmap.
- Cross-compiling to exotic targets requires the matching sysroot. The Rust ecosystem's normal rules apply.

> Canonical reference: [tishlang.com — Native Backend](https://tishlang.com/docs/reference/native-backend).
> CLI: [`tish build --help`](https://tishlang.com/docs/getting-started/installation) (or run it locally for the full text).

:::quiz{id=26b-rust-q1}
- prompt: Why does `--native-backend rust` need `cargo`?
- options: ["Because Tish is implemented in JavaScript", "Because the compiler emits Rust source that links against `tishlang_runtime` and cargo builds it", "Because it cross-compiles to wasm"]
- answer: Because the compiler emits Rust source that links against `tishlang_runtime` and cargo builds it
:::

:::quiz{id=26b-rust-q2}
- prompt: Can `--native-backend rust` import `cargo:tokio_helpers`?
- options: ["Yes — this is the only native path that supports `cargo:` imports", "No — only the JS backend can do that", "Only on macOS"]
- answer: Yes — this is the only native path that supports `cargo:` imports
:::

Next: a totally different model — the same source, but cranelift packs the **bytecode itself** inside a tiny native binary.
