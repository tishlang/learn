---
title: Build targets — overview
summary: Same source, six exits — `tish run`, native (rust / cranelift / llvm), js, wasm, wasi.
---

A Tish source tree is parsed into one AST and lowered to one bytecode form. After that, the toolchain branches: it can interpret the AST, run the bytecode in the VM, transpile to Rust source, embed the bytecode in a native object file, emit JavaScript, or pack the VM into a WebAssembly module. **Each "exit" gives you the same language with different trade-offs.**

This part of the curriculum has **one chapter per exit**, so you can dig into the one you actually need to ship.

## The six routes at a glance

| Route | What you get | Best at | Native modules |
|---|---|---|---|
| [`tish run`](/tish-deep/26a-tish-run) | Tree-walking interpreter or in-process bytecode VM | Dev loop, scripts, REPL, instant start | ✅ (Rust runtime is in-process) |
| [`tish build --native-backend rust`](/tish-deep/26b-native-rust) (default) | Native binary built by `cargo` from emitted Rust source | Production native deploys, full ecosystem | ✅ |
| [`tish build --native-backend cranelift`](/tish-deep/26c-native-cranelift) | Native binary that **embeds bytecode** + runs the VM | Pure-Tish programs; fast, cargo-free build | ❌ |
| [`tish build --native-backend llvm`](/tish-deep/26d-native-llvm) | Same embedded-bytecode + VM model, linked via clang | Same niche as Cranelift, with the LLVM toolchain | ❌ |
| [`tish build --target js`](/tish-deep/26e-target-js) | A single JavaScript bundle | Browsers, Node, Bun. **What this site uses.** | ❌ |
| [`tish build --target wasm`](/tish-deep/26f-target-wasm) | `.wasm` + glue `.js` for browsers | Sandboxed in-browser apps, Workers | ❌ |
| [`tish build --target wasi`](/tish-deep/26g-target-wasi) | One self-contained `.wasm` module | Edge runtimes, serverless, Wasmtime | ❌ |

## Two big mental groups

### Group 1 — runs *Rust* code that uses `tishlang_runtime`

`tish run` (interpreter and VM) and `tish build --native-backend rust` are the only routes where a **fully-featured Rust runtime** sits in the same process as your program. That is what unlocks **native modules** (`tish:fs`, `tish:http`, `tish:macos`, `tish:waterui`, `tish:shadertoy`, …) and **`cargo:` imports** of arbitrary Rust crates.

If your program touches anything Rust-shaped — AppKit windows, GPU shaders, Polars DataFrames, a niche crate from crates.io — you live in this group.

### Group 2 — runs Tish *bytecode* on a packaged VM

Cranelift, LLVM, WASM, and WASI all do roughly the same thing: pre-compile your source to bytecode, embed that blob inside a host (a native binary, a WASM module), and run the **same `tishlang_vm`** at start-up. This is **pure Tish** — no `tish:*` native imports, no `cargo:` crates — but the artifacts are tiny, sandboxable, and quick to build.

`tish build --target js` is its own animal: no Tish runtime ships with it; the host JavaScript engine *is* the runtime.

## How to pick

```text
Do you need a tish:* / cargo: native module?
├── yes → --native-backend rust  (only path that supports them)
└── no
    ├── shipping a CLI / server in containers? → --native-backend cranelift (or rust if you want primitive lowering)
    ├── shipping a website / browser app?      → --target js (this lesson site) OR --target wasm
    └── shipping to the edge / Workers / WASI? → --target wasi
```

## Direction of the project

Today, every backend (Rust included) operates on dynamically-tagged `Value`s — a Rust enum that wraps numbers, strings, objects, etc. Tish's roadmap is to **lower hot paths to machine primitives** where annotations and inference allow (`f64`, `Vec<f64>`, fixed-shape records) and to teach the bytecode pipeline to emit **real Cranelift IR** for AOT — not just embed bytecode.

Your `.tish` source doesn't change. The compiler quietly gets faster.

> See the canonical breakdown in [`LANGUAGE.md` → Native compile](https://github.com/tishlang/tish/blob/main/docs/LANGUAGE.md#native-compile-implementation-status), and the website's [Native Backend reference](https://tishlang.com/docs/reference/native-backend) and [WASM Targets reference](https://tishlang.com/docs/reference/wasm-targets) for the canonical CLI flags.

:::quiz{id=26-build-q1}
- prompt: Which build path is the **only** one that supports `tish:*` native modules and `cargo:` crate imports?
- options: ["--native-backend cranelift", "--native-backend rust", "--target wasm", "--target js"]
- answer: --native-backend rust
:::

:::quiz{id=26-build-q2}
- prompt: What does `--native-backend cranelift` actually compile?
- options: ["The whole program to native machine code", "A small object file holding embedded bytecode that the VM runs at start-up", "WebAssembly"]
- answer: A small object file holding embedded bytecode that the VM runs at start-up
:::

:::quiz{id=26-build-q3}
- prompt: When you `tish build --target js`, what runs the program?
- options: ["The bytecode VM, packaged into the bundle", "The host JavaScript engine (V8, JavaScriptCore, …)", "Cranelift"]
- answer: The host JavaScript engine (V8, JavaScriptCore, …)
:::

Up next: an in-depth tour of `tish run` itself — the dev loop you already use every day.
