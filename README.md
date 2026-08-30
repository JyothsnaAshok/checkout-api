# checkout-api

A deliberately small **pure-code** demo release candidate for
[Release Guardian](https://github.com/JyothsnaAshok/Release-Guardian) — the companion
to `orders-service` (which carries the SQL-migration case).

No database. The rollback risk here is a **forward-incompatible change to persisted
state**: the service writes `state.mjs` records on shutdown and reads them on startup,
so whatever a running build writes, the build you might roll back to has to be able to
read.

## Releases

| Ref | What it is |
| --- | --- |
| tag `v2.0.0` | last shipped release — writes and reads state records at `v: 1` |
| branch `release/v2.1.0` | the candidate: `writeState` emits `v: 2` records. The candidate's own reader handles both `v: 1` and `v: 2`, so **the upgrade is safe and CI is green** — but a rollback to `v2.0.0` strands the service, because `v2.0.0` only understands `v: 1`. |

`rollback/previous-release-reader.mjs` is frozen at `v2.0.0`'s reader.
`npm run verify-rollback` writes state with the current build and reads it back with
that frozen reader — exit 0 if a rollback is safe, 1 if it isn't. Release Guardian's
Rollback Check runs this in a sandbox.

## Run locally

```bash
npm test
npm run verify-rollback
```
