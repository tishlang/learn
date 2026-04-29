---
title: "Lattish — JSX and the h runtime"
summary: How JSX in Tish becomes a tree of vnodes.
---

[Lattish](https://lattish.com/docs) is Tish's JSX runtime. It's React-shaped: hooks, function components, virtual-DOM diffing, no `class` keyword. About 800 lines of Tish total.

> **Coming from React?** [Read the cheat-sheet first](/modules/lattish/00-from-react). This chapter starts from zero.

## The shape of JSX in Tish

```tish
import { createRoot, useState } from "lattish"

fn Hello(props) {
  return <div class="card">
    <h1>{"Hello, " + props.name}</h1>
    <p>{"Welcome."}</p>
  </div>
}

createRoot(document.body).render(() => <Hello name="Ada" />)
```

The compiler lowers JSX to `h(tag, props, children)` calls:

```tish
fn Hello(props) {
  return h("div", { class: "card" }, [
    h("h1", null, ["Hello, " + props.name]),
    h("p", null, ["Welcome."])
  ])
}
```

Both forms compile to the same JS. JSX is just nicer to read.

:::callout{kind=tip title="vs React"}
React's equivalent is `React.createElement(tag, props, ...children)`. Same shape, different name. Lattish uses the shorter `h` (the same function name [Preact](https://preactjs.com), [Mithril](https://mithril.js.org), [hyperscript](https://github.com/hyperhype/hyperscript), and many other tiny VDOM libraries use). No `JSX.IntrinsicElements`, no auto-imported runtime — just one function.
:::

## What `h` does

For a string tag (`"div"`, `"h1"`), `h` returns a vnode: `{ tag, props, children, _el: null }`. For a function tag (a component), `h` **calls the component immediately** with merged props (children become `props.children`) and returns the component's vnode.

```tish
fn Card(props) {
  return <div class="card">{props.children}</div>
}

let tree = <Card><h1>{"Hi"}</h1></Card>
// equivalent to:
//   h(Card, null, [h("h1", null, ["Hi"])])
// which is equivalent to:
//   Card({ children: [<h1>{"Hi"}</h1>] })
```

The component is a plain function. There's no class, no `this`.

## Fragments

When you need to return multiple siblings without a wrapper element:

```tish
import { Fragment } from "lattish"

fn TwoThings() {
  return <Fragment>
    <h1>{"First"}</h1>
    <p>{"Second"}</p>
  </Fragment>
}
```

`Fragment` is a `Symbol`. The reconciler sees it and inlines the children into the parent.

## Try it

:::sandbox{kind=ide id=mod-lattish-01}
import { createRoot } from "lattish"

fn Greeting(props) {
  return <div class="card">
    <h1>{"Hello, " + props.name + "!"}</h1>
    <p>{"From Lattish."}</p>
  </div>
}

fn App() {
  return <div>
    <Greeting name="Ada" />
    <Greeting name="Grace" />
    <Greeting name="Linus" />
  </div>
}

createRoot(document.body).render(App)
:::

Three independent `<Greeting>` instances. Each call gets its own props.

## What you can put inside `{ ... }`

Any Tish expression: a string, a number, a variable, a method call, a function call, JSX. Conditionals work via the ternary `? :`:

```tish
<p>{isLoggedIn ? "Welcome back" : "Please sign in"}</p>
```

Loops: build an array first, then drop it in:

```tish
let items = ["apple", "banana", "cherry"]
let lis = items.map((x) => <li>{x}</li>)
return <ul>{lis}</ul>
```

`null` and empty arrays render nothing — useful for conditional sections:

```tish
{show ? <Panel /> : null}
```

## What you cannot put

JSX in Tish doesn't support:

- **Spread props** (`<X {...props} />`) — pass props explicitly.
- **JSX in attribute values** (`<X title={<b>...</b>} />`) — render to a string first.
- **Comments inside JSX** (`{/* ... */}`) — write them above the line.
- **`<></>` short fragment syntax** — use `<Fragment>...</Fragment>`.

The grammar is the JS-shaped subset that's easy to lower to `h()`.

:::callout{kind=tip title="vs React: attribute names"}
React uses camelCase (`className`, `onClick`, `onChange`, `tabIndex`). **Lattish uses HTML lowercase** (`class`, `onclick`, `onchange`, `tabindex`).

Why: Lattish's JSX lowers directly to `setAttribute` and DOM event names, no synthetic event normalization. The names match the browser. If you copy a React snippet over, you'll need to lowercase the event handlers and rename `className` → `class`.
:::

:::callout{kind=tip title="Why no spread"}
Spread is mostly used to forward unknown props. In a small Tish app, you almost always know what props you're passing. Forward them explicitly: `<X foo={foo} bar={bar} />`. The lack of spread is what keeps the JSX lowering trivial.
:::

:::quiz{id=mod-lattish-01-q1}
- prompt: What does `<Card title="Hi" />` lower to?
- options: ["Card({ title: \"Hi\" })", "h(Card, { title: \"Hi\" }, [])", "new Card(\"Hi\")"]
- answer: h(Card, { title: "Hi" }, [])
:::

Next: state and refs.
