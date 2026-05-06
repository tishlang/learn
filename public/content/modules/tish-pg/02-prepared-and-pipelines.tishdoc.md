---
title: "@tishlang/pg — Prepared statements and pipelined batches"
summary: Reuse plans, fire many queries, understand ordering guarantees.
---

In [01 — Connect and query](/modules/tish-pg/01-connect-and-query) you prepared a statement and called **`queryPrepared`** once. Real services prepare **once** at warm-up, then execute at QPS in the hot path.

## Prepare once, query many

```tish
import { connect, prepare, queryPrepared, close } from "@tishlang/pg"

const client = connect(process.env.DATABASE_URL)
const stmt = prepare(client, "SELECT $1::int AS v")

for (let i = 0; i < 1000; i = i + 1) {
  const rows = queryPrepared(client, stmt, [i])
  if (typeof rows === "object" && rows.ok === false) {
    console.error(rows.error)
    break
  }
  // rows is an array of row objects
}

close(client)
```

**Why prepare?** Postgres parses and plans the SQL text once. You pay parse cost up front, then each execution only binds parameters — lower CPU on both sides and less wire chatter than raw `query` helpers would add.

## `queryAll` — pipelined batches

Sometimes you have **many independent statements** that should run back-to-back with minimal round trips. **`queryAll(client, specs)`** accepts:

```tish
const specs = [
  [stmtHandleA, [1]],
  [stmtHandleB, ["x"]],
  [stmtHandleA, [2]],
]
const results = queryAll(client, specs)
```

Each entry is **`[statement_handle, params_array]`**. The driver issues them **concurrently on the wire** using tokio-postgres pipelining, while the **database still executes them serially** on that one session — you get parallelism in the client stack without opening multiple connections.

### Return shape

`results` is an **array of row-arrays**: `results[i]` matches `specs[i]`. On error you get `{ ok: false, error }` for the whole batch (the first failure aborts the batch semantics — treat it as a signal to retry or surface a 500).

```tish
const s1 = prepare(client, "SELECT $1::int AS a")
const s2 = prepare(client, "SELECT $1::text AS b")
const batch = queryAll(client, [
  [s1, [10]],
  [s2, ["hi"]],
])
console.log(batch[0][0].a)   // 10
console.log(batch[1][0].b)   // hi
```

## When **not** to pipeline

- **Session-local temp tables** or `SET` directives that must be visible to the next query — order matters; run sequential **`queryPrepared`** calls instead of **`queryAll`**.
- **Multi-statement transactions** you hand-roll with `BEGIN` — use explicit transaction helpers (future topic) or keep everything in one SQL file via migrations ([next chapter](/modules/tish-pg/03-migrations)).

## Combine with HTTP

Inside an `http` handler you are already on a worker thread with a synchronous `Value` return. The Postgres bridge detects whether a Tokio runtime is ambient and either **`block_on`** directly (fast path) or isolates work on a helper thread. That interplay is why **`perWorkerClient`** pairs naturally with prefork HTTP servers — see the [PostgreSQL feature doc](https://tishlang.com/docs/features/pg/) on tishlang.com for a full `serve` example.

## Next

[03 — Migrations](/modules/tish-pg/03-migrations) turns a directory of `.sql` files into repeatable schema upgrades.
