import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, complete, age } from './lib.js';

test('resolve', () => {
  assert.equal(resolve('  Projects '), 'projecten');
  assert.equal(resolve('help me'), 'help');
  assert.equal(resolve(''), null);
  assert.equal(resolve('rm -rf /'), 'unknown');
});

test('complete', () => {
  assert.equal(complete('pro'), 'projecten');
  assert.equal(complete('h'), 'h'); // help and hobbies both match
  assert.equal(complete('ho'), 'hobbies');
  assert.equal(complete('xyz'), 'xyz');
});

test('age', () => {
  assert.equal(age('2010-10-20', new Date(2026, 9, 19)), 15);
  assert.equal(age('2010-10-20', new Date(2026, 9, 20)), 16);
  assert.equal(age('2010-10-20', new Date(2027, 0, 1)), 16);
});
