import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const home = await readFile(new URL('./marketplace-home.html', import.meta.url), 'utf8');
const behavior = await readFile(new URL('./lighthouse-2040.js', import.meta.url), 'utf8');
const harbor = await readFile(new URL('./lighthouse-harbor.mjs', import.meta.url), 'utf8');
const styles = await readFile(new URL('./lighthouse-2040.css', import.meta.url), 'utf8');

test('Lighthouse 2040 behavior parses and keeps video IDs constrained', () => {
  assert.doesNotThrow(() => new Function(behavior));
  assert.match(behavior, /replace\(\/\[\^A-Za-z0-9_-\]\//);
  assert.match(behavior, /youtube-nocookie\.com\/embed\/\$\{id\}/);
  assert.doesNotMatch(behavior, /\beval\s*\(/);
});

test('category and feature videos are framed as Lighthouse lanterns', () => {
  assert.match(styles, /\.lighthouse-screen/);
  assert.match(styles, /\.harbor-app \.lighthouse-viewer/);
  assert.match(styles, /lighthouse-media-console-2040\.webp/);
  assert.match(harbor, /video inside a Lighthouse lantern/);
  assert.match(harbor, /harbor-film-collection/);
  assert.match(home, /Selected film playing inside a Lighthouse lantern/);
});

test('the repeat-visit Beacon stores only a local score', () => {
  assert.match(behavior, /localStorage\.getItem\('lighthouseBeacons'\)/);
  assert.match(behavior, /localStorage\.setItem\('lighthouseBeacons'/);
  assert.doesNotMatch(behavior, /fetch\s*\(|XMLHttpRequest|sendBeacon/);
});
