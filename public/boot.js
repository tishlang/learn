/**
 * tish-learn boot: wasm + compiler + main app (or sandbox-only bundle).
 * Prerendered pages include <meta name="ll-defer-wasm" content="1"/> so heavy
 * work starts after idle or first interaction.
 */
window.__tishDecodeB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))

const path = (location.pathname.replace(/\/$/, "") || "/")
const isSandbox = path === "/sandbox"

async function loadWasmAndCompiler() {
  const vmMod = await import("/dist/tish_vm.js")
  await vmMod.default()
  window.__tishVmRunCaptured = (chunk) => {
    const lines = []
    const orig = console.log
    console.log = (...args) => {
      lines.push(args.map(String).join(" "))
      orig.apply(console, args)
    }
    try {
      vmMod.run(chunk)
    } catch (e) {
      lines.push("Runtime: " + String(e))
    } finally {
      console.log = orig
    }
    return lines
  }

  const compilerMod = await import("/dist/tish_compiler.js")
  await compilerMod.default()
  window.__tishCompileToBytecode = compilerMod.compile_to_bytecode
  window.__tishCompileToJs = compilerMod.compile_to_js
  window.__tishCompileToBytecodeWithImports = compilerMod.compile_to_bytecode_with_imports
  window.__tishCompileToJsWithImports = compilerMod.compile_to_js_with_imports
}

async function loadApp() {
  await loadWasmAndCompiler()
  if (isSandbox) {
    await import("/dist/learn_sandbox.js")
  } else {
    await import("/dist/learn.js")
  }
}

const defer =
  typeof document !== "undefined" &&
  document.querySelector('meta[name="ll-defer-wasm"]')?.getAttribute("content") === "1"

let started = false
function startLoad() {
  if (started) return
  started = true
  loadApp().catch((e) => console.error("learn boot:", e))
}

if (defer && typeof requestIdleCallback === "function") {
  requestIdleCallback(() => startLoad(), { timeout: 2800 })
  window.addEventListener("pointerdown", () => startLoad(), { once: true, passive: true })
  window.addEventListener("keydown", () => startLoad(), { once: true })
} else {
  startLoad()
}
