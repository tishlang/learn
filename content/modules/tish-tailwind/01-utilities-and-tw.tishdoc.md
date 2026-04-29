---
title: "tish-tailwind — utilities and tw()"
summary: Atomic CSS in pure Tish; the tw() class composer.
---

**`tish-tailwind`** is Tish's pure-Tish utility-CSS package. Same flavor as the npm `tailwindcss` CLI, but every line is Tish — **no PostCSS, no Autoprefixer, no Node build step**.

## What "utility CSS" means

Instead of:

```css
.card { padding: 1rem; border-radius: 8px; background: #1a1d23; }
```

```tish
<div class="card">{...}</div>
```

…you compose styles inline with single-purpose classes:

```tish
<div class="p-4 rounded-lg bg-surface">{...}</div>
```

`p-4` only sets padding. `rounded-lg` only sets `border-radius`. `bg-surface` only sets `background`. Each one is small and reusable.

## The `tw()` helper

For dynamic class lists, `tw()` joins parts skipping `null` / `false` / empty strings:

```tish
import { tw } from "tish-tailwind"

fn Button(props) {
  return <button class={tw([
    "px-3 py-2 rounded-lg font-medium",
    "bg-primary text-white",
    props.disabled ? "opacity-50 cursor-not-allowed" : "hover:brightness-110",
    props.fullWidth ? "w-full" : null,
    props.class
  ])}>
    {props.children}
  </button>
}
```

That `tw([...])` evaluates to `"px-3 py-2 rounded-lg font-medium bg-primary text-white hover:brightness-110 w-full custom"` (or whatever the conditions resolve to). Saves a half-dozen string concatenations.

## What's in the utility table

The package ships ~310 classes covering the most common ~80% of Tailwind:

- Layout: `flex`, `grid`, `block`, `hidden`, `absolute`, `relative`, `inset-0`
- Spacing: `p-{0..8}`, `px-{...}`, `py-{...}`, `m-{...}`, `gap-{0..8}`
- Sizing: `w-{...}`, `h-{...}`, `min-h-screen`, `max-w-{...}`
- Typography: `text-{xs..3xl}`, `font-{normal,medium,semibold,bold}`, `text-center`, `truncate`
- Color: `bg-{primary,surface,...}`, `text-{...}`, `border-{...}`
- Borders: `rounded`, `rounded-{sm..3xl,full}`, `border`, `border-{1..4}`
- Effects: `shadow`, `shadow-lg`, `opacity-{...}`
- Transitions: `transition`, `duration-{...}`, `ease-{...}`
- Transforms: `rotate-{...}`, `scale-{...}`, `translate-{...}`
- Pseudos: `hover:`, `focus:`, `disabled:`, `md:`, `lg:`

Need a class that's not in the table? Add one row to `src/utilities.tish`:

```tish
{ cls: "text-balance", css: `.text-balance { text-wrap: balance; }` },
```

## Try it

:::sandbox{kind=ide id=mod-tw-01}
import { createRoot, useState } from "lattish"
import { tw } from "tish-tailwind"

// Inject just enough utility CSS to make this demo render in the iframe.
// In a real app these styles come from public/utilities.css (generated).
const CSS = "<style>"
  + "* { box-sizing: border-box } body { margin: 0; padding: 2rem; background: #0f1114; color: #e6e9ed; font-family: system-ui }"
  + ".flex { display: flex } .gap-2 { gap: 0.5rem } .gap-4 { gap: 1rem }"
  + ".px-3 { padding-left: 0.75rem; padding-right: 0.75rem } .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem }"
  + ".rounded-lg { border-radius: 8px }"
  + ".bg-primary { background: #a78bfa; color: #0f1114 }"
  + ".bg-surface { background: #1a1d23 } .bg-error { background: #ef4444 }"
  + ".font-medium { font-weight: 500 }"
  + ".opacity-50 { opacity: 0.5 } .hover\\:brightness-110:hover { filter: brightness(1.1) }"
  + ".w-full { width: 100% }"
  + "button { border: none; cursor: pointer; font: inherit }"
  + "</style>"
if (typeof document !== "undefined") { document.head.insertAdjacentHTML("beforeend", CSS) }

fn Button(props) {
  return <button class={tw([
    "px-3 py-2 rounded-lg font-medium",
    props.kind === "danger" ? "bg-error" : "bg-primary",
    props.disabled ? "opacity-50" : "hover:brightness-110",
    props.fullWidth ? "w-full" : null
  ])} disabled={props.disabled} onclick={props.onclick}>
    {props.children}
  </button>
}

fn App() {
  const sentState = useState(0)
  const sent = sentState[0]
  const setSent = sentState[1]
  return <div class="flex gap-4">
    <Button onclick={() => setSent(sent + 1)}>{"Send (" + sent + ")"}</Button>
    <Button kind="danger">{"Delete"}</Button>
    <Button disabled={true}>{"Disabled"}</Button>
  </div>
}

createRoot(document.body).render(App)
:::

`tw()` is just a helper — it returns a plain string. The styling magic is in the utility CSS. You can use plain string concatenation for `class` if `tw()` feels heavy.

:::quiz{id=mod-tw-01-q1}
- prompt: What does `tw(["a", null, false, "b"])` return?
- options: ["\"a null false b\"", "\"a b\"", "\"a\""]
- answer: "a b"
:::

Next: how the build pipeline scans your code and emits only the classes you used.
