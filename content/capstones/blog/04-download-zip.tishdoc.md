---
title: "C3 — Blog: Download as a real zip"
summary: A pure-Tish minimal store-zip writer + browser download.
---

Browsers don't ship with a zip writer, so we write a tiny one. The format is documented; for the "store" method (no compression) it's:

- Per file: a 30-byte local header + filename + content.
- Then a "central directory" listing each file.
- Finally an "end of central directory" record.

That's a real, openable `.zip`.

## The writer (store mode, ~120 lines)

```tish
// CRC-32 lookup table (computed once)
let CRC_TABLE = null
fn buildCrcTable() {
  const t = []
  let n = 0
  while (n < 256) {
    let c = n
    let k = 0
    while (k < 8) {
      c = (c & 1) === 1 ? (3988292384 ^ (c >>> 1)) : (c >>> 1)
      k = k + 1
    }
    t.push(c)
    n = n + 1
  }
  return t
}

fn crc32(bytes) {
  if (CRC_TABLE === null) { CRC_TABLE = buildCrcTable() }
  let crc = 0xFFFFFFFF
  let i = 0
  while (i < bytes.length) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xFF]
    i = i + 1
  }
  return crc ^ 0xFFFFFFFF
}
```

The full writer also needs **local file headers** (one per file), a **central directory** (one entry per file describing its name + CRC + offset), and an **end-of-central-directory** record. Each part is just a fixed-layout struct of little-endian `u16` / `u32` fields — no parsing, no recursion. The whole thing fits in ~120 lines.

A complete implementation ships as the **`tish-zip-writer`** package in this monorepo (`tish-zip-writer/src/index.tish`, ~120 lines, fully commented byte-by-byte). Just import it:

```tish
import { writeZip, downloadZip } from "tish-zip-writer"

// One-call helper: build the .zip and trigger a browser download.
downloadZip("blog.zip", files)   // files: [{path, content}, …]

// Or build the Blob yourself and wire it to your own UI:
const blob = writeZip(files)
const url = URL.createObjectURL(blob)
const a = document.createElement("a")
a.href = url
a.download = "blog.zip"
a.click()
URL.revokeObjectURL(url)
```

`content` may be a `string` (UTF-8 encoded automatically) or a `Uint8Array` / `ArrayBuffer` for binary files.

## Try it

The full demo combines chapter 1 (read posts), 2 (markdown), 3 (templates), 4 (zip). Build each piece yourself; if you get stuck, peek at the writer's source for the bytes it produces, or open the resulting `.zip` with `unzip -l blog.zip` to verify the file list looks right.

## Take it real — host it

You have a `blog.zip`. Three options to put it on the internet:

1. **GitHub Pages**: unzip into a repo, settings → Pages → main branch.
2. **Netlify drop**: drag the unzipped folder onto netlify.com.
3. **Cloudflare Pages**: same as Netlify.

All free. None need a backend. You wrote a static site **in your browser**.

## Take it real — server-rendered alternative

If you'd rather render at request time:

```diff
- import { readFile, readDir } from "tish-browser-server"
+ import { readFile, readDir } from "fs"
- // (no serve in-browser)
+ import { serve } from "http"
+ serve(8080, async (req) => {
+   const html = await renderRequest(req.path)
+   return { status: 200, headers: { "Content-Type": "text/html" }, body: html }
+ })
```

Same render functions, real HTTP. Build with `tish build server.tish -o blog --feature http,fs`, deploy as a single binary.

:::quiz{id=cap-blog-04-q1}
- prompt: What's the simplest no-backend way to put a generated static site on the internet?
- options: ["Drop the unzipped folder on Netlify or GitHub Pages", "Run a server", "Email the files"]
- answer: Drop the unzipped folder on Netlify or GitHub Pages
:::
