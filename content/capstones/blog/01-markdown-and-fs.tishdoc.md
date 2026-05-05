---
title: "C3 — Blog: Markdown + virtual fs"
summary: Read .md files from the in-browser disk.
---

:::project{title="Static blog generator" time="~60 min" difficulty="Intermediate" summary="Build a static-site generator that reads markdown from a virtual disk, renders it to HTML, and downloads the result as a deployable archive."}
You'll build:
- A virtual file system populated with starter posts.
- A markdown reader that lists posts sorted by date.
- A renderer (using `tishdoc-parse`) that produces clean HTML.
- A zip writer that downloads the whole site as one file.
:::

Static site generators romanticize the destination—clean URLs, fast loads, zero moving parts in production—while hand-waving where the `.md` files actually live while you author. In this capstone we refuse that hand-wave: **posts are plain files** addressed with pathnames, read through the same async `fs` API you would reach for in a real Tish server. The browser just happens to back that `fs` with IndexedDB so nobody needs to `git clone` anything to try the tutorial.

By the end of this first chapter you will have a credible "admin view": seed posts idempotently, list them with frontmatter-derived titles, and stare at the filenames that will eventually become slugs. Rendering and zipping come next; right now we rehearse the librarian's job.

## Why a virtual disk?

The static-site generator never touches your laptop filesystem. Instead it uses **`tish-browser-server`**’s async `fs` API: `mkdir`, `writeFile`, `readDir`, `readFile`. Data lives in IndexedDB, so posts survive reloads but stay inside the browser — same code shape you would use on a server with real paths later.

## Data flow

1. **Seed** — on first load, ensure `/posts` exists and write two starter `.md` files if missing.
2. **Index** — `readDir` → read each file → parse a tiny YAML-ish frontmatter (`title`, `date`) → sort newest first → render a list.

Frontmatter parsing in the playground is intentionally small (split on `---` lines); chapter 2 replaces the body half with real HTML rendering.

**Playground** (end of page) lists those posts after seeding.

## Seed the virtual disk

The IndexedDB-backed `fs` from `tish-browser-server` survives reload, so we seed it once and edit posts as files.

:::sandbox{kind=ide id=cap-blog-01}
import { createRoot, useState, useEffect } from "lattish"
import { writeFile, readFile, readDir, mkdir, fileExists } from "tish-browser-server"

const POSTS_DIR = "/posts"

const SEEDS = [
  { path: "/posts/2026-04-01-hello.md",
    body: "---\ntitle: Hello, blog\ndate: 2026-04-01\n---\n\nThis is the first post on my new blog.\n\n## A heading\n\nMarkdown supports **bold** and `code`.\n" },
  { path: "/posts/2026-04-15-shipping.md",
    body: "---\ntitle: Shipping is a feature\ndate: 2026-04-15\n---\n\nDone is better than perfect — for the first version.\n" }
]

async fn seed() {
  try { await mkdir(POSTS_DIR) } catch (e) { }
  let i = 0
  while (i < SEEDS.length) {
    if (!(await fileExists(SEEDS[i].path))) {
      await writeFile(SEEDS[i].path, SEEDS[i].body)
    }
    i = i + 1
  }
}

fn parseFrontmatter(text) {
  const lines = text.split("\n")
  let title = "Untitled"
  let date = ""
  let body = text
  if (lines.length > 0 && lines[0] === "---") {
    let i = 1
    while (i < lines.length && lines[i] !== "---") {
      const colon = lines[i].indexOf(":")
      if (colon > 0) {
        const key = lines[i].substring(0, colon)
        let val = lines[i].substring(colon + 1)
        while (val.length > 0 && val.charAt(0) === " ") { val = val.substring(1) }
        if (key === "title") { title = val }
        else if (key === "date") { date = val }
      }
      i = i + 1
    }
    body = lines.slice(i + 1).join("\n")
  }
  return { title: title, date: date, body: body }
}

fn BlogIndex() {
  const postsState = useState([])
  const posts = postsState[0]
  const setPosts = postsState[1]

  useEffect(() => {
    async fn load() {
      await seed()
      const names = (await readDir(POSTS_DIR)).filter((n) => n !== ".keep")
      const all = []
      let i = 0
      while (i < names.length) {
        const text = await readFile(POSTS_DIR + "/" + names[i])
        if (typeof text === "string") {
          const meta = parseFrontmatter(text)
          all.push({ name: names[i], title: meta.title, date: meta.date, body: meta.body })
        }
        i = i + 1
      }
      // sort newest first
      all.sort((a, b) => a.date < b.date ? 1 : -1)
      setPosts(all)
    }
    load()
  }, [])

  const rows = posts.map((p) => {
    return <li>
      <span class="post-date">{p.date}</span>
      <strong>{p.title}</strong>
      <small>{p.name}</small>
    </li>
  })

  return <div class="blog-admin">
    <h1>{"Posts"}</h1>
    <ul class="post-list">{rows}</ul>
  </div>
}

createRoot(document.body).render(BlogIndex)
:::

After opening the Playground you should see a sorted list of two posts (or whatever you've added since). Chapter 2 renders their bodies to HTML.


:::quiz{id=cap-blog-01-q1}
- prompt: Why seed the virtual disk on first load?
- options: ["For testing", "So a fresh-install reader has something to render without manually creating files", "Required by the API"]
- answer: So a fresh-install reader has something to render without manually creating files
:::
