import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('./storage-20260908.html',import.meta.url),'utf8');

test('storage workflow offers assigned-space final agreement without charging on signature',()=>{
  assert.match(source,/Sign final agreement/);
  assert.match(source,/Nothing is charged by this signature button/);
  assert.match(source,/my-easy-lot:agreement-sign/);
});
test('storage valuation copy does not claim an unavailable provider connection',()=>{
  assert.doesNotMatch(source,/Pending a real-world J\.D\. Power lookup/);
  assert.match(source,/connects a licensed valuation provider/);
});
test('storage public scripts parse',()=>{
  const scripts=[...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match=>match[1]);
  assert.ok(scripts.length);
  for(const script of scripts)new Function(script);
});
