/**
 * Rollback safety check for a code (non-schema) release.
 *
 * The service persists state with the CURRENT build, then a rolled-back instance
 * running v2.0.0 has to read that same file. We prove it by executing:
 *   1. write a state file with the current src/state.mjs
 *   2. read it back with rollback/previous-release-reader.mjs (frozen at v2.0.0)
 *
 * Exit 0 if the previous release can read what this build writes; 1 if it can't
 * (a forward-incompatible change that would strand a rollback). Prints the reason.
 *
 * Release Guardian's Rollback Check runs this in a sandbox against the candidate.
 */

import { rmSync } from 'node:fs';
import { writeState } from '../src/state.mjs';
import { readStateAsPreviousRelease } from '../rollback/previous-release-reader.mjs';

const FILE = new URL('../.rollback-check.jsonl', import.meta.url).pathname;
const carts = [
  { id: 1, total_cents: 12000 },
  { id: 2, total_cents: 4500 },
];

try {
  writeState(FILE, carts);
  const roundTripped = readStateAsPreviousRelease(FILE);
  if (roundTripped.length !== carts.length) {
    console.error(`LOSS: previous release read ${roundTripped.length}/${carts.length} carts`);
    process.exit(1);
  }
  console.log('OK: state written by this build is readable by checkout-api v2.0.0 — rollback safe');
  process.exit(0);
} catch (err) {
  console.error(`LOSS: a rolled-back v2.0.0 instance cannot read this build's state — ${err.message}`);
  process.exit(1);
} finally {
  rmSync(FILE, { force: true });
}
