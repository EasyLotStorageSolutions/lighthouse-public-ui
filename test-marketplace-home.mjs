import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('./marketplace-home.html', import.meta.url), 'utf8');

test('Meet The Lighthouse shows the current three memberships', () => {
  const plans = [
    ['Free', '$0'],
    ['Lighthouse Employer', '$199'],
    ['Lighthouse Business', '$199']
  ];

  for (const [name, price] of plans) {
    assert.match(source, new RegExp(`<h3>${name}</h3>`));
    assert.ok(source.includes(price));
  }
  assert.match(source, /14-DAY TRIAL[\s\S]*?<h3>Lighthouse Employer<\/h3>/);
  assert.match(source, /Employer access starts with a 14-day free trial, then \$199\/month\./);
  assert.doesNotMatch(source, /MEMBERSHIP OPENING SOON/);
});

test('paid employer access links to the pricing page', () => {
  assert.match(source, /querySelectorAll\('\.lighthouse-plan-action'\)/);
  assert.match(source, /type: 'lighthouse:select-plan'/);
  assert.match(source, /START EMPLOYER PLAN/);
  assert.match(source, /href="\/pricing-plans\?for=employer"/);
  assert.match(source, /action\.disabled = false/);
});

test('pricing layout has explicit tablet and phone safeguards', () => {
  assert.match(source, /@media\(max-width:900px\)[\s\S]*?\.lighthouse-plans\{grid-template-columns:1fr\}/);
  assert.match(source, /@media\(max-width:760px\)[\s\S]*?\.lighthouse-panel\{padding:28px 22px\}/);
  assert.match(source, /\.lighthouse-plan\s*\{[^}]*min-width:0/);
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
  assert.match(source, /Interest is never a contract, hiring decision, or payment/);
});

test('embedded homepage script parses', () => {
  const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'homepage script was not found');
  assert.doesNotThrow(() => new Function(script));
});
