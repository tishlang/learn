---
title: "tish build — native (llvm)"
summary: Same embedded-bytecode + VM model as Cranelift, but linked through clang.
---

`tish build --native-backend llvm` is the **second** native exit that follows the **embedded-bytecode + VM** pattern. Cranelift uses its own pure-Rust object file builder; LLVM uses the system **`clang`** linker plus a tiny IR shim. The two paths produce nearly identical binaries — your program runs as bytecode on `tishlang_vm` either way.

## Why have both?

Cranelift and LLVM cover the same language subset and produce the same throughput, but they're useful in different shops:

| | Cranelift | LLVM |
|---|---|---|
| Toolchain dependency | None beyond `tish` itself | A working **`clang`** install |
| Build speed | Fastest of all native paths | Slower — clang invocation, possible LTO pass |
| Existing CI infra | Best when you're toolchain-free | Best if your team already deploys clang/LLVM artifacts |
| Future AOT lowering | First-class roadmap target | Not the primary research path |

Both share the runtime crate `tish_cranelift_runtime` (it just hosts `tishlang_vm`; the name is historic). The difference is **how the embedded blob and runtime are stitched into a binary**.

## What it actually does

```text
.tish source ─► tishlang_compile ─► bytecode blob
                                          │
                                          ▼
[tishlang_llvm] emit a small bitcode/object file holding the blob
                                          │
                                          ▼
[clang]  link blob + tishlang_vm runtime ─► native binary
                                          │
                                          ▼
At run time the binary calls tishlang_vm.run(embedded_blob) and exits.
```

```bash
tish build main.tish -o app --native-backend llvm
./app
```

## Required tooling

- **A `clang` binary on `$PATH`** (any LLVM-supported version). On macOS, `xcode-select --install` provides it; on Linux, your distro's `clang` package; on Windows, the LLVM installer.
- **No `cargo` is needed** to consume it (you still need it to build `tish` itself if you're not installing the published binary).

## What you give up — same as Cranelift

The LLVM backend runs the **same** `tishlang_vm`, so the language subset matches Cranelift exactly:

| Feature | Status |
|---|---|
| Built-in `tish:fs`, `tish:http`, `tish:process` | ✅ when the feature is linked in |
| External `tish:*` modules (`tish:macos`, `tish:waterui`, …) | ❌ |
| `cargo:crate` imports | ❌ |
| `@scope/pkg` native packages | ❌ |
| Destructuring in function **parameters** | ❌ |
| Everything else in the language | ✅ |

If you need any of the ❌ items, use `--native-backend rust`.

## When to use it

- Your build/release pipeline **already standardizes on clang/LLVM** for other languages and you want one toolchain.
- You want the **portability of WASI/Cranelift** (pure-Tish bytecode) but a **native-architecture** binary on a target where Cranelift's object emitter doesn't yet support what you need.
- You're producing **debug-friendly binaries** and want LLVM's debug-info format for use with LLDB/GDB.

## When **not** to use it

- **You don't already have clang in your toolchain.** Cranelift gives you the same artifact with zero extra deps.
- **You want native modules.** Use `--native-backend rust`.
- **You want raw build speed.** Cranelift wins.

## Throughput

Same as Cranelift (and as `tish run --backend vm`): VM-class. The LLVM bytecode-→-machine-code path for AOT lowering is **not yet wired up**; until it is, this backend buys you toolchain interop, not raw speed.

## Cross-platform notes

`clang` can target other architectures with `--target=` triples. The Tish toolchain doesn't currently surface those — for cross compiles your best options are `--native-backend rust` (with a Rust cross-target) or `--target wasi` (one `.wasm` for everything).

> Canonical reference: [tishlang.com — Native Backend](https://tishlang.com/docs/reference/native-backend).
> Implementation crates: `tishlang_llvm`, `tish_cranelift_runtime`, `tishlang_vm`. See [`LANGUAGE.md` → Native compile](https://github.com/tishlang/tish/blob/main/docs/LANGUAGE.md#native-compile-implementation-status).

:::quiz{id=26d-llvm-q1}
- prompt: What runs your program inside an `--native-backend llvm` binary?
- options: ["LLVM-compiled native machine code lowered from your bytecode", "The same `tishlang_vm` that runs in `tish run --backend vm`", "JavaScript via QuickJS"]
- answer: The same `tishlang_vm` that runs in `tish run --backend vm`
:::

:::quiz{id=26d-llvm-q2}
- prompt: When does picking `--native-backend llvm` over `--native-backend cranelift` make sense?
- options: ["When you need native modules", "When clang is already part of your release toolchain and you want to use it", "When you want JS-engine JIT speed"]
- answer: When clang is already part of your release toolchain and you want to use it
:::

Next: a totally different exit — `tish build --target js`, which is what this lesson site is built with.
