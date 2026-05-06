---
title: "tish build — native (cranelift)"
summary: Bytecode + VM, packaged as a tiny native binary. No cargo, no Rust modules.
---

`tish build --native-backend cranelift` produces a self-contained native executable **without ever invoking `cargo`**. It does this with a clever trick: instead of compiling your program to machine code, it serializes the **bytecode** and embeds that blob into a binary that runs `tishlang_vm` at start-up.

The result: small binaries, **fast builds**, and a strict subset of the language (no `tish:*` external native modules, no `cargo:` crates).

## What it actually does

```text
.tish source ─► tishlang_compile ─► bytecode blob
                                          │
                                          ▼
[Cranelift object builder] writes a tiny .o file holding the blob
                                          │
                                          ▼
[platform linker]  links blob + tish_cranelift_runtime ─► native binary
                                          │
                                          ▼
At run time the binary calls tishlang_vm.run(embedded_blob) and exits.
```

Cranelift's job here is **only** to build the small object file holding the serialized bytecode and the symbols that `tish_cranelift_runtime` expects. It does **not** lower your bytecode to CLIF / machine instructions — the same VM that runs `tish run --backend vm` runs inside this binary.

```bash
tish build main.tish -o app --native-backend cranelift
./app
```

## Why this exists

The Rust backend is great, but it has two costs:

1. You need cargo + rustc on the build machine.
2. Cold builds take 30 seconds to a couple of minutes.

Cranelift skips both. A typical build is a few hundred milliseconds. The output binary is also smaller because it only links the VM, not the full `tishlang_runtime` glue used by the Rust backend's emitted source.

## What you give up

The Cranelift route is **pure Tish**. The runtime that ships inside the binary doesn't include the host bridges that `tishlang_runtime` does, so:

| Feature | Status on cranelift |
|---|---|
| Built-in `tish:fs`, `tish:http`, `tish:process` | ✅ when the corresponding feature is linked in |
| External `tish:*` modules (`tish:macos`, `tish:waterui`, …) | ❌ |
| `cargo:crate` imports | ❌ |
| `@scope/pkg` native packages | ❌ |
| Destructuring in function **parameters** | ❌ (destructure inside the body instead) |
| Everything else in the language | ✅ |

If your program tries to import an unsupported module, the build fails with a clear message:

```text
Cranelift backend does not support external native imports
(tish:…, cargo:…, @scope/pkg). Built-in tish:fs, tish:http,
tish:process are supported. Use --native-backend rust for
external modules.
```

## When to use it

- **Pure-Tish CLI tools, daemons, lambdas.**
- **CI builds where seconds matter.**
- **Distributing one binary** that doesn't need a Rust toolchain or Node runtime.
- **Reproducible artifacts** — Cranelift's output isn't subject to cargo's transitive dependency soup.

## When **not** to use it

- **You need `tish:macos`, `cargo:`, or any other external native binding.** Use `--native-backend rust`.
- **You expect numeric throughput on par with rustc.** Today, Cranelift output is "VM-class" — you get the same numbers as `tish run --backend vm`. The roadmap is to teach the bytecode pipeline to lower to **real CLIF** at compile time; that work is in progress.
- **You want primitive lowering for `Vec<f64>` style hot paths today.** The Rust backend gets that first.

## Throughput intuition

Until AOT lowering lands, performance order is roughly:

```text
tish run --backend interp   <   tish run --backend vm
                                ≈ tish build --native-backend cranelift
                                ≈ tish build --native-backend llvm
                                ≈ tish build --target wasi
                                <   tish build --native-backend rust
                                <   tish build --target js (after JIT warmup)
```

(JS is fastest on tight loops because V8 can specialize them. The native Rust backend wins on FFI-heavy code.)

## Required tooling

Cranelift is a Rust crate, so a recent **Rust toolchain** is still required to *build* tish itself — but not to consume it. Once `tish` is installed, no extra setup is needed for `--native-backend cranelift` builds.

## Cross-platform notes

Cranelift currently targets the platform you're building on. To produce a Linux binary on macOS, prefer **`--target wasi`** (single `.wasm` you can run anywhere with Wasmtime) or **`--native-backend rust`** with a Rust cross-target.

> Canonical reference: [tishlang.com — Native Backend](https://tishlang.com/docs/reference/native-backend).
> Implementation crates: `tish_cranelift_runtime`, `tishlang_vm`. See [`LANGUAGE.md` → Native compile](https://github.com/tishlang/tish/blob/main/docs/LANGUAGE.md#native-compile-implementation-status).

:::quiz{id=26c-cl-q1}
- prompt: What does Cranelift compile in `--native-backend cranelift`?
- options: ["The whole program to native machine code", "A small object file holding embedded bytecode that the VM runs at start-up", "WebAssembly"]
- answer: A small object file holding embedded bytecode that the VM runs at start-up
:::

:::quiz{id=26c-cl-q2}
- prompt: Your program imports `tish:macos`. Which native backend will the build succeed on?
- options: ["cranelift", "llvm", "rust"]
- answer: rust
:::

Next: LLVM — same model as Cranelift, different toolchain.
