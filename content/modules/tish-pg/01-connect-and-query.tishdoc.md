---
title: "@tishlang/pg — Connect and query"
summary: Install the package, open a client, run your first SELECT.
---

This module teaches the **scoped npm driver** [`@tishlang/pg`](https://www.npmjs.com/package/@tishlang/pg) that ships beside the Tish compiler. The heavy lifting lives in the Rust crate **`tishlang_pg`** (tokio-postgres + a small pool layer); you still write **only `.tish`**.

## Prerequisites

1. A running **PostgreSQL** instance you can reach with a URL like `postgres://user:pass@127.0.0.1:5432/mydb`.
2. A **`tish`** binary built with the **`pg`** feature (default **`full`** includes it). If you built from source without defaults: `cargo build -p tishlang --features pg`.
3. **Node 22+** (or your package manager of choice) so `npm install @tishlang/pg` resolves the package into `node_modules`.

## Install

```bash
npm install @tishlang/pg
```

In your entry file:

```tish
import { connect, prepare, queryPrepared, close } from "@tishlang/pg"
```

## Mental model: handles

Unlike node-postgres objects, the bytecode integration returns **opaque numeric handles** for pools/clients and prepared statements. Treat them like `fd` values — pass them back into the API, and call **`close(client)`** when you are done so the runtime drops the slot.

Success paths return plain data (numbers for handles, arrays for rows). Failure is always:

```tish
{ ok: false, error: "human readable message" }
```

So you branch with `typeof x === "object" && x.ok === false` instead of exceptions.

## First connection

```tish
const url = process.env.DATABASE_URL ?? "postgres://localhost:5432/postgres"
const client = connect(url)

if (typeof client === "object") {
  console.error("could not connect:", client.error)
  process.exit(1)
}

console.log("client handle", client)
```

`connect` also accepts `{ connectionString: url }` for parity with future pool options.

## First query

Use **`prepare`** once, then **`queryPrepared`** many times. Parameters are a **Tish array** of JSON-compatible values (`null`, booleans, numbers, strings, nested arrays/objects).

```tish
const stmt = prepare(client, "SELECT $1::int AS n, $2::text AS label")
if (typeof stmt === "object") {
  console.error("prepare failed", stmt.error)
  close(client)
  process.exit(1)
}

const rows = queryPrepared(client, stmt, [42, "demo"])
console.log(rows.length)     // 1
console.log(rows[0].n)       // 42
console.log(rows[0].label)   // "demo"

close(client)
```

### Row shape

Each row is a **plain object** whose keys are **column names** (as returned by Postgres). There is no `.rows` wrapper on this path — that exists in the async Rust API, not the sync VM shims.

## `perWorkerClient` — when to use it

If you later put this code behind **`serve()` from `http`** with **multiple worker processes** after `fork()`, each child must own its own TCP connection. Use **`perWorkerClient(connectionString)`** instead of **`connect`** so it is obvious in code review that you are not accidentally sharing a handle created before the fork.

For single-process scripts and most dev servers, **`connect`** is enough.

## Next

[02 — Prepared statements and pipelined batches](/modules/tish-pg/02-prepared-and-pipelines) shows **`queryAll`** and batch throughput patterns.
