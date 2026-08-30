/**
 * Persisted checkout state. The service writes this file on shutdown and reads it
 * back on startup, so its format is a rollback contract: whatever a running version
 * writes, the version you might roll back to has to be able to read.
 *
 * release/v2.1.0: state records move to schema version 2 (adds `currency`). This
 * reader still accepts v: 1, so the forward upgrade is safe and CI is green — but
 * checkout-api v2.0.0 only understands v: 1, so a rollback after this ships strands
 * the service on any state it has written.
 */

import { readFileSync, writeFileSync } from 'node:fs';

export const STATE_VERSION = 2;

/** @typedef {{ id: number, total_cents: number, currency: string }} Cart */

/** Serialize carts to the on-disk state file. */
export function writeState(/** @type {string} */ path, /** @type {Cart[]} */ carts) {
  const lines = carts.map((c) =>
    JSON.stringify({ v: STATE_VERSION, id: c.id, total_cents: c.total_cents, currency: c.currency ?? 'usd' }),
  );
  writeFileSync(path, lines.join('\n') + '\n');
}

/** Read the state file back into carts. Accepts both v1 and v2 records. */
export function readState(/** @type {string} */ path) {
  const carts = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const rec = JSON.parse(line);
    if (rec.v === 1) {
      carts.push({ id: rec.id, total_cents: rec.total_cents, currency: 'usd' });
    } else if (rec.v === 2) {
      carts.push({ id: rec.id, total_cents: rec.total_cents, currency: rec.currency });
    } else {
      throw new Error(`state record version ${rec.v} not supported by this build`);
    }
  }
  return carts;
}
