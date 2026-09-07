import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('./marketplace-explore.html', import.meta.url), 'utf8');

test('Marketplace keeps empty inventory honest and offers useful next steps', () => {
  assert.match(source, /The first approved listings are on their way/);
  assert.match(source, /Nothing approved here yet/);
  assert.match(source, /TELL LIGHTHOUSE WHAT I NEED/);
  assert.match(source, /https:\/\/www\.easylotstoragesolutions\.com\/#assistant/);
  assert.match(source, /https:\/\/www\.easylotstoragesolutions\.com\/sell-something/);
  assert.doesNotMatch(source, /sample listings are being displayed|demo listings appear below/i);
});

test('Marketplace load failure remains distinct from a valid empty response', () => {
  assert.match(source, /The Square is taking a moment/);
  assert.match(source, /No sample listings are being substituted/);
});

test('Marketplace embedded script parses', () => {
  const scripts = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length, 'Marketplace script was not found');
  for (const [, script] of scripts) assert.doesNotThrow(() => new Function(script));
});
