import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
const source=fs.readFileSync(new URL('./lighthouse-pricing-guide.js',import.meta.url),'utf8');
test('pricing groups are explicit and existing checkout actions are never replaced',()=>{
  for(const name of ['The Lighthouse Membership','Lighthouse Business','Lighthouse Employer','Car/Truck Storage','Storage Facility Advertising']) assert.match(source,new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.match(source,/Lighthouse memberships pay for platform access/);
  assert.doesNotMatch(source,/removeChild|\.remove\(|outerHTML|onclick\s*=/);
});
test('Lighthouse is the default view and query parameters allow storage or all plans',()=>{
  assert.match(source,/return \['storage', 'all'\]\.includes\(requested\) \? requested : 'lighthouse'/);
  assert.match(source,/searchParams\.set\('for', value\)/);
});
test('hidden plans retain checkout DOM and are restored by clearing display',()=>{
  assert.match(source,/plan\.hidden = !visible/);
  assert.match(source,/plan\.style\.display = visible \? '' : 'none'/);
});
