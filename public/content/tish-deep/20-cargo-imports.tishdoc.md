---
title: Cargo imports
summary: Pulling Rust crates into Tish via `cargo:` specifiers.
---

When you build with the **Rust native backend** (`tish build --native-backend rust`, the default), you can call **Rust crates** directly:

```tish
import { to_string } from "cargo:tish_serde_json"

const json = to_string({ name: "Ada", age: 36 })
console.log(json)
```

## How it works

Two pieces:

1. **`package.json`** declares the dependency:
   ```json
   {
     "tish": {
       "rustDependencies": {
         "tish_serde_json": { "path": "../glue/tish_serde_json" }
       }
     }
   }
   ```
2. The glue crate exposes each imported name as **`pub fn name(args: &[Value]) -> Value`** using `tishlang_runtime::Value`.

## tishlang-cargo-bindgen

The phase-1 generator is **`tishlang-cargo-bindgen`**:

- Reads `tish.rustDependencies` from `package.json`.
- Reads the upstream crate + semver from the glue's `Cargo.toml` (or root `Cargo.toml`).
- Runs `cargo metadata`, scans `src/**/*.rs` with `syn`, classifies matching `pub fn` signatures, and writes the glue `Cargo.toml`.

Use **`--tishlang-runtime-path`** so the glue's `tishlang_runtime` matches `tish build`'s. Mixing crates.io `tishlang_runtime` with a workspace path causes conflicting `Value` types.

## Restrictions

- Tree-walking interpreter, bytecode VM, and `--target js`: **no `cargo:` imports** (use `tish:` npm-native modules there instead).
- Cranelift/LLVM native backends: **pure-Tish only** (the binary bundles bytecode + runs the VM; no external Rust calls).

## Phase 2 (planned)

`tish build` will run the bindgen step automatically — you'll just edit `package.json` and rebuild. Today it's a separate CLI step.

:::quiz{id=20-cargo-q1}
- prompt: When can you use `import { x } from "cargo:something"`?
- options: ["Always", "Only with --native-backend rust", "Only with --target wasm"]
- answer: Only with --native-backend rust
:::
