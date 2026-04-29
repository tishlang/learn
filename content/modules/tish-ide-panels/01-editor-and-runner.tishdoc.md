---
title: "tish-ide-panels — editor + runner"
summary: The Lattish components that power tish-playground and tish-learn.
---

**`tish-ide-panels`** is the package that gives any Tish project an IDE-shaped UI: editor, terminal, web preview, file browser, plus the helpers for compiling and running Tish in the browser. The same package powers the live `:::sandbox` and `:::exercise` widgets in this curriculum.

## What's exported

| Symbol | Use |
|---|---|
| `EditorPanel(apiRef, initialContent, filePath, onKeydown, editorConfig)` | Textarea + syntax-highlighted overlay + line numbers + undo/redo (⌘Z / ⇧⌘Z) + ⌘D duplicate + ⌘⇧K delete + ⌘/ comment toggle. |
| `TerminalPanel(apiRef)` | `<pre>` console output. `apiRef.current = { appendLine, clear }`. |
| `WebPreviewPanel(apiRef, stateRef)` | Iframe + console-message bridge for compiled JS output. |
| `FileBrowserPanel(paths, currentPath, onSelect)` | Click-to-select file list. |
| `MiniRunner({ initialCode, expected, onPass, apiRef })` | The beginner widget — editor + Run + diff strip. |
| `highlightToHtml(src, path)` | Tokenize Tish/JSX/CSS to HTML with `hl-*` classes. |
| `useGlobalKeydown({...})` | ⌘S / ⌘↵ / ⌘1-4 / Tab cycling for shells. |
| `useResize(bodyRef, layout, setLayout, save)` | Mouse-drag split layout. |
| `runVm(src, path, files)` | Sync VM run; returns captured stdout lines. |
| `compileToJsWithRuntime(src, path, files)` | Async; returns JS string ready for an iframe. |
| `runJsInIframe(src, path, files, css, previewApi, runId)` | Convenience: compile + inject into a `WebPreviewPanel`. |
| `runCompileAndExec({...})` | Full IDE run pattern (mode-switching, terminal + preview). |

## The MiniRunner pattern

Most beginner lessons use `MiniRunner`:

```tish
import { MiniRunner } from "tish-ide-panels"

<MiniRunner
  initialCode={"console.log(\"Hello\")"}
  expected={"Hello"}
  onPass={() => markComplete()}
/>
```

It renders an editor, a Run button, and a strip below. If `expected` is null, the strip just shows captured stdout. If `expected` is a string, stdout is normalized (line-ending and trailing-whitespace agnostic) and shown as a green "Correct!" or a side-by-side diff.

## Build a tiny REPL

Three panels — editor, terminal, run button — wired with `runVm`:

:::sandbox{kind=ide id=mod-panels-01}
import { createRoot, useRef, useState } from "lattish"
import { EditorPanel, TerminalPanel, runVm } from "tish-ide-panels"

const STARTER = "let xs = [3, 1, 4, 1, 5, 9]\nlet total = xs.reduce((s, x) => s + x, 0)\nconsole.log(total)\n"

fn ReplApp() {
  const editorApi = useRef(null)
  const termApi = useRef(null)
  const busyState = useState(false)
  const busy = busyState[0]
  const setBusy = busyState[1]

  fn run() {
    if (busy) { return }
    setBusy(true)
    if (termApi.current !== null) { termApi.current.clear() }
    const src = editorApi.current.getContent()
    try {
      const lines = runVm(src, "main.tish", null)
      let i = 0
      while (i < lines.length) {
        if (termApi.current !== null) { termApi.current.appendLine(lines[i]) }
        i = i + 1
      }
    } catch (e) {
      if (termApi.current !== null) { termApi.current.appendLine("Error: " + String(e)) }
    }
    setBusy(false)
  }

  return <div class="pg-root">
    <header class="pg-header">
      <h1 class="pg-title">{"Tiny Tish REPL"}</h1>
      <button class="pg-run" onclick={run} disabled={busy}>{busy ? "Running…" : "Run"}</button>
    </header>
    <div class="pg-body">
      <div class="pg-col pg-col-left">
        <div class="pg-panel pg-panel-editor">
          {EditorPanel(editorApi, STARTER, "main.tish", null, null)}
        </div>
      </div>
      <div class="pg-col pg-col-right">
        <div class="pg-panel pg-panel-terminal">
          {TerminalPanel(termApi)}
        </div>
      </div>
    </div>
  </div>
}

createRoot(document.body).render(ReplApp)
:::

40-some lines and you have a working REPL with syntax highlighting and a real Tish VM. Add a `WebPreviewPanel` plus `compileToJsWithRuntime` and you have `tish-playground`.

## Host requirements

The runtime helpers need three globals on the host page:

- `window.__tishCompileToBytecodeWithImports(path, filesJson) -> base64`
- `window.__tishCompileToJsWithImports(path, filesJson) -> string`
- `window.__tishVmRunCaptured(bytes) -> string[]`
- `window.__tishDecodeB64(b64) -> Uint8Array`

These come from initializing the wasm-bindgen ESMs (`tish_compiler.js`, `tish_vm.js`) once at boot. See [`tish-learn/public/index.html`](/Users/a_/Projects/tish/tish-learn/public/index.html) for the canonical setup.

For iframe-based JS preview, also serve `/dist/lattish-runtime.js` (the result of `tish build` on the Lattish source).

:::quiz{id=mod-panels-01-q1}
- prompt: What does runVm return?
- options: ["A Promise of the result", "An array of captured stdout lines (sync)", "An iframe element"]
- answer: An array of captured stdout lines (sync)
:::

That's the package end-to-end. `tish-playground`, `tish-learn`, and any lesson sandbox you've used have been a re-skin of these few primitives.
