---
title: Native macOS UI
summary: tish:macos — App, windows, sidebar, ZStack, GroupedTable, VisualEffect.
---

`tish:macos` registers an AppKit-backed native module. Available when the embedder uses the `tish-macos` package (typically the `tish-macos-run` host binary). **This chapter is code-walkthrough**: the in-browser lessons can't run AppKit, but the patterns are central to shipping desktop apps.

## Hello App

```tish
import { macos } from "tish:macos"
import { createRoot, useState } from "tish:macos"

fn App() {
  const titleState = useState("Hello")
  return <window>
    <toolbar>{titleState[0]}</toolbar>
    <text>{"This window is rendered by AppKit."}</text>
  </window>
}

macos.run(App)
```

`macos.run(App, options?)` boots the event loop. The first vnode chooses the window shell (default content window, or `<sidebar_window>` for `NSSplitViewController`).

## Sidebar window

```tish
<sidebar_window>
  <pane>
    <list><!-- sidebar items --></list>
  </pane>
  <pane>
    <text>{"Detail content"}</text>
  </pane>
</sidebar_window>
```

Exactly two `<pane>` children — first is sidebar, second is detail. Whitespace-only JSX text between them is ignored.

Lifecycle hooks (compiled-only): `onOpen`, `onClose`, `onMinimize`, `onMaximize`. Toolbar chrome: `sidebarToolbarToggle`, `sidebarTrackingSeparator` (default `true`).

## ZStack and GroupedTable

`<ZStack>` overlays children in source order; first child gets `height="fill"` by default.

`<GroupedTable>` is a flipped scroll view of `<section>` children, each with a `title` and row content. `vibrantSectionHeaders` (default `true`) controls vibrancy. The host detects a `ZStack` containing a `GroupedTable` + `VisualEffect` two-child pattern and re-parents the visual effect into the scroll view so vibrancy blurs the rows.

## VisualEffect

Maps to `NSVisualEffectView`:

```tish
<visual_effect material="sidebar" blendingMode="behindWindow" state="active" />
```

Numeric `material` values match `NSVisualEffectMaterial` raw values; semantic strings (`sidebar`, `header`, `popover`, `menu`, `sheet`, `underPage`, …) are friendlier.

## Multiple windows / processes

- `macos.openWindow(App, options?)` — second window, same process.
- `macos.spawnPeer()` — second process, separate `NSApplication`. Coordinate with `postSessionMessage` / `onSessionMessage` and `TISH_MACOS_SESSION_ID`.

The hooks `useState` / `useMemo` from `tish:macos` are the same shape as Lattish — render model is component-rerun-on-state-change.

:::callout{kind=note title="Why no in-browser exercise?"}
`tish:macos` calls AppKit directly — there's no way to run that in a browser tab. The Tish-deep curriculum chapter is intentionally documentation-style. To actually ship a `.app`, follow the **Native UI hooks** section of [`LANGUAGE.md`](https://github.com/tishlang/tish/blob/main/docs/LANGUAGE.md) and the `tish-macos-run` README.
:::

:::quiz{id=24-macos-q1}
- prompt: How many `<pane>` children does `<sidebar_window>` require?
- options: [1, 2, "any number"]
- answer: 2
:::
