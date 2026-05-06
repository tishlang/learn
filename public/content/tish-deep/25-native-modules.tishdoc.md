---
title: Native modules
summary: tish:waterui, tish:polars, tish:shadertoy.
---

When the embedder registers a native module via `Evaluator::with_modules`, you can `import` it.

## tish:polars

**`tish-polars`** ships a `Polars` value with DataFrame-style methods, useful for ETL and analytics.

```tish
import { Polars } from "tish:polars"

const df = Polars.read_csv("sales.csv")
const top = df.sort("revenue", true).head(10)
console.log(top.to_string())
```

Available in any embedder that registers it (e.g. the `tish-polars-run` binary).

## tish:waterui

**`tish-waterui`** is a cross-platform UI runtime. Same JSX hooks model as Lattish/macos.

```tish
import { version } from "tish:waterui"
console.log(version)
```

Also available as the npm-style specifier `@tishlang/waterui` when the embedder includes it.

## tish:shadertoy

**`tish-shadertoy`** gives you a winit + GL viewer for fragment shaders.

```tish
import { run, openPumpable, pump, setWindowTitle, reloadShader } from "tish:shadertoy"

// Blocking
run(`void mainImage(out vec4 c, in vec2 p) { c = vec4(p / iResolution.xy, 0, 1); }`)

// Script-driven loop
openPumpable(initialSrc, { onKeyDown: (e) => { if (e.key === "Escape") { /* … */ } } })
while (pump()) {
  setWindowTitle("frame " + frame)
  // schedule timers, fetch, etc., between frames
}
```

`onKeyDown` receives `{ key: string, repeat: bool }` — only **compiled** function values are invoked (the AST runner can't call back into Tish from winit).

## Registering your own

For a Rust crate to act as a native module, expose it as `tish_*_object()` returning a `Value` map. Pass it via `Evaluator::with_modules` when constructing the host. See `tish-shadertoy` for a small reference.

:::quiz{id=25-native-q1}
- prompt: When does `tish:shadertoy`'s `onKeyDown` actually fire?
- options: ["Always", "Only with compiled function values via tish build", "Only in the AST runner"]
- answer: Only with compiled function values via tish build
:::
