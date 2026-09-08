import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pages = [
  'easytalk-portal.html','lighthouse-channel.html','marketplace-explore.html','marketplace-find-storage.html',
  'marketplace-for-businesses.html','marketplace-how-it-works.html','marketplace-legal-center.html',
  'marketplace-list-your-space.html','marketplace-maker-space.html','marketplace-operator-community.html',
  'marketplace-pricing-plans.html','marketplace-property-classifieds.html','marketplace-provider-admin.html',
  'marketplace-provider-application.html','marketplace-provider-dashboard.html','marketplace-sell.html',
  'marketplace-solutions.html','my-easy-lot.html','opening-day-review.html','store-intelligence.html'
];

test('every Lighthouse interior loads the shared visual shell and dependable Home control', async () => {
  const shell = await readFile(new URL('./lighthouse-interior-2040.js', import.meta.url), 'utf8');
  const theme = await readFile(new URL('./lighthouse-interior-2040.css', import.meta.url), 'utf8');
  assert.doesNotThrow(() => new Function(shell));
  assert.match(shell, /easylotstoragesolutions\.com\//);
  assert.match(theme, /padding-bottom:max\(140px/);
  assert.match(theme, /safe-area-inset-bottom/);
  for (const page of pages) {
    const source = await readFile(new URL(`./${page}`, import.meta.url), 'utf8');
    assert.match(source, /https:\/\/easylotstoragesolutions\.github\.io\/lighthouse-public-ui\/lighthouse-interior-2040\.css/, `${page} is missing the shared theme`);
    assert.match(source, /https:\/\/easylotstoragesolutions\.github\.io\/lighthouse-public-ui\/lighthouse-interior-2040\.js/, `${page} is missing the shared navigation`);
  }
});

test('Lighthouse media starts with simple choices and hides manual URL entry until requested', async () => {
  const source = await readFile(new URL('./lighthouse-live.mjs', import.meta.url), 'utf8');
  assert.match(source, /Bring a different YouTube video/);
  assert.match(source, /Search for another station/);
  assert.match(source, /Use a different iHeart station/);
  assert.match(source, /guideButton\.setAttribute\('aria-pressed'/);
});
