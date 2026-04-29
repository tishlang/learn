---
title: "tish build --target js"
summary: Plain JavaScript bundles for browsers, Node, and Bun.
---

`tish build --target js` emits a single `.js` file. **No bytecode, no VM, no Tish runtime ships with it.** The JavaScript engine you run it on (V8, JavaScriptCore, SpiderMonkey, …) is the runtime — your program is just JS by the time it loads.

This is the path **`tish-learn` itself uses**: `tish build app/main.tish -o public/dist/learn.js --target js`. Everything you see in the browser right now started as `.tish` source.

## What it actually does

```text
.tish source ─► tishlang_compile (JS codegen) ─► .js bundle
                                                     │
                                                     ▼
                                          load in V8 / Node / Bun / browser
```

The codegen lowers the AST to readable JavaScript: arrows, `let` / `const`, normal arithmetic, real `new`. Module imports are flattened into one bundle (the codegen walks the import graph and inlines each `.tish` source file as a JS scope). There is **no `Value` enum** — numbers are JS numbers, strings are JS strings, objects are JS objects.

```bash
tish build hello.tish -o hello.js --target js
node hello.js          # runs in any Node 18+
bun hello.js           # or Bun
# or load it from <script type="module"> in the browser
```

For a project build (multiple files, package roots, dependencies), the bundler walks `package.json → tish.module` for each dependency just like Node ESM resolution.

## Why this exit is a big deal

- **Reaches every JS runtime.** Browsers, Node, Bun, Deno, Cloudflare Workers (when you don't want WASM), Lambda, Vercel, Netlify — anything that runs JS, runs your `.tish`.
- **Engine JIT.** V8 can specialize tight loops and call sites; on benchmarks where the JS path warms up, it's **the fastest exit** Tish has today.
- **No Rust toolchain needed for users or CI.** They run `node hello.js` and that's it.
- **Easy interop.** Tish-source npm packages (`lattish`, `tish-tailwind`, `tish-ide-panels`, …) work transparently. NPM packages written in JS work because the codegen emits ordinary `import` / `export`.

## What you give up

- **No `tish:*` native imports.** `tish:fs`, `tish:macos`, etc. don't exist in JS-land.
- **No `cargo:` imports.** Same reason.
- **`new`** lowers to the engine's real `new` — different semantics from VM/Rust paths if you ever depended on the VM's host-`construct` shim. (Idiomatic Tish rarely uses `new`.)
- **`async` / Promises** rely on the host engine's microtask queue, not on Tokio.

## Source maps

Pass `--source-map` to emit `<output>.js.map` and a `//# sourceMappingURL=…` comment. Browsers (Chrome, Safari, Firefox) and Node will then jump to the original `.tish` lines in their debuggers. Source maps disable bytecode-level optimizations for the build that produces them.

```bash
tish build src/main.tish -o dist/app.js --target js --source-map
```

## Module resolution

The codegen resolves imports the same way the rest of the Tish toolchain does:

- **Relative paths** — `import { foo } from "./util.tish"`.
- **Bare specifiers** — `import { Foo } from "lattish"` looks up `node_modules/lattish/package.json` → `tish.module` (or falls back to `main`).
- **Native modules** (`tish:fs`, `cargo:crate`) **error out at build time** because there's no JS-side equivalent in scope.

If you have a Tish package that needs to work in both browsers and native, gate the platform-specific imports:

```tish
let fs = null
if (typeof Deno !== "undefined") { /* wire web fs API */ }
else { fs = await import("tish:fs") }   // only on Rust paths
```

## What this site uses

Everything inside `tish-learn` is shipped this way:

```bash
tish build node_modules/lattish/src/Lattish.tish \
  -o public/dist/lattish-runtime.js --target js
tish build app/main.tish -o public/dist/learn.js --target js
tish build node_modules/tish-browser-server/src/sw_worker.tish \
  -o public/dist/tish-sw.js --target js
```

`lattish-runtime.js` is loaded by the iframe-based code preview when a `:::sandbox{kind=ide}` block runs your code in the browser. `learn.js` is the lesson UI itself. `tish-sw.js` is the in-browser service worker that powers `serve(port, handler)` from your Tish code without a real server.

## Bundle size

The JS path doesn't ship any Tish runtime — the size of your output is just the size of the **emitted** JavaScript. A minimal "console.log" is a few hundred bytes; the full `lattish` runtime is around 25 KB unminified.

## When to use it

- **Browsers, web UIs, anything in Node/Bun.**
- **Edge runtimes that run JS** (Workers, Vercel, Netlify Edge, Deno Deploy).
- **Distribution to JS-shaped consumers** — npm packages, drop-in scripts, electron apps.
- **Maximum throughput on hot loops** — once the engine's JIT warms up, you're at native-JS speed.

## When **not** to use it

- **You need `tish:*` or `cargo:` modules.** Use `--native-backend rust`.
- **You want a self-contained binary.** Use `--native-backend cranelift` or `--target wasi`.
- **You're targeting a sandboxed runtime that requires WASM** (e.g. Workers without the JS path enabled). Use `--target wasm` or `--target wasi`.

> Canonical reference: see [getting started → installation](https://tishlang.com/docs/getting-started/installation) and [LANGUAGE.md → Native compile](https://github.com/tishlang/tish/blob/main/docs/LANGUAGE.md#native-compile-implementation-status). The interpretation of `new` on this path is detailed in [LANGUAGE.md `new`](https://github.com/tishlang/tish/blob/main/docs/LANGUAGE.md) and [`vs-javascript`](https://tishlang.com/docs/language/vs-javascript).

:::quiz{id=26e-js-q1}
- prompt: What runs your program after `tish build --target js`?
- options: ["The bytecode VM, packaged into the bundle", "The host JavaScript engine (V8, JavaScriptCore, …)", "Cranelift"]
- answer: The host JavaScript engine (V8, JavaScriptCore, …)
:::

:::quiz{id=26e-js-q2}
- prompt: Your `.tish` file has `import { readFile } from "tish:fs"`. Will `tish build --target js` succeed?
- options: ["Yes — it lowers to a Node fs polyfill", "No — `tish:*` modules don't exist on the JS path; the build errors", "Yes, but only in Bun"]
- answer: No — `tish:*` modules don't exist on the JS path; the build errors
:::

Next: WebAssembly for browsers — the same VM that powers Cranelift, packaged for `<script>`.
