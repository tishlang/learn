---
title: "@tishlang/pg — Migrations"
summary: Ship ordered .sql files; let Tish record what already ran.
---

Schema changes should be **repeatable** and **ordered**. The **`migrate`** helper in `@tishlang/pg` implements a tiny runner: read a directory of `*.sql` files, sort them lexicographically, and apply any file whose name is not yet recorded in the `_tish_pg_migrations` ledger table.

## Directory layout

```
migrations/
  001_init.sql
  002_notes.sql
  010_add_index.sql
```

Lexical sort means zero-padding (`010_…`) matters — prefer three-digit prefixes so `10` does not sort before `2`.

Each file should be **idempotent-friendly** where possible (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX CONCURRENTLY` split across migrations when required by Postgres rules), but the runner still tracks filenames so you do not double-apply.

## Running migrate

```tish
import { connect, migrate, close } from "@tishlang/pg"

const client = connect(process.env.DATABASE_URL)
if (typeof client === "object") {
  console.error(client.error)
  process.exit(1)
}

const result = migrate(client, "./migrations")
if (typeof result === "object" && result.ok === false) {
  console.error(result.error)
} else {
  console.log("applied:", result.applied)
}

close(client)
```

`result.applied` is a **string array of filenames** newly executed this run. Already-applied files simply no-op.

## Ledger table

On first use the runner creates:

```sql
CREATE TABLE IF NOT EXISTS _tish_pg_migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Each file runs inside **`BEGIN` / `COMMIT`** (or `ROLLBACK` on error) individually, so a broken migration fails atomically without leaving half of a file applied.

## From browser capstone to real disk

If you followed **C4 — Tiny REST API** in the capstone track, you started with RAM + optional IndexedDB. Swapping in Postgres is mostly:

1. Add `@tishlang/pg` to `package.json`.
2. Replace in-memory arrays with `queryPrepared` / small `INSERT`/`DELETE` statements.
3. Commit migration SQL under `migrations/` and call **`migrate`** during startup before `serve()`.

The capstone's [take it real](/capstones/rest-api/03-client-and-take-it-real) chapter now calls this out explicitly — read it side-by-side with chapter **01** for a full diff mindset.

## Operational tips

- **Back up** before running migrations against production.
- Keep migrations **small and focused** — easier to roll forward and reason about in code review.
- For large data backfills, prefer separate maintenance scripts; migrations should stay fast enough to run during deploy.

You now have the full `@tishlang/pg` story: connect, prepare, pipeline batches, and schema evolution.
