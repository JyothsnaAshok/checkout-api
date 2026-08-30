# Publishing this repo

One-time, from this directory. Creates `main` (tag `v2.0.0`) and the release
candidate branch `release/v2.1.0`.

```bash
git init -b main
git add .
git commit -m "checkout-api v2.0.0 — state persistence at schema v1"
git tag v2.0.0
git checkout -b release/v2.1.0
```

On the branch, make the forward-incompatible change — **both files**, so the unit
tests still pass and CI stays green:

### `src/state.mjs`
- `STATE_VERSION = 2`
- `writeState` emits `{ v: 2, id, total_cents, currency }`
- `readState` accepts **both** `v: 1` and `v: 2` (so the upgrade itself is safe)

### `test/state.test.mjs`
- the round-trip test now expects a `currency` field on each cart (`'usd'` by default)

Leave `rollback/previous-release-reader.mjs` untouched — it is frozen at v2.0.0 and is
what makes `npm run verify-rollback` fail on this branch.

```bash
git add src/state.mjs test/state.test.mjs
git commit -m "release/v2.1.0 — state records to v2 (add currency)"

git checkout main
git remote add origin https://github.com/JyothsnaAshok/checkout-api
git push -u origin main --tags
git push origin release/v2.1.0
```

## The demo story

| Signal | Result |
| --- | --- |
| `npm test` (CI) | green on both branches |
| forward upgrade (v2.0.0 state readable by v2.1.0) | safe |
| `npm run verify-rollback` on `release/v2.1.0` | **fails** — a rolled-back v2.0.0 instance cannot read `v: 2` state |

A human reading the PR ships it. Release Guardian's Rollback Check is what flags that
`v2.1.0` cannot be safely rolled back.
