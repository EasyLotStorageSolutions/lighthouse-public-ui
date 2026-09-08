import { featuredVideos } from './lighthouse-featured-videos.mjs?v=1';
import { youtubeId } from './lighthouse-guide-data.mjs';
const old = document.querySelector('.owner-channel');
const parentOrigin = (()=>{try {const u=new URL(document.referrer);if(['www.easylotstoragesolutions.com','easylotstoragesolutions.com','localhost','127.0.0.1'].includes(u.hostname)||/(^|\.)editor\.wix\.com$/.test(u.hostname))return u.origin;}catch{}return 'https://www.easylotstoragesolutions.com';})();
if (old) {
  old.hidden=true;old.style.display="none";
  const box=document.createElement('div');box.className='card owner-channel';
  box.innerHTML=`<div class="eyebrow">YOUR HOMEPAGE · YOUR STORIES</div><h2>Feature something at Lighthouse</h2><p>Choose one destination and show visitors what makes it worth exploring. Drafts stay private until you publish.</p>
  <form class="stack" id="featuredMediaForm">
  <label>Category<select name="category"><option value="storage">Storage &amp; Space</option><option value="employment">Jobs &amp; Hiring</option><option value="social">Community &amp; Social</option><option value="marketplace">Marketplace</option><option value="music">Creative Studio</option></select></label>
  <label>What should visitors see?<select name="mode"><option value="default">Original Lighthouse video</option><option value="youtube">YouTube video</option><option value="video">Video from Wix Media</option><option value="image">Image only</option></select></label>
  <div data-custom class="stack" hidden><label>Media link<input name="source" type="url" maxlength="2000" placeholder="https://www.youtube.com/watch?v=…"></label>
  <p class="tiny">For your own file, upload it in Wix Media Manager and paste its public video or image URL here. Direct file upload inside this panel is not yet available.</p>
  <label>Feature title<input name="title" maxlength="120" placeholder="Meet the people behind the work"></label>
  <label>Short introduction<input name="note" maxlength="220"></label>
  <details><summary>Cover image & captions</summary><div class="stack"><label>Cover image URL (optional)<input name="poster" type="url" maxlength="2000"></label>
  <label>English captions URL (optional WebVTT)<input name="captions" type="url" maxlength="2000"></label>
  <p class="tiny">Direct media and covers must come from Wix Media or Lighthouse’s asset library. Add accurate captions to videos with speech; for YouTube, check its caption track.</p></div></details></div>
  <div class="row"><button type="submit">Save private draft</button><button type="button" data-preview class="secondary">Preview draft</button><button type="button" data-reload class="secondary">Reload saved</button></div>
  <label data-rights style="display:flex;align-items:flex-start;gap:10px" hidden><input style="width:auto;flex:none;margin-top:4px" type="checkbox" name="rights"> I have permission to publish this media and have checked its captions and description.</label>
  <button type="button" data-publish disabled>Publish reviewed draft to homepage</button>
  </form><p data-status role="status" aria-live="polite">Load your saved features to begin.</p><div data-preview-box></div><a href="https://www.easylotstoragesolutions.com/" target="_blank" rel="noopener">View public homepage ↗</a>`;
  old.after(box);
  const form=box.querySelector('form'),fields=form.elements,status=box.querySelector('[data-status]'),preview=box.querySelector('[data-preview-box]'),publish=box.querySelector('[data-publish]');
  let records={},pending=null,timer=null,reviewed=false,dirty=false,loaded=false;
  const feature=()=>Object.fromEntries(['mode','source','title','note','poster','captions'].map(k=>[k,fields[k].value]));
  function visibility(){box.querySelector('[data-custom]').style.display=fields.mode.value==='default'?'none':'grid';box.querySelector('[data-rights]').style.display=fields.mode.value==='default'?'none':'flex';}
  fields.mode.addEventListener('change',visibility);visibility();
  function ready(){publish.disabled=Boolean(pending)||!loaded||dirty||!reviewed||!records[fields.category.value]?.savedAt;}
  function message(text){status.textContent=text;}
  function fill(){const row=records[fields.category.value]||{},data=row.draft||row.published||{mode:'default'};for(const k of ['mode','source','title','note','poster','captions'])fields[k].value=data[k]|| (k==='mode'?'default':'');fields.rights.checked=false;visibility();preview.replaceChildren();dirty=false;reviewed=false;ready();message(row.publishedAt?'Published '+new Date(row.publishedAt).toLocaleString()+'. You are editing a private draft.':'Original Lighthouse media is public. Save and preview a draft to replace it.');}
  function request(action,data={}){if(pending)return;const requestId=crypto.randomUUID();pending=requestId;ready();form.querySelectorAll('button').forEach(b=>b.disabled=true);fields.category.disabled=true;message(action==='publish'?'Publishing your reviewed draft…':'Connecting to your owner account…');window.parent.postMessage({type:'lighthouse-media:'+action,data:{...data,requestId}},parentOrigin);timer=setTimeout(()=>{pending=null;form.querySelectorAll('button').forEach(b=>b.disabled=false);fields.category.disabled=false;ready();message('No confirmation received. Reload saved before retrying; the request may have completed.');},20000);}
  form.addEventListener('input',e=>{if(e.target.name==='rights')return;dirty=true;reviewed=false;ready();});
  fields.category.addEventListener('change',fill);
  form.addEventListener('submit',e=>{e.preventDefault();request('save',{category:fields.category.value,feature:feature()});});
  box.querySelector('[data-reload]').onclick=()=>request('load');
  box.querySelector('[data-preview]').onclick=()=>{
    if(dirty||!records[fields.category.value]?.draft){message('Save your draft first so the preview matches what will be published.');return;}
    const saved=records[fields.category.value].draft,data=saved.mode==='default'?featuredVideos[fields.category.value]:saved;preview.replaceChildren();
    const title=document.createElement('h3');title.textContent=data.title||'Original Lighthouse video';preview.append(title);
    let media;
    try{
      if(data.mode==='youtube'){media=document.createElement('iframe');media.src='https://www.youtube-nocookie.com/embed/'+youtubeId(data.source);media.title=data.title||'Featured video preview';media.allowFullscreen=true;}
      else if(data.mode==='image'){media=document.createElement('img');media.src=data.source;media.alt=data.title;}
      else{media=document.createElement('video');media.src=data.source;media.poster=data.poster||'';media.controls=true;media.playsInline=true;if(data.captions){const t=document.createElement('track');t.kind='captions';t.srclang='en';t.label='English';t.src=data.captions;media.append(t);}}
      media.style.cssText='width:100%;max-height:340px;aspect-ratio:16/9;object-fit:contain;border:0;background:#071b2b;border-radius:14px';preview.append(media);reviewed=true;ready();message('Review the playback, cover and captions. Publish only when you are happy with them.');
    }catch(error){message(error.message);}
  };
  publish.onclick=()=>{const row=records[fields.category.value];if(dirty||!reviewed)return;if(row.draft.mode!=='default'&&!fields.rights.checked){message('Confirm your permission and accessibility review before publishing.');return;}request('publish',{category:fields.category.value,savedAt:row.savedAt,rightsConfirmed:fields.rights.checked});};
  window.addEventListener('message',event=>{if(event.source!==window.parent||event.origin!==parentOrigin)return;const m=event.data||{};
    if(m.type==='lighthouse-owner:data'&&!loaded&&!pending)request('load');
    if(!pending||m.requestId!==pending)return;
    if(!['lighthouse-media:result','lighthouse-media:error'].includes(m.type))return;
    clearTimeout(timer);pending=null;form.querySelectorAll('button').forEach(b=>b.disabled=false);fields.category.disabled=false;
    if(m.type==='lighthouse-media:error'){ready();message(m.error||'The change was not confirmed. Reload saved before retrying.');return;}
    if(m.action==='lighthouse-media:load'){records=m.result||{};loaded=true;fill();}
    else {records[m.result.category]=m.result.value;loaded=true;fill();message(m.action==='lighthouse-media:publish'?'Published. New homepage visits will use this feature.':'Private draft saved. Preview it before publishing.');}
  });
}
