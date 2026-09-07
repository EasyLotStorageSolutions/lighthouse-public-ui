import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const home = await readFile(new URL('./marketplace-home.html', import.meta.url), 'utf8');
const behavior = await readFile(new URL('./lighthouse-2040.js', import.meta.url), 'utf8');
const harbor = await readFile(new URL('./lighthouse-harbor.mjs', import.meta.url), 'utf8');
const styles = await readFile(new URL('./lighthouse-2040.css', import.meta.url), 'utf8');
const live = await readFile(new URL('./lighthouse-live.mjs', import.meta.url), 'utf8');
const header = await readFile(new URL('./marketplace-header.html', import.meta.url), 'utf8');

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

test('all five main-page Lighthouses have independent guide, television, and radio controls', () => {
  for (const category of ['storage', 'employment', 'social', 'marketplace', 'music']) assert.match(live, new RegExp(`${category}:\\{name:`));
  for (const control of ['Property TV', 'Local Radio', 'Work TV', 'News Radio', 'Community TV', 'Talk Radio', 'Market TV', 'Business Radio', 'Music TV', 'Music Radio']) assert.match(live, new RegExp(control));
  assert.match(live, /harbor-mini-lighthouse/);
  assert.match(live, /audio\.pause\(\)/);
  assert.match(live, /frame\.src='about:blank'/);
  assert.match(styles, /\.harbor-app\[data-view=home\] \.harbor-brand\{display:none\}/);
  assert.match(styles, /\.harbor-app:not\(\[data-view=home\]\) \.harbor-nav\{display:none!important\}/);
  assert.match(styles, /\.harbor-panel-home\{display:none!important\}/);
  assert.match(harbor, /button\('Lighthouse Home','harbor-brand'/);
  assert.match(harbor, /aria-label','Return to Lighthouse Home'/);
  assert.match(styles, /scroll-snap-type:x mandatory/);
});

test('radio search is user-started, HTTPS-only, and keeps each Lighthouse choice separate', () => {
  assert.match(live, /hidebroken:'true',is_https:'true'/);
  assert.match(live, /stations\/search/);
  assert.match(live, /station\.url_resolved/);
  assert.match(live, /lighthouse-radio-\$\{activeCategory\}/);
  assert.doesNotMatch(live, /autoplay=1/);
  assert.match(live, /\?embed=true&theme=dark/);
  assert.match(live, /Official iHeartRadio station widget/);
  assert.match(live, /function toIHeartEmbed\(value\)/);
  assert.match(live, /\['iheart\.com','www\.iheart\.com'\]/);
  assert.match(live, /lighthouse-iheart-\$\{activeCategory\}/);
  assert.match(live, /Use any iHeart station/);
  assert.match(live, /Browse more stations on iHeart/);
});

test('the visible site header uses the dark Lighthouse navigation and a dependable Home link', () => {
  assert.match(header, /linear-gradient\(100deg,rgba\(4,25,43,.97\)/);
  assert.match(header, /href="https:\/\/www\.easylotstoragesolutions\.com\/\?lighthouseHome=1" target="_top">Home/);
});
