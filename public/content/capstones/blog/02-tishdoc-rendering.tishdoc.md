---
title: "C3 — Blog: Markdown to HTML"
summary: Render with a small inline parser (or @tishlang/tishdoc-parse).
---

Markdown won the developer-blog wars for the same reason CSV refuses to die: humans can read it diff it and patch it in email threads. The catch is that browsers do not natively "understand" markdown—they want DOM or at least HTML strings.

This chapter is intentionally a **small compiler story**. We walk line-by-line through a hand-rolled `renderMarkdown`, talk about the pipeline from string to `innerHTML`, and emphasize where a production system would bolt on sanitization or swap in `tishdoc-parse`. The Playground is your REPL: bang on edge cases and watch the HTML breathe.

## What this chapter does

The blog uses the **same TishDoc subset** that powers this lesson site. The minimal parser ships with `tish-learn`'s app code; for a real generator you'd reach for `tishdoc-parse`. Here we **inline** a small `renderMarkdown(src) -> html string` so the chapter is self-contained: walk lines, emit headings / paragraphs / lists / fenced blocks, escape HTML in text nodes.

## Pipeline

1. Store markdown strings (from disk in ch.1; here a `SAMPLE` constant).
2. `renderMarkdown` returns one HTML string.
3. Preview pane uses `innerHTML` (trusted lesson content only — in your own app, sanitize if users can type arbitrary markdown).

The **Playground** at the bottom of this page is a live textarea + preview split.

## Tiny markdown render

Headings, paragraphs, lists, fenced code, inline `code` and `**bold**`. ~80 lines.

:::sandbox{kind=ide id=cap-blog-02}
import { createRoot, useState, useEffect } from "lattish"

fn escapeHtml(s) {
  return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;")
}

fn renderInline(text) {
  let out = ""
  let i = 0
  while (i < text.length) {
    const c = text.charAt(i)
    if (c === "`") {
      const end = text.indexOf("`", i + 1)
      if (end < 0) { out = out + escapeHtml(c); i = i + 1; continue }
      out = out + "<code>" + escapeHtml(text.substring(i + 1, end)) + "</code>"
      i = end + 1; continue
    }
    if (c === "*" && i + 1 < text.length && text.charAt(i + 1) === "*") {
      const end = text.indexOf("**", i + 2)
      if (end < 0) { out = out + escapeHtml(c); i = i + 1; continue }
      out = out + "<strong>" + renderInline(text.substring(i + 2, end)) + "</strong>"
      i = end + 2; continue
    }
    out = out + escapeHtml(c)
    i = i + 1
  }
  return out
}

fn renderMarkdown(src) {
  const lines = src.split("\n")
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.length === 0) { i = i + 1; continue }
    if (line.charAt(0) === "#") {
      let h = 0
      while (h < line.length && line.charAt(h) === "#") { h = h + 1 }
      if (h >= 1 && h <= 6 && line.charAt(h) === " ") {
        const text = line.substring(h + 1)
        blocks.push("<h" + h + ">" + renderInline(text) + "</h" + h + ">")
        i = i + 1; continue
      }
    }
    if (line.length >= 3 && line.substring(0, 3) === "```") {
      const buf = []
      i = i + 1
      while (i < lines.length && lines[i].substring(0, 3) !== "```") {
        buf.push(lines[i]); i = i + 1
      }
      i = i + 1
      blocks.push("<pre><code>" + escapeHtml(buf.join("\n")) + "</code></pre>")
      continue
    }
    if (line.length >= 2 && (line.substring(0, 2) === "- " || line.substring(0, 2) === "* ")) {
      const items = []
      while (i < lines.length && (lines[i].substring(0, 2) === "- " || lines[i].substring(0, 2) === "* ")) {
        items.push("<li>" + renderInline(lines[i].substring(2)) + "</li>")
        i = i + 1
      }
      blocks.push("<ul>" + items.join("") + "</ul>")
      continue
    }
    const buf = [line]
    i = i + 1
    while (i < lines.length && lines[i].length > 0 && lines[i].charAt(0) !== "#"
        && (lines[i].length < 2 || (lines[i].substring(0, 2) !== "- " && lines[i].substring(0, 2) !== "* "))
        && lines[i].substring(0, 3) !== "```") {
      buf.push(lines[i])
      i = i + 1
    }
    blocks.push("<p>" + renderInline(buf.join(" ")) + "</p>")
  }
  return blocks.join("\n")
}

const SAMPLE = "# A new post\n\nThis is **markdown** with `code` and:\n\n- bullets\n- and more bullets\n\nAnd a fenced block:\n\n```tish\nconsole.log(\"hi\")\n```\n"

fn Demo() {
  const srcState = useState(SAMPLE)
  const src = srcState[0]
  const setSrc = srcState[1]
  const html = renderMarkdown(src)
  return <div class="split">
    <textarea value={src} oninput={(e) => setSrc(e.target.value)} />
    <div class="preview" innerHTML={html} />
  </div>
}

createRoot(document.body).render(Demo)
:::

In the Playground, edit markdown on the left to see HTML on the right.

:::callout{kind=tip title="Real markdown libraries"}
A real generator would use `@tishlang/tishdoc-parse` or [`marked`](https://marked.js.org). Our 80 lines covers headings, paragraphs, lists, fenced code, inline bold/code — enough for a personal blog.
:::


:::quiz{id=cap-blog-02-q1}
- prompt: What's the trade-off in using a tiny custom markdown renderer vs a full library?
- options: ["No trade-off — custom is always better", "Custom is smaller and lets you control output, but skips edge cases (links, images, tables, blockquotes)", "Library is always smaller"]
- answer: Custom is smaller and lets you control output, but skips edge cases (links, images, tables, blockquotes)
:::
