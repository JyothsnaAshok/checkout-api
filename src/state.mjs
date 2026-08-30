/**
 * Persisted checkout state. The service writes this file on shutdown and reads it
 * back on startup, so its format is a rollback contract: whatever a running version
 * writes, the version you might roll back to has to be able to read.
 *
 * v2.0.0 (this file on `main`): records are written and read at schema version 1.
 */

import { readFileSync, writeFileSync } from 'node:fs';

export const STATE_VERSION = 1;

/** @typedef {{ id: number, total_cents: number }} Cart */

/** Serialize carts to the on-disk state file. */
export function writeState(/** @type {string} */ path, /** @type {Cart[]} */ carts) {
  const lines = carts.map((c) => JSON.stringify({ v: STATE_VERSION, id: c.id, total_cents: c.total_cents }));
  writeFileSync(path, lines.join('\n') + '\n');
}

/** Read the state file back into carts. Throws on a record this version does not understand. */
export function readState(/** @type {string} */ path) {
  const carts = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const rec = JSON.parse(line);
    if (rec.v !== 1) {
      throw new Error(`state record version ${rec.v} not supported by checkout-api ${STATE_VERSION === 1 ? 'v2.0.0' : 'this build'}`);
    }
    carts.push({ id: rec.id, total_cents: rec.total_cents });
  }
  return carts;
}
