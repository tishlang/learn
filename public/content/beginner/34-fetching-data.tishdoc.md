---
title: Fetching real data
summary: fetch, async/await, real APIs.
---

Real apps talk to **real servers**. `fetch` is how.

## Anatomy of a request

```tish
const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=37.77&longitude=-122.42&current=temperature_2m")
const data = await res.json()
console.log(data.current.temperature_2m)
```

Three steps:

1. `fetch(url)` returns a `Promise<Response>` — `await` it.
2. `res.json()` returns a `Promise<value>` — `await` it.
3. The result is a regular Tish object you can read.

## Capstone: weather widget

Build a UI that fetches the current temperature for San Francisco and displays it. Click "Refresh" to fetch again.

:::sandbox{kind=ide id=34-weather}
import { createRoot, useState, useEffect } from "lattish"

const URL = "https://api.open-meteo.com/v1/forecast?latitude=37.77&longitude=-122.42&current=temperature_2m"

fn WeatherApp() {
  const tempState = useState(null)
  const temp = tempState[0]
  const setTemp = tempState[1]
  const errState = useState(null)
  const err = errState[0]
  const setErr = errState[1]
  const loadingState = useState(false)
  const loading = loadingState[0]
  const setLoading = loadingState[1]

  async fn load() {
    setLoading(true); setErr(null)
    try {
      const res = await fetch(URL)
      const data = await res.json()
      setTemp(data.current.temperature_2m)
    } catch (e) {
      setErr(String(e))
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return <div class="card">
    <h2>{"San Francisco"}</h2>
    {loading ? <p>{"Loading…"}</p> : null}
    {err !== null ? <p class="err">{"Error: " + err}</p> : null}
    {temp !== null ? <p class="big">{temp + " °C"}</p> : null}
    <button onclick={load} disabled={loading}>{"Refresh"}</button>
  </div>
}

createRoot(document.body).render(WeatherApp)
:::

:::callout{kind=tip title="CORS"}
The Open-Meteo API allows browser requests from any origin. Many APIs don't — they require an "Access-Control-Allow-Origin" header. If you see CORS errors, the API isn't designed for direct browser use; you'd need to proxy through a server.
:::

:::quiz{id=34-fetch-q1}
- prompt: Why two awaits in `await (await fetch(url)).json()`?
- options: ["fetch returns a Promise<Response>; .json() returns a Promise<value> — both async", "It's a typo, only one is needed", "Performance optimization"]
- answer: fetch returns a Promise<Response>; .json() returns a Promise<value> — both async
:::
