---
title: "C3 — Blog: Templates and static pages"
summary: Wrap each post in a layout; build an index page.
---

Publishing used to mean FTPing `index.html`. Modern static workflows still end in HTML files—**you** just stopped writing them by hand. Wrapping each rendered post in a layout is the moment your generator graduates from "script" to "publisher": shared navigation, typography, feed links, and boring legal footers happen once, then every article inherits them.

We stay string-native on purpose. No JSX runtime in the output directory, no hydration mystery. You build an array of `{ path, content }`, each `content` already a full HTML document—complete with `<header>`, `<footer>`, and consistent CSS—then next chapter zips that tree so you can drag it onto any host that speaks HTTP.

## The template function

```tish
fn page(title, body) {
  return "<!DOCTYPE html><html lang=\"en\"><head>"
    + "<meta charset=\"utf-8\" />"
    + "<title>" + title + "</title>"
    + "<style>body{font:16px/1.6 system-ui;max-width:680px;margin:2rem auto;padding:0 1rem}"
    + "code,pre{font-family:ui-monospace,monospace} pre{background:#f4f4f4;padding:1rem;border-radius:6px}</style>"
    + "</head><body>"
    + "<header><a href=\"index.html\">← All posts</a></header>"
    + body
    + "<footer><hr><small>Built with tish-learn</small></footer>"
    + "</body></html>"
}
```

## Build all pages in memory

```tish
async fn buildSite(posts, renderMarkdown) {
  const out = []
  // Per-post pages.
  let i = 0
  while (i < posts.length) {
    const p = posts[i]
    const inner = "<article><h1>" + p.title + "</h1><time>" + p.date + "</time>"
                + renderMarkdown(p.body) + "</article>"
    const html = page(p.title, inner)
    const slug = p.name.replace(".md", ".html")
    out.push({ path: slug, content: html })
    i = i + 1
  }
  // Index page.
  const items = posts.map((p) => {
    const slug = p.name.replace(".md", ".html")
    return "<li><time>" + p.date + "</time> <a href=\"" + slug + "\">" + p.title + "</a></li>"
  }).join("")
  const indexInner = "<h1>My blog</h1><ul class=\"index\">" + items + "</ul>"
  out.push({ path: "index.html", content: page("My blog", indexInner) })
  return out
}
```

The result: a list of `{path, content}` pairs. The next chapter packages them into a download.

:::callout{kind=tip title="Generated, not magic"}
Each page is a string. There's no rendering framework or hydration. Open any output file in a plain browser and it works — that's the appeal of static.
:::


:::quiz{id=cap-blog-03-q1}
- prompt: Why pre-render to static HTML rather than render in-browser at view time?
- options: ["Better SEO; works without JS; cheaper hosting; faster initial paint", "It's required", "It's the only way Tish supports"]
- answer: Better SEO; works without JS; cheaper hosting; faster initial paint
:::
