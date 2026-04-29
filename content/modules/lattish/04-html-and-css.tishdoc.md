---
title: "Lattish + HTML + CSS"
summary: Choosing the right element, organizing styles, and the four ways to apply them.
---

JSX in Lattish maps almost 1:1 to HTML. Knowing **HTML** + **CSS** well is most of "knowing Lattish" — the framework is the easy part. This chapter is the practical guide.

:::callout{kind=tip title="vs React"}
React has its own opinions on attribute names (`className`, `htmlFor`, camelCase events) and a handful of synthetic-event quirks. Lattish stays closer to the platform: **HTML attribute names**, **lowercase event handlers**, no synthetic events. So this chapter — about HTML and CSS themselves — applies cleanly to React too, with that one renaming caveat.
:::

## HTML, briefly

The web was designed around documents. HTML elements are **semantic** — each name encodes meaning that browsers, screen readers, and search engines all use.

| Tag | When |
|---|---|
| `<header>` | Top of a page or section (logo, nav). |
| `<nav>` | A group of navigation links. |
| `<main>` | The primary content of the page (one per page). |
| `<section>` | A thematic group within `<main>`. |
| `<article>` | Self-contained content (blog post, comment). |
| `<aside>` | Tangential content (callout, sidebar). |
| `<footer>` | Bottom of a page or section. |
| `<h1>`–`<h6>` | Headings; `<h1>` is the page title, others nest by depth. |
| `<p>` | Paragraph of body text. |
| `<a href>` | Link. The `href` is required. |
| `<button>` | A clickable action. **Not** `<div onclick>`. |
| `<ul>` / `<ol>` / `<li>` | Unordered / ordered lists. |
| `<img src alt>` | Image. **`alt` is required** (use `alt=""` for decorative). |
| `<input>` / `<textarea>` / `<select>` | Form inputs. |
| `<label for="id">` | Label tied to an input by id. Click → focuses the input. |
| `<form>` | Group of inputs that submits together. |
| `<table>` / `<tr>` / `<td>` | Tabular data. **Not** for layout. |
| `<details>` / `<summary>` | A built-in collapsible disclosure. No JS needed. |

When in doubt, use `<div>` (block) or `<span>` (inline). They're semantically empty — they exist purely for layout.

:::callout{kind=tip title="Why semantic tags matter"}
A screen reader announces `<button>` as "button". It announces `<div onclick>` as "a div". The first is operable by keyboard, focusable, and reads correctly. The second requires you to add `role`, `tabindex`, keyboard handling, and ARIA — and you'll still get it slightly wrong. **Use the right element.**
:::

## CSS, briefly

CSS is "selector { property: value }" rules, applied to elements that match the selector.

```css
.card {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.card h1 {
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
}
```

**Selectors** match by tag (`p`), class (`.card`), id (`#main`), attribute (`[disabled]`), or combinator (`.card > h1`).

**The cascade**: when multiple rules match an element, the last declaration with the highest specificity wins. Specificity climbs id > class/attribute > tag.

**The box model**: every element is a box with `content` → `padding` → `border` → `margin`. `box-sizing: border-box` (set globally in our `base.css`) makes `width` include padding and border — much less surprising.

## Four ways to style in Lattish

### 1. External CSS (default for app shell)

Write a `.css` file, link it from `<head>`. Use class names in JSX. This is what `tish-learn`'s app shell does — `base.css` defines `.ll-header`, `.ll-card`, etc.

```tish
<header class="ll-header">{...}</header>
```

```css
.ll-header { padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--border); }
```

**Best for**: app-wide styles, shared visual language, themes.

### 2. Utility classes (`tish-tailwind`)

Compose styles from atomic utility classes — `flex`, `gap-2`, `p-4`, `bg-primary`.

```tish
<div class="flex gap-2 p-4 rounded-lg bg-surface">{children}</div>
```

The `tw()` helper merges class lists conditionally:

```tish
import { tw } from "tish-tailwind"

<button class={tw([
  "px-3 py-2 rounded-lg",
  props.disabled ? "opacity-50" : "hover:brightness-110"
])} />
```

**Best for**: prototypes, one-off layouts, anything that doesn't need a name.

### 3. Inline `style={...}`

When a value comes from JS state (a computed width, a dynamic color), use the `style` prop:

```tish
<div style={"width: " + (percent * 100) + "%"}>{...}</div>
```

Lattish accepts `style` as a string OR an object:

```tish
<div style={{ width: percent * 100 + "%", background: color }}>{...}</div>
```

**Best for**: dynamic per-element values that depend on state.

### 4. CSS variables

Define a few tokens in `:root`, reference them everywhere. Theme switching becomes "swap one variable":

```css
:root { --bg: oklch(0.11 0 0); --text: oklch(0.92 0 0); }
.theme-light { --bg: white; --text: black; }
body { background: var(--bg); color: var(--text); }
```

**Best for**: theming, colors, sizing tokens. **This is what `tish-learn` uses for dark/light mode.**

## A worked example

Here's a card component using all four techniques together:

:::sandbox{kind=ide id=mod-lattish-04}
import { createRoot, useState } from "lattish"

const STYLES = "<style>"
  + ":root { --primary: #a78bfa; --bg: #0f1114; --surface: #1a1d23; --text: #e6e9ed; --muted: #888; }"
  + "* { box-sizing: border-box; }"
  + "body { margin: 0; padding: 2rem; background: var(--bg); color: var(--text); font-family: system-ui; }"
  + ".card { background: var(--surface); border-radius: 12px; padding: 1.5rem; max-width: 360px; }"
  + ".card h1 { margin: 0 0 0.5rem 0; font-size: 1.25rem; }"
  + ".card p { margin: 0 0 1rem 0; color: var(--muted); }"
  + ".bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 0.75rem; }"
  + ".bar-fill { height: 100%; background: var(--primary); transition: width 0.3s; }"
  + ".btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; background: var(--primary); color: #0f1114; cursor: pointer; font-weight: 600; }"
  + ".btn:hover { filter: brightness(1.1); }"
  + ".btn-secondary { background: transparent; color: var(--text); border: 1px solid #333; }"
  + ".row { display: flex; gap: 0.5rem; }"
  + "</style>"

if (typeof document !== "undefined") {
  document.head.insertAdjacentHTML("beforeend", STYLES)
}

fn Progress() {
  const pState = useState(40)
  const p = pState[0]
  const setP = pState[1]
  const clamp = (n) => n < 0 ? 0 : (n > 100 ? 100 : n)

  return <div class="card">
    <h1>{"Today's progress"}</h1>
    <p>{"Click the buttons to see classes + variables + inline style + dynamic values working together."}</p>
    <div class="bar">
      <div class="bar-fill" style={"width: " + p + "%"} />
    </div>
    <div class="row">
      <button class="btn" onclick={() => setP(clamp(p + 10))}>{"+10"}</button>
      <button class="btn btn-secondary" onclick={() => setP(clamp(p - 10))}>{"-10"}</button>
      <button class="btn btn-secondary" onclick={() => setP(0)}>{"Reset"}</button>
    </div>
  </div>
}

createRoot(document.body).render(Progress)
:::

Notice:
- `<style>` injected once into `<head>`. Real apps use a linked `.css` file.
- Class names for static styles (`.card`, `.btn`).
- CSS variables (`--primary`, `--bg`) tie everything together.
- Inline `style={"width: " + p + "%"}` for the dynamic bar fill.
- Compound classes (`btn btn-secondary`) for variants.

## When to reach for which

- **Classes** when the rule applies to many elements or has no good inline form (`:hover`, `@media`, etc.).
- **Inline `style`** when the value is computed from state.
- **Variables** for theming and design tokens.
- **`tish-tailwind` utilities** when you don't want to name a one-off layout.

## Accessibility, briefly

- Always set `alt` on `<img>`. Empty `alt=""` for decorative images.
- Use `<button>` for actions, `<a href>` for navigation.
- Pair every `<input>` with a `<label>` (either wrapping or with `for=`/`id=`).
- Color contrast matters: ensure body text is at least 4.5:1 against its background.
- Don't override `:focus-visible` styles unless you're replacing them with something equally visible — keyboard users rely on focus rings.

:::callout{kind=tip title="Use the platform"}
The browser already does a lot for you. `<details>` is a click-to-expand, no JS. `<dialog>` is a native modal. `<input type=date>` is a date picker. Reach for these before reinventing.
:::

:::quiz{id=mod-lattish-04-q1}
- prompt: For an action that toggles a setting, which element should you use?
- options: ["<div onclick>", "<a href=\"#\">", "<button>"]
- answer: <button>
:::

:::quiz{id=mod-lattish-04-q2}
- prompt: When should you reach for inline `style` instead of a CSS class?
- options: ["When the value depends on JS state", "Always — it's faster", "Never"]
- answer: When the value depends on JS state
:::

That wraps the Lattish module.
