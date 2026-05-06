---
title: PostgreSQL
summary: "@tishlang/pg — connect, prepare, queryPrepared, migrate (pg feature)."
---

Postgres I/O is **feature-gated** like `http` and `fs`. Ship a `tish` / app binary with the **`pg`** feature (or the default **`full`** bundle) so the `cargo:tish_pg` shims are linked.

## Install

```bash
npm install @tishlang/pg
```

```tish
import { connect, prepare, queryPrepared, close } from "@tishlang/pg"
```

## Handles, not objects

The sync VM API returns **numeric handles** for clients and prepared statements. **`queryPrepared`** returns a plain **array of row objects** on success — not a `{ rows, rowCount, fields }` wrapper (that shape exists in the async Rust API only).

Failure is always an object shaped like **`{ ok: false, error: "…" }`** so you can branch without `try`/`catch`.

## Minimal query

```tish
const client = connect(process.env.DATABASE_URL)
if (typeof client === "object") {
  console.error("connect failed", client.error)
  process.exit(1)
}

const stmt = prepare(client, "SELECT 1 AS one")
const rows = queryPrepared(client, stmt, [])
console.log(rows[0].one)

close(client)
```

## Migrations

`migrate(client, "./migrations")` applies sorted `*.sql` files once each, tracked in `_tish_pg_migrations`. See the [@tishlang/pg module](/modules/tish-pg/03-migrations) on **tish-learn** for file naming and promotion from browser-only storage.

## See also

- [Feature flags](/tish-deep/18-feature-flags) — how capabilities are gated.
- [Cargo imports](/tish-deep/20-cargo-imports) — how `cargo:tish_pg` maps into Rust.
