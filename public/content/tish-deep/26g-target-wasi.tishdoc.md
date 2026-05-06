---
title: "tish build --target wasi"
summary: One self-contained .wasm for Wasmtime, edge runtimes, serverless.
---

`tish build --target wasi` is the **server-side** sibling of `--target wasm`. It produces a **single `.wasm` file** that runs anywhere a [WASI](https://wasi.dev/) runtime exists: [Wasmtime](https://wasmtime.dev/), [Wasmer](https://wasmer.io/), Cloudflare Workers (the wasm path), Fastly Compute@Edge, [WasmEdge](https://wasmedge.org/), and so on.

No browser, no Node, no glue file. Just one binary you can `wasmtime ./app.wasm` from anywhere.

## What it actually produces

```text
app.wasm    ← VM + embedded bytecode + WASI shim (one file, ~1–2 MB)
```

That's it. No `.js`, no `.html`, no extra runtime install on the consumer side.

## What it actually does

```text
.tish source ─► tishlang_compile ─► bytecode blob
                                          │
                                          ▼
[wasm32-wasip1 build] embed blob into a wasm module that links tishlang_vm
                                          │
                                          ▼
At run time the host (Wasmtime / Wasmer / …) provides WASI syscalls
(args, env, stdin, stdout, fs, clock, …) which Tish's runtime routes
through to your program.
```

```bash
tish build hello.tish -o app --target wasi
wasmtime app.wasm                # any WASI runtime works
```

## Required tooling

- `rustup target add wasm32-wasip1` — the WASI sysroot.
- A WASI runtime to run the output. [Wasmtime](https://wasmtime.dev/) is the reference one and the one this curriculum recommends.

You only need both on the build machine. **Consumers** of the `.wasm` only need a WASI runtime. The `.wasm` itself is portable across operating systems, CPU architectures, and even non-x86 hardware (anywhere wasm runs).

## What you give up

Same constraints as the other VM-bytecode exits (Cranelift, LLVM, wasm):

| Feature | Status |
|---|---|
| Built-in `tish:fs`, `tish:http`, `tish:process` | ✅ when WASI exposes the corresponding capability (the host decides) |
| External `tish:*` modules | ❌ |
| `cargo:crate` imports | ❌ |
| `@scope/pkg` native packages | ❌ |
| Destructuring in function **parameters** | ❌ |
| Everything else in the language | ✅ |

WASI's network/HTTP support is **runtime-dependent**: Wasmtime ≥ 25 has WASI Preview 2 + `wasi:http`; older runtimes don't. If your program needs `fetch` or `serve`, check what your target host implements before betting on it.

## When to use it

- **Edge / serverless deploys** that prefer wasm over native binaries (Cloudflare Workers, Fastly, Fermyon, etc.).
- **Multi-arch deployment.** One `.wasm` runs on x86, arm64, and any future architecture without a re-build.
- **Plugins / extensions.** Embed Wasmtime in your own host application and load Tish modules as plugins. The sandboxing is enforced by the runtime, not by your code.
- **Reproducible CI artifacts.** Wasm bytecode is byte-stable; you don't have to re-pin a Linux glibc version every six months.

## When **not** to use it

- **You need `tish:macos`, `cargo:`**, or any other Rust-runtime-only feature. Use `--native-backend rust`.
- **You're targeting browsers.** Use `--target wasm` (browser-shaped wasm + glue) or `--target js` (smaller, faster on JIT-friendly loops).
- **You need numeric throughput on tight loops today.** WASI runs the same VM as Cranelift; performance is "VM-class" until the AOT lowering work lands.

## A complete example: a tiny CLI

```tish
import { argv, exit } from "process"

if (argv.length < 2) {
  console.log("usage: greet NAME")
  exit(1)
}

console.log("Hello, " + argv[1])
```

Build and ship one `.wasm`:

```bash
tish build greet.tish -o greet --target wasi --feature process
# Now anyone with wasmtime can run it:
wasmtime greet.wasm Ada
# → Hello, Ada
```

That's a 1–2 MB binary that runs on every OS and every CPU you care about, sandboxed by the WASI host.

## Edge runtimes that consume `.wasm`

Most modern edge platforms accept WASI-shaped wasm. The ones in widest use:

- **[Cloudflare Workers](https://developers.cloudflare.com/workers/runtime-apis/webassembly/)** — wasm modules embedded inside JS Worker scripts. Pair `--target wasi` output with a tiny JS shim, or ship as a [Workers wasm](https://developers.cloudflare.com/workers/wasm-apis/).
- **[Fastly Compute](https://www.fastly.com/products/edge-compute)** — first-party WASI host (Lucet, now Wasmtime).
- **[Fermyon Spin](https://www.fermyon.com/spin)** — WASI Preview 2 with `wasi:http`.
- **[wasmCloud](https://wasmcloud.com/)** — actor-style runtime built on Wasmtime.
- **Self-hosted Wasmtime** in your own daemon for plugin-style extensibility.

## How `tish-learn` uses WASI

It doesn't, directly — the lesson site uses `--target js` for the UI and `--target wasm` for the in-browser code execution. But if you wanted to run **your own** `.tish` programs inside the lessons without a browser sandbox, building them as `--target wasi` and shelling out to `wasmtime` is the simplest deploy story.

> Canonical reference: [tishlang.com — WASM Targets](https://tishlang.com/docs/reference/wasm-targets).
> Implementation crates: `tishlang_wasm_runtime`, `tishlang_vm`. See [`LANGUAGE.md` → Native compile](https://github.com/tishlang/tish/blob/main/docs/LANGUAGE.md#native-compile-implementation-status).

:::quiz{id=26g-wasi-q1}
- prompt: What is the main thing `--target wasi` produces?
- options: ["A `.wasm` plus a wasm-bindgen `.js` glue file", "One `.wasm` file containing the VM + your bytecode + a WASI shim", "A native binary with embedded bytecode"]
- answer: One `.wasm` file containing the VM + your bytecode + a WASI shim
:::

:::quiz{id=26g-wasi-q2}
- prompt: Where would a `--target wasi` `.wasm` typically run?
- options: ["Inside `<script type=\"module\">` directly in the browser", "Wasmtime, Wasmer, or an edge runtime that speaks WASI", "A `cargo install` step on the user's machine"]
- answer: Wasmtime, Wasmer, or an edge runtime that speaks WASI
:::

You've now seen every exit Tish offers. Up next: the rest of Part V — **tooling** (formatter, linter, LSP, REPL, VS Code) and **deploy** (zectre, Docker, single-binary releases).
