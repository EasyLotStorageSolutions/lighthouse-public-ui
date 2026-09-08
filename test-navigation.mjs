import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

test('footer preserves browser navigation for redirects and account queries, bridging only sections',()=>{
  const html=readFileSync(new URL('./marketplace-footer.html',import.meta.url),'utf8');
  const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const messages=[];let listener;
  const context={URL,document:{referrer:'https://www.easylotstoragesolutions.com/',addEventListener:(_,fn)=>listener=fn},window:{parent:{postMessage:m=>messages.push(m)}}};
  vm.runInNewContext(script,context);
  const click=(href,extra={})=>{let prevented=false;listener({button:0,target:{closest:()=>({getAttribute:()=>href})},preventDefault:()=>prevented=true,...extra});return prevented;};
  for(const href of ['/marketplace','/customer-portal?view=storage','/customer-portal?view=work','/'])assert.equal(click(href),false,href);
  assert.equal(click('/#lighthouse-video-studio'),true);assert.equal(messages[0].href,'/#lighthouse-video-studio');
  assert.equal(click('/#lighthouse-video-studio',{ctrlKey:true}),false);
});

test('workspace accepts Work and Studio navigation but ignores unknown views',()=>{
  const html=readFileSync(new URL('./easytalk-portal.html',import.meta.url),'utf8');
  for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
  const expression=html.match(/"easytalk:navigate"===t\.type&&.*?selectView\([^)]*\)/)[0];
  const selected=[];const context={selectView:v=>selected.push(v),t:{}};
  for(const view of ['controls','studio','unknown']){context.t={type:'easytalk:navigate',view};vm.runInNewContext(expression,context);}
  assert.deepEqual(selected,['controls','studio']);
});
