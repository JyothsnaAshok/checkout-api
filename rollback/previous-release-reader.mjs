/**
 * Frozen copy of `src/state.mjs` readState() as shipped in tag v2.0.0 — the code a
 * rolled-back instance would run. Release Guardian's Rollback Check uses this to
 * verify that whatever the *candidate* writes can still be read after a rollback.
 *
 * Do not "keep in sync" with src/ — the whole point is that it stays at v2.0.0.
 */

import { readFileSync } from 'node:fs';

export function readStateAsPreviousRelease(/** @type {string} */ path) {
  const carts = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const rec = JSON.parse(line);
    if (rec.v !== 1) {
      throw new Error(`state record version ${rec.v} not supported by checkout-api v2.0.0`);
    }
    carts.push({ id: rec.id, total_cents: rec.total_cents });
  }
  return carts;
}
