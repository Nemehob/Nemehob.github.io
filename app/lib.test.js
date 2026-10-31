import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse, complete, matches, suggest, themeKey, readmeSummary, age } from './lib.js';

test('parse', () => {
  assert.deepEqual(parse('  Projects '), { cmd: 'projecten', word: 'Projects', args: '' });
  assert.equal(parse('echo hoi  daar').args, 'hoi  daar');
  assert.equal(parse('guess').cmd, 'raad');
  assert.equal(parse(''), null);
  assert.equal(parse('rm -rf /').cmd, 'unknown');
});

test('complete and matches', () => {
  assert.equal(complete('pro', 'nl'), 'projecten');
  assert.equal(complete('pro', 'en'), 'projects');
  assert.equal(complete('h', 'nl'), 'h'); // several commands start with h
  assert.deepEqual(matches('h', 'nl'), ['hobbies', 'history', 'hostname', 'help']);
  assert.deepEqual(matches('github x', 'nl'), []); // only the first word completes
});

test('suggest', () => {
  assert.equal(suggest('projeten', 'nl'), 'projecten');
  assert.equal(suggest('Contcat', 'en'), 'contact');
  assert.equal(suggest('x', 'nl'), undefined);
  assert.equal(suggest('banana', 'nl'), undefined);
});

test('themeKey', () => {
  assert.equal(themeKey('Green'), 'groen');
  assert.equal(themeKey('licht'), 'licht');
  assert.equal(themeKey(''), undefined);
});

test('readmeSummary', () => {
  const md = '# Quiz\n\n![badge](x.svg)\n\nA **quiz** app, see [the demo](http://x).\n\nMore.';
  assert.equal(readmeSummary(md), 'A quiz app, see the demo.');
  assert.equal(readmeSummary(''), '');
  assert.equal(readmeSummary('word '.repeat(100), 20).length, 20);
});

test('age', () => {
  assert.equal(age('2010-10-20', new Date(2026, 9, 19)), 15);
  assert.equal(age('2010-10-20', new Date(2026, 9, 20)), 16);
  assert.equal(age('2010-10-20', new Date(2027, 0, 1)), 16);
});
