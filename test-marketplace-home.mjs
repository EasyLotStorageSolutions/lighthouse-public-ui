import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('./marketplace-home.html', import.meta.url), 'utf8');

test('the AI signal deck is an honest development preview led by Yvette', () => {
  assert.match(source, /Lighthouse AI · development preview/);
  assert.match(source, /Yvette will be the familiar guide at the center of Lighthouse/);
  assert.match(source, /The full AI workspace is still in development/);
  assert.match(source, /HEAR YVETTE’S WELCOME/);
  assert.match(source, /Yvette uses a synthetic feminine narrator/);
  assert.match(source, /never claims to reproduce a real person's voice/);
  assert.doesNotMatch(source, /<div class="lighthouse-plans"/);
});

test('membership details stay available without crowding the homepage', () => {
  assert.match(source, /href="\/pricing-plans">MEMBERSHIP OPTIONS/);
  assert.match(source, /href="\/customer-portal">OPEN MY LIGHTHOUSE/);
});

test('mobile startup shows a lightweight Lighthouse entrance instead of a hidden dark page', () => {
  assert.match(source, /id="lighthouse-boot"/);
  assert.match(source, /lighthouse-harbor-mobile\.webp/);
  assert.doesNotMatch(source, /html\.lighthouse-loading body\{visibility:hidden/);
  assert.match(source, /Opening your world/);
});

test('the Beacon and Watch experiences are present on the homepage', () => {
  assert.match(source, /id="beacon-quest"/);
  for (const mood of ['calm', 'curious', 'ready']) assert.match(source, new RegExp(`data-beacon-mood="${mood}"`));
  assert.equal((source.match(/data-lighthouse-film="[A-Za-z0-9_-]+"/g) || []).length, 6);
  assert.match(source, /youtube-nocookie\.com\/embed/);
  assert.doesNotMatch(source, /youtube-nocookie\.com\/embed\/[^"]*autoplay=1/);
  assert.match(source, /lighthouse-media-console-2040\.webp/);
});

test('Marketplace phone is a coded, interactive six-step listing demo', () => {
  for (const step of ['Photo', 'Details', 'Sale', 'Price', 'Preview', 'Listed']) {
    assert.match(source, new RegExp(`data-phone-step="[0-5]">${step}<`));
  }
  assert.match(source, /id="marketplace-phone"/);
  assert.match(source, /data-sale-type="Buy Now"/);
  assert.match(source, /data-sale-type="Auction"/);
  assert.match(source, /id="phone-price"[^>]*type="number"/);
  assert.match(source, /marketplacePhone\.addEventListener\('pointerdown',stopPhoneDemo/);
  assert.match(source, /marketplacePhone\.addEventListener\('keydown',stopPhoneDemo/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(source, /<video[^>]+marketplace-phone/i);
});

test('Marketplace review and payment boundaries remain visible in the phone', () => {
  assert.match(source, /Listings are reviewed before they go live|reviews it before it goes live/);
  assert.match(source, /Buyer pays seller directly/);
  assert.match(source, /ENTER AUCTION HALL · VIEW ONLY/);
});

test('Lighthouse Work is public between Storage and Marketplace with nine interactive steps', () => {
  const storage = source.indexOf('id="storage"');
  const work = source.indexOf('id="lighthouse-work"');
  const marketplace = source.indexOf('id="marketplace-showcase"');
  assert.ok(storage < work && work < marketplace);
  assert.match(source, /id="lighthouse-work"[^>]*data-live-work="true"/);
  assert.equal((source.match(/data-work-screen="\d"/g) || []).length, 9);
  assert.match(source, /PUBLIC EARLY ACCESS/);
  assert.match(source, /Lighthouse is the connector—not the employer, payroll provider, or contracting party/);
});

test('embedded homepage script parses', () => {
  const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'homepage script was not found');
  assert.doesNotThrow(() => new Function(script));
});
