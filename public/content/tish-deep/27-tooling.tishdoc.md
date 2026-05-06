---
title: Tooling
summary: tish-fmt, tish-lint, tish-lsp, REPL, editor setup.
---

The toolchain ships with the language. Set up once, benefit forever.

## REPL

```bash
$ tish
tish 1.x — type :h for help
> let x = 21
> x * 2
42
> [1, 2, 3].reduce((s, x) => s + x, 0)
6
```

Multi-line input, tab completion, history (across sessions). Pipe stdin too:

```bash
echo 'console.log(1 + 1)' | tish
```

## tish-fmt

```bash
tish-fmt src/**/*.tish
```

Idempotent, opinionated. Set it up to run on save in your editor.

## tish-lint

```bash
tish-lint src/**/*.tish
```

Catches use-before-declare, unused imports, suspicious patterns. Phase 2 will surface type-checker diagnostics here too.

## tish-lsp

Language server protocol implementation. Powers VS Code, Neovim, Helix, anything that speaks LSP.

Capabilities:
- Go to definition (including ambient `// @tish-source` pragmas — set `TISHLANG_SOURCE_ROOT` to your `tish` checkout for stdlib jumps).
- Hover with type annotations.
- Symbol completion.
- Diagnostics from `tish-lint`.

## VS Code

Install the **Tish** extension from the marketplace. It bundles `tish-fmt` integration, syntax highlighting (TextMate grammar), and LSP wiring. In `settings.json`:

```json
{
  "[tish]": {
    "editor.formatOnSave": true,
    "editor.tabSize": 2
  },
  "tish.languageServer.tishlangSourceRoot": "/path/to/tish"
}
```

## Neovim

Use `nvim-lspconfig` with `tish-lsp`. A `tree-sitter-tish` grammar is in development for syntax highlighting in Treesitter-aware editors (Neovim, Helix, Zed).

## Exercise: configure VS Code, then "Go to definition" on `console.log`

After setup, hover `console.log` and hit your "Go to definition" key. With `tishlangSourceRoot` set, the LSP jumps to the Rust file backing it (`crates/tishlang_runtime/src/console.rs`).

:::quiz{id=27-tooling-q1}
- prompt: What does `tish-lsp` need to make stdlib "Go to definition" work?
- options: ["TISHLANG_SOURCE_ROOT pointing at a tish checkout", "Internet access", "A separate plugin"]
- answer: TISHLANG_SOURCE_ROOT pointing at a tish checkout
:::
