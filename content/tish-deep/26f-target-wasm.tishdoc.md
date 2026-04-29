---
title: "tish build --target wasm"
summary: WebAssembly for browsers. VM packaged with embedded bytecode + wasm-bindgen glue.
---

`tish build --target wasm` produces a **browser-ready WebAssembly module**. Like the Cranelift and LLVM native backends, it's the **embedded-bytecode + VM** model — the bytecode lives inside the `.wasm`, and `tishlang_vm` runs it. The difference is the host: this time the host is the browser, and the VM is compiled to `wasm32-unknown-unknown`.

## What it actually produces

Three files (the `.html` is a tiny loader you'd typically replace with your own):

```text
{output}_bg.wasm    ← VM + embedded bytecode (the real artifact)
{output}.js         ← wasm-bindgen JS glue (loads the .wasm, exposes APIs)
{output}.html       ← minimal demo page (open via a local server for CORS)
```

## What it actually does

```text
.tish source ─► tishlang_compile ─► bytecode blob
                                          │
                                          ▼
[wasm-pack pipeline] embed blob into a wasm32 binary that links tishlang_vm
                                          │
                                          ▼
[wasm-bindgen]  generate JS glue that loads + calls into the wasm
```

```bash
tish build hello.tish -o app --target wasm
# -> app_bg.wasm, app.js, app.html
python3 -m http.server 8765
# Open http://localhost:8765/app.html
```

## Required tooling

- `rustup target add wasm32-unknown-unknown`
- `cargo install wasm-bindgen-cli` (needs to match the `wasm-bindgen` version used by Tish's own crates)

You don't need any of these to **consume** the resulting `.wasm`; you only need them on your build machine.

## How to embed it in your own page

The generated `.js` exports an `init()` function. Wire it up:

```html
<script type="module">
  import init, { run } from "./app.js"
  await init()
  run()  // calls your compiled Tish
</script>
```

The `tish-learn` site uses an in-house variant of this pipeline for the in-browser editor: see `public/dist/tish_vm.wasm` and the `__tishVmRunCaptured` hook in `public/index.html`. That's the same shape as `--target wasm` — just driven by the playground's own loader rather than the default `_bg.wasm` glue.

## What you give up

The wasm target runs the **same `tishlang_vm`** Cranelift uses, so the same language subset applies:

| Feature | Status |
|---|---|
| Built-in `tish:fs`, `tish:http`, `tish:process` | Browser-shaped subset (some calls become fetch/postMessage shims) |
| External `tish:*` modules | ❌ |
| `cargo:crate` imports | ❌ |
| `@scope/pkg` native packages | ❌ |
| Destructuring in function **parameters** | ❌ |
| Everything else in the language | ✅ |

## When to use it

- **Browser apps that need to be sandboxed.** Wasm runs in its own memory space; a user's tab can host untrusted Tish without it touching the page DOM unless you let it.
- **Cloudflare Workers / edge runtimes** that prefer wasm bundles. (See `--target wasi` for runtimes that speak WASI directly.)
- **Multi-tab, multi-instance JS apps.** A wasm module is cheap to instantiate; you can run dozens in parallel without paying the JS-engine startup cost each time.
- **Determinism / reproducibility.** Wasm bytecode is identical across browsers; the JIT path can vary.

## When **not** to use it

- **Plain web pages with no isolation requirement.** `--target js` is smaller (no VM, no glue) and faster on hot loops thanks to JIT.
- **You need `tish:*` external modules.** Use `--native-backend rust` and write a small server, or expose the API via a JS wrapper around `--target js`.
- **You need top-of-the-line numeric throughput.** Until the bytecode-→-wasm-instructions AOT path is finished, wasm runs the same VM as Cranelift.

## How `tish-learn` uses wasm

The IDE sandbox in this site (the `:::sandbox{kind=ide}` blocks) compiles your code two ways:

1. **`tish_compiler.wasm`** — runs on the page; turns your `.tish` source into bytecode or JS without ever calling a server.
2. **`tish_vm.wasm`** — runs that bytecode in the same browser tab.

Together they make `--target wasm` into a **fully-in-browser dev loop** for Tish.

> Canonical reference: [tishlang.com — WASM Targets](https://tishlang.com/docs/reference/wasm-targets).
> Implementation crate: `tishlang_wasm_runtime`. See [`LANGUAGE.md` → Native compile](https://github.com/tishlang/tish/blob/main/docs/LANGUAGE.md#native-compile-implementation-status).

:::quiz{id=26f-wasm-q1}
- prompt: What is the actual program inside an `--target wasm` `.wasm` file?
- options: ["Your Tish source compiled directly to wasm instructions", "The `tishlang_vm`, plus your bytecode embedded as data, plus wasm-bindgen glue", "A pure JS bundle"]
- answer: The `tishlang_vm`, plus your bytecode embedded as data, plus wasm-bindgen glue
:::

:::quiz{id=26f-wasm-q2}
- prompt: When does `--target wasm` make more sense than `--target js`?
- options: ["When you want one-tab JS-engine speed on hot loops", "When you need browser-side sandboxing or wasm-only edge runtimes", "When you want to import `cargo:` crates"]
- answer: When you need browser-side sandboxing or wasm-only edge runtimes
:::

Next: the same wasm idea, but for the server — `--target wasi`.
