---
title: Ship it as a static site
summary: Generate HTML, package as zip, download.
---

You've built a notes app. Now turn it into a **real static site** you can drop on GitHub Pages.

## The pipeline

1. Read every note from the virtual fs.
2. Render each as static HTML.
3. Build an index page linking to them.
4. Package everything into a zip.
5. Trigger the browser's "save file" dialog.

The browser exposes `Blob` + `URL.createObjectURL` for #5; we'll write a tiny zip writer for #4.

## Capstone: download your notes site

:::sandbox{kind=ide id=39-export}
import { createRoot } from "lattish"
import { readDir, readFile } from "tish-browser-server"

const DIR = "/notes"

// A minimal "store" zip writer (no compression). Real zip writers exist but
// this is enough to demonstrate the pattern; the result is a valid .zip.
fn buildZip(files) {
  // For brevity we build a tiny tar-like archive with a manifest. Replace
  // this with a real zip library when you ship for real.
  let manifest = files.map((f) => f.path).join("\n")
  let body = "MANIFEST:\n" + manifest + "\n\n--\n"
  let i = 0
  while (i < files.length) {
    body = body + "==FILE: " + files[i].path + "\n" + files[i].content + "\n"
    i = i + 1
  }
  return body
}

async fn buildSite() {
  let names = []
  try { names = (await readDir(DIR)).filter((n) => n !== ".keep") } catch (e) { }
  let files = []
  let pages = []
  let i = 0
  while (i < names.length) {
    const text = await readFile(DIR + "/" + names[i])
    const html = "<!DOCTYPE html><html><head><title>" + names[i] + "</title></head><body><pre>" + text + "</pre></body></html>"
    files.push({ path: names[i] + ".html", content: html })
    pages.push("<li><a href=\"" + names[i] + ".html\">" + names[i] + "</a></li>")
    i = i + 1
  }
  files.push({ path: "index.html",
    content: "<!DOCTYPE html><html><head><title>Notes</title></head><body><h1>Notes</h1><ul>" + pages.join("") + "</ul></body></html>"
  })
  return files
}

async fn download() {
  const files = await buildSite()
  const blob = new Blob([buildZip(files)], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "my-notes-site.txt"
  a.click()
  URL.revokeObjectURL(url)
}

createRoot(document.body).render(() => <div class="export">
  <h2>{"Export your notes as a static site"}</h2>
  <p>{"Click below to render each note as HTML and download a single archive."}</p>
  <button onclick={download}>{"Build & download"}</button>
</div>)
:::

:::callout{kind=tip title="Real zips"}
A real `.zip` has a specific binary header layout. The minimal "store" archive above is a placeholder so you can see the full pipeline. The Capstones blog generator chapter ships a proper zip writer.
:::

:::quiz{id=39-export-q1}
- prompt: How does the browser trigger a file download?
- options: ["URL.createObjectURL + an `<a download>` click", "Direct disk access", "Server-side proxy"]
- answer: URL.createObjectURL + an `<a download>` click
:::
