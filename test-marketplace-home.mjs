import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('./marketplace-home.html', import.meta.url), 'utf8');

test('Meet The Lighthouse shows the three approved memberships', () => {
  const plans = [
    ['Personal', '$19.99', '8d680a1a-cb69-4e99-ac46-273e2592f47c'],
    ['Plus', '$39.99', 'e7f41b24-d77e-47af-9bd9-8af907ae7234'],
    ['Power', '$79.99', '7147b6f2-44d3-4f62-b1a8-aa2c3365ca08']
  ];

  for (const [name, price, planId] of plans) {
    assert.match(source, new RegExp(`<h3>${name}</h3>`));
    assert.ok(source.includes(price));
    assert.ok(source.includes(`data-plan-id="${planId}"`));
  }
  assert.equal((source.match(/7 days free/g) || []).length, 3);
  assert.match(source, /BEST VALUE[\s\S]*?<h3>Plus<\/h3>/);
  assert.doesNotMatch(source, /No trial/);
});

test('plan buttons use the parent checkout bridge and recover from errors', () => {
  assert.match(source, /querySelectorAll\('\.lighthouse-plan-action'\)/);
  assert.match(source, /type: 'lighthouse:select-plan'/);
  assert.match(source, /payload\.type === 'lighthouse:checkout-error'/);
  assert.match(source, /action\.disabled = false/);
});

test('pricing layout has explicit tablet and phone safeguards', () => {
  assert.match(source, /@media\(max-width:900px\)[\s\S]*?\.lighthouse-plans\{grid-template-columns:1fr\}/);
  assert.match(source, /@media\(max-width:760px\)[\s\S]*?\.lighthouse-panel\{padding:28px 22px\}/);
  assert.match(source, /\.lighthouse-plan\s*\{[^}]*min-width:0/);
});

test('embedded homepage script parses', () => {
  const script = source.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script, 'homepage script was not found');
  assert.doesNotThrow(() => new Function(script));
});
