import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const home = await readFile(new URL('./marketplace-home.html', import.meta.url), 'utf8');
const behavior = await readFile(new URL('./lighthouse-2040.js', import.meta.url), 'utf8');
const harbor = await readFile(new URL('./lighthouse-harbor.mjs', import.meta.url), 'utf8');
const styles = await readFile(new URL('./lighthouse-2040.css', import.meta.url), 'utf8');
const live = await readFile(new URL('./lighthouse-live.mjs', import.meta.url), 'utf8');
const phones = await readFile(new URL('./lighthouse-category-phones.mjs', import.meta.url), 'utf8');
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
  assert.match(live, /EXPAND TV/);
  assert.match(live, /function youtubeVideoId\(value\)/);
  assert.match(live, /youtube-nocookie\.com\/embed/);
  assert.match(styles, /\.harbor-live\[data-mode=visual\]/);
  assert.match(live, /Browse more stations on iHeart/);
  for (const channel of ['ABC News Live', 'NBC News NOW', 'CBS News 24\/7', 'Bloomberg TV', 'NASA TV']) assert.match(live, new RegExp(channel));
  assert.match(live, /FIND STATIONS NEAR ME/);
  assert.match(live, /navigator\.geolocation\.getCurrentPosition/);
  assert.match(live, /reverse-geocode-client/);
  assert.match(live, /lighthouse-radio-region/);
  assert.match(live, /countrycode:'US',state:/);
  assert.match(live, /Exact coordinates go to the location lookup service once and are not saved by Lighthouse/);
});

test('the visible site header uses the dark Lighthouse navigation and a dependable Home link', () => {
  assert.match(header, /linear-gradient\(100deg,rgba\(4,25,43,.97\)/);
  assert.match(header, /href="https:\/\/www\.easylotstoragesolutions\.com\/\?lighthouseHome=1" target="_top">Home/);
});

test('Yvette never falls through to an arbitrary male browser voice', () => {
  assert.match(behavior, /async function chooseYvetteVoice/);
  assert.match(behavior, /Microsoft Aria/);
  assert.doesNotMatch(behavior, /voices\.find\(item => \/en\/i\.test\(item\.lang\)\)/);
  assert.match(phones, /video\.muted=true;video\.volume=0/);
  assert.match(phones, /A suitable feminine narrator is not available/);
  assert.match(home, /synthetic feminine narrator/);
});

test('the homepage explains Lighthouse Mall, its goal, and its future honestly', () => {
  assert.match(harbor, /One place for the many parts of life/);
  assert.match(harbor, /What Lighthouse offers/);
  assert.match(harbor, /Our goal/);
  assert.match(harbor, /Where we are heading/);
  assert.match(harbor, /Lighthouse AI is being developed/);
  assert.match(harbor, /not hidden transaction fees/);
  assert.match(styles, /\.harbor-story-columns/);
});
