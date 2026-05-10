import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareSortKeys, getSortKey } from '../src/sortKey.js';

function row(name, values) {
  return { name, key: getSortKey(values) };
}

test('sorts arrived first and takeout rows last', () => {
  const rows = [
    row('more progress', {
      isArrived: false,
      isDone: false,
      eventCount: 4,
      eta: Infinity,
      lastUpdate: 3,
    }),
    row('takeout', { isArrived: false, isDone: true, eventCount: 9, eta: 0, lastUpdate: 9 }),
    row('eta tomorrow', { isArrived: false, isDone: false, eventCount: 3, eta: 1, lastUpdate: 5 }),
    row('arrived', { isArrived: true, isDone: false, eventCount: 1, eta: Infinity, lastUpdate: 1 }),
  ];

  rows.sort((a, b) => compareSortKeys(a.key, b.key));

  assert.deepEqual(
    rows.map((r) => r.name),
    ['arrived', 'more progress', 'eta tomorrow', 'takeout'],
  );
});

test('sorts by progress before ETA', () => {
  const rows = [
    row('eta sooner less progress', {
      isArrived: false,
      isDone: false,
      eventCount: 2,
      eta: 1,
      lastUpdate: 9,
    }),
    row('eta later more progress', {
      isArrived: false,
      isDone: false,
      eventCount: 3,
      eta: 4,
      lastUpdate: 1,
    }),
  ];

  rows.sort((a, b) => compareSortKeys(a.key, b.key));

  assert.deepEqual(
    rows.map((r) => r.name),
    ['eta later more progress', 'eta sooner less progress'],
  );
});

test('sorts ETA by soonest arrival after progress ties', () => {
  const rows = [
    row('eta later', { isArrived: false, isDone: false, eventCount: 3, eta: 4, lastUpdate: 9 }),
    row('eta sooner', { isArrived: false, isDone: false, eventCount: 3, eta: 1, lastUpdate: 1 }),
  ];

  rows.sort((a, b) => compareSortKeys(a.key, b.key));

  assert.deepEqual(
    rows.map((r) => r.name),
    ['eta sooner', 'eta later'],
  );
});

test('uses last update as final tie breaker', () => {
  const rows = [
    row('older', { isArrived: false, isDone: false, eventCount: 2, eta: 1, lastUpdate: 1 }),
    row('newer', { isArrived: false, isDone: false, eventCount: 2, eta: 1, lastUpdate: 2 }),
  ];

  rows.sort((a, b) => compareSortKeys(a.key, b.key));

  assert.deepEqual(
    rows.map((r) => r.name),
    ['newer', 'older'],
  );
});
