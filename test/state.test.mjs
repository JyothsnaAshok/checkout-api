import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { writeState, readState } from '../src/state.mjs';

const FILE = new URL('../.state-test.jsonl', import.meta.url).pathname;

test('writeState / readState round-trips carts', () => {
  const carts = [
    { id: 1, total_cents: 12000 },
    { id: 2, total_cents: 4500 },
  ];
  try {
    writeState(FILE, carts);
    assert.deepEqual(readState(FILE), carts);
  } finally {
    rmSync(FILE, { force: true });
  }
});

test('readState skips blank lines', () => {
  try {
    writeState(FILE, [{ id: 7, total_cents: 100 }]);
    assert.equal(readState(FILE).length, 1);
  } finally {
    rmSync(FILE, { force: true });
  }
});
