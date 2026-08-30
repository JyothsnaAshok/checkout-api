import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { writeState, readState } from '../src/state.mjs';

const FILE = new URL('../.state-test.jsonl', import.meta.url).pathname;

test('writeState / readState round-trips carts with currency', () => {
  const carts = [
    { id: 1, total_cents: 12000, currency: 'usd' },
    { id: 2, total_cents: 4500, currency: 'eur' },
  ];
  try {
    writeState(FILE, carts);
    assert.deepEqual(readState(FILE), carts);
  } finally {
    rmSync(FILE, { force: true });
  }
});

test('readState still accepts a v1 record', () => {
  try {
    writeState(FILE, [{ id: 7, total_cents: 100, currency: 'usd' }]);
    assert.equal(readState(FILE)[0].currency, 'usd');
  } finally {
    rmSync(FILE, { force: true });
  }
});
