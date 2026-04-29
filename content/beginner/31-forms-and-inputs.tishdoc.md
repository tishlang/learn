---
title: Forms and inputs
summary: Text inputs, controlled state, live updates.
---

The bread-and-butter web pattern: a text input bound to state.

```tish
import { createRoot, useState } from "lattish"

fn App() {
  const valueState = useState("")
  const value = valueState[0]
  const setValue = valueState[1]
  return <div>
    <input
      value={value}
      oninput={(e) => setValue(e.target.value)}
      placeholder="type something" />
    <p>{"You typed: " + value}</p>
  </div>
}

createRoot(document.body).render(App)
```

`oninput` fires every keystroke; `e.target.value` is the new text.

## Capstone: live BMI calculator

Two number inputs (height in cm, weight in kg). Print BMI live: `weight / ((height / 100) ** 2)`. Round to one decimal.

:::sandbox{kind=ide id=31-bmi}
import { createRoot, useState } from "lattish"

fn App() {
  const hState = useState(170)
  const h = hState[0]; const setH = hState[1]
  const wState = useState(65)
  const w = wState[0]; const setW = wState[1]

  const heightM = h / 100
  const bmi = w / (heightM * heightM)
  const rounded = Math.round(bmi * 10) / 10

  return <div class="card">
    <h2>{"BMI Calculator"}</h2>
    <label>{"Height (cm): "}
      <input value={h} oninput={(e) => setH(parseInt(e.target.value, 10))} />
    </label>
    <label>{"Weight (kg): "}
      <input value={w} oninput={(e) => setW(parseInt(e.target.value, 10))} />
    </label>
    <p class="result">{"BMI: " + rounded}</p>
  </div>
}

createRoot(document.body).render(App)
:::

:::callout{kind=tip title="parseInt strikes again"}
`e.target.value` is always a **string**. If you don't `parseInt` (or `parseFloat`), the math will silently do string concatenation instead of arithmetic.
:::

:::quiz{id=31-form-q1}
- prompt: Why call `parseInt(e.target.value)`?
- options: ["Inputs return strings; we need numbers for math", "It's optional, just stylistic", "It validates the input"]
- answer: Inputs return strings; we need numbers for math
:::
