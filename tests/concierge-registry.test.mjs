import test from 'node:test';
import assert from 'node:assert/strict';
import {departments, searchDepartments, actionPolicy, validateRegistry, CONFIRMATION} from '../lighthouse-concierge-registry.mjs';

test('registry contains unique safe permanent destinations', () => {
  assert.equal(validateRegistry(), true);
  assert.equal(new Set(departments.map(item => item.id)).size, departments.length);
  assert.ok(departments.length >= 10);
});

test('plain-language needs route to expected departments', () => {
  assert.equal(searchDepartments('I need somewhere to park my camper')[0].id, 'storage');
  assert.equal(searchDepartments('sell my 2007 Toyota Corolla')[0].id, 'marketplace');
  assert.equal(searchDepartments('I am locked out and need a key')[0].id, 'locksmith');
  assert.equal(searchDepartments('cut my grass and fix my yard')[0].id, 'landscaping');
});

test('consequential actions require explicit confirmation', () => {
  for (const id of ['listing.publish','checkout.submit','reservation.submit']) {
    assert.equal(actionPolicy(id)?.confirmation, CONFIRMATION.EXPLICIT);
  }
});
