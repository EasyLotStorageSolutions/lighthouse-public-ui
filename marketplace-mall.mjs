let hlsLibrary;
function loadHls(){
    if(!hlsLibrary)hlsLibrary=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('vendor/hls.light.min.js',location.href).href;script.onload=()=>resolve(window.Hls);script.onerror=()=>{hlsLibrary=null;reject(new Error('Video playback could not load. Please retry.'));};document.head.append(script);});
    return hlsLibrary;
}
const SITE = 'https://www.easylotstoragesolutions.com';
const PARENT_ORIGIN = SITE;
const params = new URLSearchParams(location.search);
const embedded = params.get('embedded') === '1' && window.parent !== window;
const content = document.querySelector('#content'), notice = document.querySelector('#notice');
const labels = { vehicles:'Vehicles', equipment:'Tools & equipment', 'home-goods':'Home & goods', handmade:'Handmade', 'business-commercial':'Business', free:'Free', trade:'Trade', wanted:'Wanted' };
const views = ['vin','dashboard','front','rear','left','right','front-interior','rear-interior','engine','tires','damage','other'];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = v => v === null || v === undefined ? 'Ask seller' : v === 0 ? 'Free' : new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(v);
const date = v => v ? new Date(v).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}) : 'Not confirmed';
const photoUrl = v => /^https:\/\/static\.wixstatic\.com\/media\/[A-Za-z0-9_~.-]+$/.test(v || '') ? v : '';
const uuid = () => crypto.randomUUID();
const pending = new Map();
let session = {signedIn:false}, inventory = [], nextCursor = null, browseHash = '#browse', loadGeneration = 0;
let draft = null, draftStep = 0, draftRecord = null, saveTimer, saveChain = Promise.resolve(), activeThread = null;
let hlsPlayers = [], sellerStores = [];
let selectedCompare = [], records = new Map(), storeList = [], localCacheAvailable = true;
function readLocal(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { localCacheAvailable = false; return fallback; } }
function writeLocal(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { localCacheAvailable = false; return false; } }
const draftStorageKey = () => `lighthouse-mall-draft:${session.id}`;
selectedCompare = readLocal('lighthouse-mall-compare', []).slice(0,3);
function notify(message, error = false) { notice.hidden = !message; notice.textContent = message; notice.classList.toggle('error', error); if(message.startsWith('Your session expired')){const b=document.createElement('button');b.type='button';b.dataset.action='relogin';b.textContent='Sign in';notice.append(' ',b);} }
function route() { const [screen = 'browse', query = ''] = location.hash.slice(1).split('?'); return {screen, query:new URLSearchParams(query)}; }
function link(screen, query = {}) { return `#${screen}${Object.keys(query).length ? '?'+new URLSearchParams(query) : ''}`; }
function go(screen, query) { location.hash = link(screen, query); }
function enterAccount(screen, id = '', action = '') { const query = new URLSearchParams({view:'marketplace',mallScreen:screen,mallId:id,mallAction:action,mallFilters:JSON.stringify(filterValues())}); location.href = `${SITE}/customer-portal?${query}`; }
window.addEventListener('message', event => {
    if (event.source !== window.parent || event.origin !== PARENT_ORIGIN || event.data?.type !== 'mall:reply') return;
    const p = pending.get(event.data.requestId); if (!p) return;
    pending.delete(event.data.requestId); clearTimeout(p.timer);
    event.data.error ? p.reject(new Error(event.data.error)) : p.resolve(event.data.result);
});
async function api(action, input = {}) {
    const startedHash=location.hash;
    let result;
    try{result=await rawApi(action,input);}catch(error){if(error.message==='SIGN_IN_REQUIRED'){session={signedIn:false};throw new Error('Your session expired. Sign in here, then retry your action.');}throw error;}
    if(['browse','detail','stores','workspace','messages','moderation'].includes(action)&&location.hash!==startedHash)throw new Error('NAVIGATION_CHANGED');
    return result;
}
async function rawApi(action, input = {}) {
    if (!embedded) {
        if (action === 'session') return {signedIn:false};
        if (!['browse','detail','stores'].includes(action)) throw new Error('Open your Marketplace account to continue.');
        const controller = new AbortController(), timer = setTimeout(()=>controller.abort(),15000);
        try {
            const query = new URLSearchParams({action,...input});
            const response = await fetch(`${SITE}/_functions/mallPublic?${query}`,{signal:controller.signal});
            const result = await response.json(); if (!response.ok) throw new Error(result.error || 'The Marketplace could not load. Please retry.'); return result;
        } finally { clearTimeout(timer); }
    }
    const requestId = uuid();
    return new Promise((resolve,reject)=>{
        const timer = setTimeout(()=>{pending.delete(requestId);reject(new Error('Lighthouse did not respond. Your screen is still here; please retry.'));},45000);
        pending.set(requestId,{resolve,reject,timer});
        window.parent.postMessage({type:'mall:rpc',requestId,action,input},PARENT_ORIGIN);
    });
}
async function ensureMember(screen = route().screen, id = route().query.get('id') || '', action = '') {
    if (session.signedIn) return true;
    if (!embedded) { enterAccount(screen,id,action); return false; }
    session = await api('login');
    if (!session.signedIn) throw new Error('Sign-in was not completed. You can keep browsing or try again.');
    return true;
}
function empty(title, text, actions = '') { return `<section class="empty"><h2>${esc(title)}</h2><p>${esc(text)}</p>${actions}</section>`; }
function field(name, label, value = '', type = 'text', extra = '') { return `<label>${esc(label)}<input name="${esc(name)}" type="${type}" value="${esc(value)}" ${extra}></label>`; }
function area(name,label,value = '',extra='') { return `<label ${extra}>${esc(label)}<textarea name="${esc(name)}">${esc(value)}</textarea></label>`; }
function select(name,label,options,value = '') { return `<label>${esc(label)}<select name="${name}">${options.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}" ${v===value?'selected':''}>${esc(l)}</option>`;}).join('')}</select></label>`; }
function action(name,label,data = '',secondary = true) { return `<button type="button" data-action="${name}" ${data} class="${secondary?'secondary':''}">${esc(label)}</button>`; }
function facts(entries) { return `<dl class="facts">${entries.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v ?? 'Unknown')}</dd></div>`).join('')}</dl>`; }
function card(item) {
    const url=photoUrl(item.photos?.[0]?.url);
    return `<article class="card">${url?`<a href="${link('listing',{id:item.id})}" tabindex="-1" aria-hidden="true"><img loading="lazy" src="${url}" alt=""></a>`:'<div class="placeholder" aria-hidden="true">✦</div>'}<div class="card-body"><span class="badge">${esc(labels[item.category]||item.category)}</span><h3><a class="title" href="${link('listing',{id:item.id})}">${esc(item.title)}</a></h3><strong class="price">${money(item.price)}</strong><p>${esc([item.condition,item.city,item.state].filter(Boolean).join(' · '))}</p>${item.vehicle?`<p>${esc(item.vehicle.year)} · ${esc(item.vehicle.mileage ?? 'Unknown')} ${esc(item.vehicle.mileageUnit)} · ${esc(item.vehicle.titleStatus)}</p>`:''}<p class="muted">${item.status==='RESERVED'?'Reserved — check with seller':item.availabilityConfirmedAt?'Seller confirmed '+esc(date(item.availabilityConfirmedAt)):'Availability not yet reconfirmed'}</p><div class="actions">${action('save','Save',`data-id="${item.id}"`)}${item.vehicle?action('compare',selectedCompare.includes(item.id)?'Remove comparison':'Compare',`data-id="${item.id}"`):''}</div></div></article>`;
}
function filterValues() { const r=route(); return Object.fromEntries(['q','location','category','condition','minPrice','maxPrice','storeId','sort'].map(k=>[k,r.query.get(k)||''])); }
function renderBrowseShell() {
    const f=filterValues(); browseHash=location.hash || '#browse';
    content.innerHTML=`<section class="hero"><div><p class="eyebrow">The Lighthouse Marketplace</p><h1>A whole mall.<br>A world of possibilities.</h1><p>Explore stores, local finds, vehicles, and more—all in one Lighthouse.</p><a class="button" href="#sell">Sell something</a></div><div class="hero-art" aria-hidden="true">✦</div></section><form id="search-form" class="search">${field('q','What are you looking for?',f.q,'search','maxlength="150"')}${field('location','City or state',f.location,'text','maxlength="100"')}<button>Search</button></form><div class="categories" aria-label="Categories"><a class="${!f.category?'selected':''}" href="${link('browse',{...f,category:''})}">All finds</a>${Object.entries(labels).map(([k,v])=>`<a class="${f.category===k?'selected':''}" href="${link('browse',{...f,category:k})}">${v}</a>`).join('')}</div><div class="browse-layout"><form id="filter-form" class="filters"><h3>Find your fit</h3>${field('minPrice','Minimum price',f.minPrice,'number','min="0" step="0.01"')}${field('maxPrice','Maximum price',f.maxPrice,'number','min="0" step="0.01"')}${select('condition','Condition',[['','Any condition'],'New','Like new','Good','Fair','For parts'],f.condition)}${select('sort','Sort loaded results',[['','Newest'],['price-low','Price: low to high'],['price-high','Price: high to low']],f.sort)}<button>Apply filters</button><a href="#browse">Clear all filters</a>${action('save-search','Save this search')}${selectedCompare.length?`<a href="#compare">Compare vehicles (${selectedCompare.length})</a>`:''}</form><section aria-label="Search results"><div class="result-heading"><h2>${f.storeId?'Store listings':labels[f.category]||'Discover your next find'}</h2><span id="result-count" class="muted"></span></div><div id="results" class="grid"><p class="loading">Looking for listings…</p></div><div class="actions">${action('more','Load more listings','id="more" hidden')}</div></section></div>`;
}
function renderResults() {
    const grid=document.querySelector('#results'); if(!grid)return;
    const f=filterValues(), items=[...inventory];
    items.sort(f.sort==='price-low'?(a,b)=>(a.price??Infinity)-(b.price??Infinity):f.sort==='price-high'?(a,b)=>(b.price??-1)-(a.price??-1):(a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
    document.querySelector('#result-count').textContent=`${items.length} matching listing${items.length===1?'':'s'} loaded${nextCursor?' · more to check':''}`;
    grid.innerHTML=items.length?items.map(card).join(''):empty('No matching finds yet',nextCursor?'There are more listings to check. Load more, or broaden your filters.':'Try a different city, remove a filter, or post what you are looking for.',`<div class="actions"><a class="button secondary" href="#browse">Clear filters</a><a class="button" href="${link('sell',{category:'wanted'})}">Post a wanted request</a></div>`);
    document.querySelector('#more').hidden=!nextCursor;
}
async function loadBrowse(more=false) {
    const generation=++loadGeneration;
    if(!more){inventory=[];nextCursor=null;renderBrowseShell();}
    const result=await api('browse',{...filterValues(),cursor:more?nextCursor||'':''});
    if(generation!==loadGeneration||route().screen!=='browse')return;
    const byId=new Map([...inventory,...result.items].map(i=>[i.id,i])); inventory=[...byId.values()];nextCursor=result.nextCursor;renderResults();
    const saved=readLocal('mall-scroll',{});if(!more&&saved.hash===location.hash)window.scrollTo(0,saved.y||0);
}
async function allPages(action,input={}) { let result=await api(action,input),items=[...result.items];while(result.nextCursor){result=await api(action,{...input,cursor:result.nextCursor});items.push(...result.items);}return {...result,items,nextCursor:null}; }
async function showStores() {
    const result=await allPages('stores');storeList=result.items;
    content.innerHTML=`<p class="eyebrow">Your online mall</p><h1>Meet the stores.</h1><p>Independent sellers, useful finds, and things made with care.</p><div class="actions"><a class="button" href="#seller">Set up your store</a></div><div class="grid">${storeList.length?storeList.map(s=>`<article class="card"><div class="placeholder" aria-hidden="true">✦</div><div class="card-body"><h2>${esc(s.name)}</h2><p>${esc(s.city)}, ${esc(s.state)}</p><p class="prose">${esc(s.description)}</p><p>${esc(s.fulfillment)}</p><div class="actions"><a class="button" href="${link('browse',{storeId:s.id})}">Visit store</a>${action('follow','Follow',`data-id="${s.id}"`)}</div></div></article>`).join(''):empty('Room for your store','The first stores will appear here after review.')}</div>${result.nextCursor?'<p>More stores are available. Store directory pagination is required before launch.</p>':''}`;
}
async function showListing(id, report=false) {
    const {listing:i,store}=await api('detail',{id});records.set(i.id,i);
    const url=photoUrl(i.photos?.[0]?.url), available=['LIVE','RESERVED'].includes(i.status);
    content.innerHTML=`<a href="${esc(browseHash)}">← Back to results</a><div class="detail"><section>${url?`<img class="cover" id="cover" src="${url}" alt="${esc(i.photos[0].caption||i.title)}"><div class="thumbs">${i.photos.map((p,n)=>`<button type="button" data-action="photo-view" data-url="${esc(photoUrl(p.url))}" data-caption="${esc(p.caption||p.view||i.title)}" aria-label="View photo ${n+1}: ${esc(p.caption||p.view||i.title)}"><img src="${esc(photoUrl(p.url))}" alt=""></button>`).join('')}</div>`:'<div class="placeholder">No item photo</div>'}${i.videoUrl?`<video class="cover" data-playback="${esc(i.videoUrl)}" controls playsinline preload="metadata" aria-label="Seller video"></video>`:i.videoUnavailable?'<p>The video is processing or temporarily unavailable. Please retry shortly.</p>':''}<div class="panel"><h2>About this find</h2><p class="prose">${esc(i.description)}</p></div></section><section><p class="eyebrow">${esc(labels[i.category])}</p><h1>${esc(i.title)}</h1><strong class="price">${money(i.price)}</strong><span class="badge">${esc(i.status)}</span>${facts([['Condition',i.condition||'Not applicable'],['Location',[i.city,i.state].join(', ')],['Availability confirmed',date(i.availabilityConfirmedAt)],['Seller',store?.name||'Independent seller']])}<h3>Pickup &amp; delivery</h3><p class="prose">${esc(i.fulfillment)}</p><div class="actions">${available?action('contact',i.vehicle?'Request a viewing':'Message seller',`data-id="${id}"`,false):'<p>This item is no longer available.</p>'}${action('save','Save listing',`data-id="${id}"`)}</div>${i.vehicle?`<a href="${link('report',{id})}">Read the vehicle condition report →</a><div class="actions">${action('compare',selectedCompare.includes(id)?'Remove comparison':'Add to comparison',`data-id="${id}"`)}<a href="#compare">Compare vehicles</a></div>`:''}${store?`<p><a href="${link('browse',{storeId:store.id})}">Visit ${esc(store.name)}</a></p>`:''}<details><summary>Report a concern</summary><form id="report-form" data-id="${id}">${area('reason','What should Lighthouse review?')}<button>Send report</button></form></details></section></div>${i.vehicle?vehicleReport(i,report):''}`;
    startVideos();
    if(report)document.querySelector('#vehicle-report').scrollIntoView();
}
function vehicleReport(i) {
    const v=i.vehicle;
    return `<section id="vehicle-report" class="panel"><p class="eyebrow">Know more before you go</p><h2>Vehicle condition report</h2><p>Seller-provided details and photos, updated ${esc(date(i.updatedAt))}. This is not an independent inspection or a vehicle-history certification.</p>${facts([['VIN / identifier',v.vin],['Identity source',i.identityCheck?.source==='NHTSA_VPIC'?'NHTSA vPIC':'Seller provided'],['VIN decoded',i.identityCheck?.checkedAt?date(i.identityCheck.checkedAt):'Not checked'],['Vehicle',[v.year,v.make,v.model].join(' ')],['Odometer',`${v.mileage??'Unknown'} ${v.mileageUnit}`],['Title — seller disclosure',v.titleStatus],['Running / driving',v.running],['History provider','Not connected — history unknown'],['Independent inspection','Not provided'],['Automated photo assessment','Not provided']])}${[['Warning lights',v.warningLights],['Known mechanical issues',v.mechanicalIssues],['Accidents and damage',v.damage]].map(([k,val])=>`<details open><summary>${k}</summary><p class="prose">${esc(val||'Unknown')}</p></details>`).join('')}<details><summary>Photo coverage and missing evidence</summary>${views.filter(view=>view!=='other').map(view=>`<p><strong>${esc(view.replaceAll('-',' '))}:</strong> ${i.photos.some(p=>p.view===view)?'Photo supplied':esc(v.photoExceptions?.[view]||'Not supplied')}</p>`).join('')}</details>${v.identifierException?`<p>Older identifier explanation: ${esc(v.identifierException)}</p>`:''}<p>Confirm the identifier, title, mileage and condition yourself before agreeing to buy.</p></section>`;
}
async function showCompare() {
    const results=await Promise.allSettled(selectedCompare.map(id=>api('detail',{id})));
    const items=results.map((r,n)=>r.status==='fulfilled'?r.value.listing:{id:selectedCompare[n],title:'Listing unavailable',unavailable:true});
    content.innerHTML=`<h1>Compare vehicles.</h1><p>Keep 2–3 possibilities side by side. Unknown information stays unknown.</p>${items.length?`<div class="panel scroll-table"><table><thead><tr><th>What matters</th>${items.map(i=>`<th>${i.unavailable?esc(i.title):`<a href="${link('listing',{id:i.id})}">${esc(i.title)}</a>`}${action('compare','Remove',`data-id="${i.id}"`)}</th>`).join('')}</tr></thead><tbody>${[['Price',i=>money(i.price)],['Mileage',i=>i.vehicle?`${i.vehicle.mileage??'Unknown'} ${i.vehicle.mileageUnit}`:'Unknown'],['Title disclosure',i=>i.vehicle?.titleStatus],['Known issues',i=>i.vehicle?.mechanicalIssues],['Accidents / damage',i=>i.vehicle?.damage],['History',()=> 'Unknown — provider not connected'],['Inspection',()=> 'Not provided'],['Availability',i=>i.status]].map(([label,fn])=>`<tr><th>${label}</th>${items.map(i=>`<td>${esc(i.unavailable?'Unavailable':fn(i)||'Unknown')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:empty('Choose a couple of vehicles','Use Compare on a vehicle listing to add it here.',`<a class="button" href="${link('browse',{category:'vehicles'})}">Browse vehicles</a>`)}`;
}
function currentDraft() { return { draft, draftStep, draftRecord }; }
function persistDraft() { writeLocal(draftStorageKey(),currentDraft()); }
async function saveDraft() {
    if(!draft||!session.signedIn)return;
    const snapshot=structuredClone(draft), currentKey=draft.draftKey;
    saveChain=saveChain.catch(()=>{}).then(async()=>{
        const result=await api('draft',{draftKey:snapshot.draftKey,listing:snapshot,version:draftRecord?.version});
        if(draft?.draftKey===currentKey){draftRecord=result;persistDraft();const status=document.querySelector('#draft-status');if(status)status.textContent='Draft saved to your account.';}
        return result;
    });
    return saveChain;
}
function captureDraft(form) {
    for(const [name,value] of new FormData(form)) { if(name.startsWith('vehicle.')){draft.vehicle ||= {};draft.vehicle[name.slice(8)]=value;}else if(name.startsWith('exception.')){draft.vehicle ||= {};draft.vehicle.photoExceptions ||= {};draft.vehicle.photoExceptions[name.slice(10)]=value;}else if(!['photo-files','video-file'].includes(name))draft[name]=value; }
    for(const name of ['authorityCertified','termsAccepted','privacyAcknowledged']){if(form.elements[name])draft[name]=form.elements[name].checked;}
    persistDraft();
}
async function showSell() {
    if(!await ensureMember('sell'))return;
    sellerStores=(await fetchWorkspace('store')).items.filter(r=>r.data.status==='LIVE');
    if(!draft){const saved=readLocal(draftStorageKey(),null);if(saved?.draft){({draft,draftStep,draftRecord}=saved);}else{draft={draftKey:uuid(),category:route().query.get('category')||'home-goods',photos:[],vehicle:{photoExceptions:{}},price:''};draftStep=0;draftRecord=null;}}
    renderSell();
}
function renderSell() {
    const names=['Item details','Photos','Price & pickup','Review'],d=draft,v=d.vehicle||{};
    let fields='';
    if(draftStep===0)fields=`${select('category','What are you listing?',Object.entries(labels),d.category)}${field('title','Listing title',d.title,'text','maxlength="180" required minlength="5"')}${select('condition','Condition',[['','Choose condition'],'New','Like new','Good','Fair','For parts','Not applicable'],d.condition)}${area('description','Describe the item, what is included and any defects',d.description,'class="full"')}${d.category==='vehicles'?`<div class="full"><h2>Vehicle details</h2><p>Be specific. If you do not know an answer, write Unknown.</p></div>${field('vehicle.vin','VIN / vehicle identifier',v.vin,'text','maxlength="40" required')}${field('vehicle.year','Year',v.year,'number','min="1886" required')}${field('vehicle.make','Make',v.make,'text','required')}${field('vehicle.model','Model',v.model,'text','required')}<div class="full">${action('decode-vin','Check VIN & fill vehicle details','',false)}<p>NHTSA checks identity and specifications, not condition or accident history.</p></div>${field('vehicle.mileage','Odometer reading',v.mileage,'number','min="0" required')}${select('vehicle.mileageUnit','Odometer unit',[['mi','Miles'],['km','Kilometres']],v.mileageUnit||'mi')}${select('vehicle.titleStatus','Title — your disclosure',[['','Choose'],'Clean title','Salvage','Rebuilt','Lien recorded','No title','Unknown'],v.titleStatus)}${select('vehicle.running','Running / driving',[['','Choose'],'Runs and drives','Runs, does not drive','Does not run','Unknown'],v.running)}${area('vehicle.warningLights','Warning lights (None or Unknown if applicable)',v.warningLights)}${area('vehicle.mechanicalIssues','Known mechanical issues (None or Unknown if applicable)',v.mechanicalIssues)}${area('vehicle.damage','Accidents / damage (None or Unknown if applicable)',v.damage)}${area('vehicle.identifierException','Pre-1981 identifier explanation, if needed',v.identifierException)}`:''}`;
    if(draftStep===1)fields=`<div class="full"><h2>Let the pictures do the talking.</h2><p>Add up to 20 photos. JPEG, PNG or WebP; up to 20 MB each before conversion. We resize images and remove location metadata. Upload photos of the item only—keep title documents, IDs and addresses private.</p>${d.category==='wanted'?'<p>A wanted request does not require an item photo.</p>':''}<label>Choose photos<input name="photo-files" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><div class="panel"><h3>A short look around</h3><p>Optional: one MP4 video, up to 60 seconds and 8 MB. Use a short, compressed clip that shows the item honestly.</p>${d.videoId?`<p>Video uploaded (${Math.round(d.videoDuration||0)} seconds). Processing and owner review happen before publication.</p>${action('video-remove','Remove video')}`:'<label>Choose a video<input name="video-file" type="file" accept="video/mp4"></label>'}<p id="video-status" role="status"></p></div><p id="upload-status" role="status"></p><div class="grid" id="photo-grid">${(d.photos||[]).map((p,n)=>`<div class="upload-card">${photoUrl(p.url)?`<img src="${photoUrl(p.url)}" alt="${esc(p.caption||'Listing photo')}">`:''}<label>Photo caption<input data-photo-caption="${n}" value="${esc(p.caption)}" maxlength="180"></label>${d.category==='vehicles'?`<label>Vehicle view<select data-photo-view="${n}">${views.map(view=>`<option ${p.view===view?'selected':''}>${view}</option>`).join('')}</select></label>`:''}<div class="actions">${n?action('photo-up','Move earlier',`data-index="${n}"`):'<span class="badge">Cover photo</span>'}${action('photo-remove','Remove',`data-index="${n}"`)}</div></div>`).join('')}</div></div>${d.category==='vehicles'?`<div class="full"><details><summary>Missing a required view? Explain here.</summary><p>Required: VIN, dashboard, all four exterior sides, front and rear interior, engine and tires. Photograph any disclosed damage. Exceptions are reviewed by Lighthouse.</p><div class="form-grid">${views.filter(x=>!['damage','other'].includes(x)).map(view=>area('exception.'+view,view.replaceAll('-',' '),v.photoExceptions?.[view])).join('')}</div></details></div>`:''}`;
    if(draftStep===2)fields=`${select('storeId','List in your store (optional)',[['','Independent listing'],...sellerStores.map(s=>[s.id,s.data.name])],d.storeId||'')}${field('price','Asking price (USD)',d.category==='free'?0:d.price,'number','min="0" step="0.01"')}${field('city','City',d.city,'text','required maxlength="100"')}${field('state','State (two letters)',d.state,'text','required minlength="2" maxlength="2"')}${area('fulfillment','Pickup, delivery, production time and any charges',d.fulfillment,'class="full"')}`;
    if(draftStep===3)fields=`<div class="full"><h2>${esc(d.title||'Your listing')}</h2><strong class="price">${money(d.price===''?null:Number(d.price))}</strong><p>${esc(labels[d.category])} · ${esc(d.city)} ${esc(d.state)}</p><p class="prose">${esc(d.description)}</p><p>${d.photos.length} photos · ${esc(d.fulfillment)}</p><p>Your listing stays unpublished until Lighthouse reviews it.</p></div>${[['authorityCertified',d.category==='wanted'?'This is a genuine request.':'I own this item or have authority to list it.'],['termsAccepted','I accept the Marketplace terms.'],['privacyAcknowledged','I understand my account and conversations stay private; my listing details and photos will be public after approval.']].map(([name,label])=>`<label class="check full"><input name="${name}" type="checkbox" ${d[name]?'checked':''} required>${esc(label)}</label>`).join('')}<a href="#help" class="full">Read Marketplace terms</a>`;
    content.innerHTML=`<a href="#seller">← My listings</a><h1>Make room for something new.</h1><p>Your listing, one step at a time.</p><div class="steps">${names.map((name,n)=>`<span class="${n===draftStep?'active':''}" ${n===draftStep?'aria-current="step"':''}>${n+1}. ${name}</span>`).join('')}</div><form id="listing-form" class="panel"><div class="form-grid">${fields}</div><p id="draft-status" class="muted" role="status">${draftRecord?'Draft saved to your account.':'Your draft will save as you go.'}${!localCacheAvailable?' Browser backup is unavailable; use Save draft before leaving.':''}</p><div class="actions">${draftStep?action('previous','Back'):''}${action('draft-save','Save draft')}<button>${draftStep===3?'Submit for review':'Continue'}</button></div></form>`;
}
async function uploadFiles(files) {
    if(draft.photos.length+files.length>20)throw new Error('Use no more than 20 photos.');
    await saveDraft();
    const status=document.querySelector('#upload-status');
    for(const [n,file] of [...files].entries()) {
        status.textContent=`Preparing photo ${n+1} of ${files.length}…`;
        if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)throw new Error('Choose JPEG, PNG or WebP photos smaller than 20 MB. Successful uploads are saved; select the failed photo again to retry.');
        const bitmap=await createImageBitmap(file),scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
        const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
        const base64=canvas.toDataURL('image/png').split(',')[1];
        status.textContent=`Uploading photo ${n+1} of ${files.length}…`;
        const uploaded=await api('photo',{listingId:draftRecord.id,uploadKey:uuid(),base64});
        draft.photos.push({mediaId:uploaded.id,url:uploaded.url,caption:'',view:'other'});persistDraft();await saveDraft();
    }
    renderSell();notify('Photos uploaded and draft saved.');
}
async function fetchWorkspace(kind) { const result=await allPages('workspace',{kind});result.items.forEach(r=>records.set(r.id,r));return result; }
async function showSeller() {
    if(!await ensureMember('seller'))return;
    const [listings,stores]=await Promise.all([fetchWorkspace('listing'),fetchWorkspace('store')]);const store=stores.items[0];
    content.innerHTML=`<p class="eyebrow">Your corner of the mall</p><h1>My listings &amp; store.</h1><p>Manage your own items and storefront here.</p><div class="actions">${action('new-listing','List something new','',false)}${(draft || readLocal(draftStorageKey(),null)?.draft) ? '<a class="button secondary" href="#sell">Resume current draft</a>' : ''}</div><div class="grid">${listings.items.length?listings.items.map(r=>`<article class="card"><div class="card-body"><span class="badge">${esc(r.data.status)}</span><h3>${esc(r.data.title||'Untitled draft')}</h3><p>${money(r.data.price)}</p>${r.data.reviewNote?`<p>${esc(r.data.reviewNote)}</p>`:''}<div class="actions">${['DRAFT','REJECTED'].includes(r.data.status)?action('edit-draft','Continue editing',`data-id="${r.id}"`):['LIVE','RESERVED'].includes(r.data.status)?`${action('listing-status','Confirm available',`data-id="${r.id}" data-status="LIVE"`)}${action('listing-status','Mark reserved',`data-id="${r.id}" data-status="RESERVED"`)}${action('listing-status','Mark sold',`data-id="${r.id}" data-status="SOLD"`)}`:''}</div></div></article>`).join(''):empty('Your first listing starts here','Create a listing, add photos and submit it for review.')}</div><section class="panel"><h2>${store?'Your store':'Open your storefront'}</h2>${store?`<p class="badge">${esc(store.data.status)}</p>`:''}<form id="store-form"><div class="form-grid">${field('name','Store name',store?.data.name,'text','required minlength="3"')}${field('city','City',store?.data.city,'text','required')}${field('state','State',store?.data.state,'text','required minlength="2" maxlength="2"')}${area('description','What does your store offer?',store?.data.description)}${area('fulfillment','Pickup, delivery, hours or production time',store?.data.fulfillment)}</div><input type="hidden" name="version" value="${store?.version||''}"><div class="actions"><button>Submit store for review</button></div></form></section>`;
}
async function showSaved() {
    if(!await ensureMember('saved'))return;
    const groups=await Promise.all(['saved','search','follow'].map(fetchWorkspace));
    content.innerHTML=`<h1>Keep the good finds close.</h1>${groups.map((g,n)=>`<section class="panel"><h2>${['Saved listings','Saved searches','Followed stores'][n]}</h2>${g.items.filter(r=>r.data.enabled).map(r=>`<div class="row"><a href="${n===0?link('listing',{id:r.data.targetId}):n===1?link('browse',r.data.filters):link('browse',{storeId:r.data.targetId})}">${esc(r.data.title)}</a>${action('unsave','Remove',`data-id="${r.id}"`)}</div>`).join('')||'<p>Nothing saved here yet.</p>'}</section>`).join('')}`;
}
async function showMessages(id) {
    if(!await ensureMember('messages',id))return;
    if(!id){const [threads,viewings]=await Promise.all([fetchWorkspace('thread'),fetchWorkspace('viewing')]);content.innerHTML=`<h1>Your conversations.</h1><div class="panel">${threads.items.length?threads.items.map(r=>`<p><a href="${link('messages',{id:r.id})}">${esc(r.data.title)}</a></p>`).join(''):empty('No conversations yet','Open a listing and choose Message seller or Request a viewing.')}</div><h2>Viewings</h2>${viewings.items.map(viewingCard).join('')||'<p>No viewing requests yet.</p>'}`;return;}
    const result=await allPages('messages',{threadId:id});activeThread=result.thread;const current=readLocal(`mall-message:${session.id}:${id}`,{body:'',messageKey:uuid()});
    content.innerHTML=`<div class="conversation"><a href="#messages">← All conversations</a><h1>${esc(result.thread.data.title)}</h1>${result.listing?`<a href="${link('listing',{id:result.listing.id})}">View listing · ${esc(result.listing.status)}</a>`:'<p>This listing is no longer public. Your conversation is still available.</p>'}<div>${result.items.map(r=>`<article class="message ${r.ownerId===session.id?'mine':''}"><small>${r.ownerId===session.id?'You':'Other participant'} · ${esc(date(r.data.createdAt))}</small><p>${esc(r.data.body)}</p></article>`).join('')||'<p class="panel">Ask a useful question, confirm pickup details or arrange a viewing.</p>'}</div><form id="message-form" class="panel" data-key="${current.messageKey}">${area('body','Your message',current.body)}<div class="actions"><button>Send message</button>${action('refresh','Refresh conversation')}</div></form>${result.thread.data.buyerId===session.id?`<details><summary>Request a viewing</summary><form id="viewing-form" class="panel">${field('proposedAt','Proposed date & time (your local time)','','datetime-local','required step="1800"')}${field('location','Suggested meeting place','','text','required minlength="5"')}<p>Choose an hour or half-hour start. Viewings reserve a 30-minute slot when confirmed. Avoid sharing your home address unless needed.</p><button>Request viewing</button></form></details>`:''}</div>`;
}
function viewingCard(r){const d=r.data;return `<section class="panel"><h3>${esc(d.title)}</h3><span class="badge">${esc(d.status)}</span><p>Proposed: ${esc(date(d.proposedAt))}<br>Confirmed: ${esc(date(d.confirmedAt))}<br>${esc(d.location)}</p><p>Times are displayed in your device’s time zone.</p>${!['CANCELLED','COMPLETED'].includes(d.status)?`<div class="actions">${d.proposedBy!==session.id&&['REQUESTED','RESCHEDULE_REQUESTED'].includes(d.status)?action('viewing-action','Confirm proposed time',`data-id="${r.id}" data-command="confirm"`):''}${action('viewing-action','Cancel viewing',`data-id="${r.id}" data-command="cancel"`)}${d.status==='CONFIRMED'&&d.sellerId===session.id?action('viewing-action','Mark completed',`data-id="${r.id}" data-command="complete"`):''}</div><form class="reschedule-form" data-id="${r.id}">${field('proposedAt','Propose another time','','datetime-local','required step="1800"')}<button>Propose reschedule</button></form>`:''}</section>`;}
async function showAccount(){content.innerHTML=`<h1>Your Marketplace account.</h1>${session.signedIn?`<p>Welcome, ${esc(session.name)}.</p><p>Marketplace customer features do not require a subscription payment. Items offered by sellers have their own prices.</p><div class="actions"><a class="button" href="#saved">Saved finds</a><a class="button secondary" href="#messages">Messages &amp; viewings</a><a class="button secondary" href="#seller">My listings &amp; store</a>${session.owner?'<a class="button secondary" href="#owner">Owner review</a>':''}</div>`:empty('One account for your mall','Sign in to save finds, contact sellers or manage your own listings.',action('login','Sign in','',false))}`;}
async function showOwner(){if(!await ensureMember('owner'))return;if(!session.owner)throw new Error('Only the Lighthouse owner can open moderation.');const result=await allPages('moderation',{kind:route().query.get('kind')||'listing'});result.items.forEach(r=>records.set(r.id,r));content.innerHTML=`<h1>Owner review.</h1><div class="categories"><a href="#owner?kind=listing">Listings</a><a href="#owner?kind=store">Stores</a><a href="#owner?kind=report">Reports</a></div>${result.items.map(r=>`<section class="panel"><span class="badge">${esc(r.kind)}</span><h2>${esc(r.data.title||r.data.name)}</h2><p class="prose">${esc(r.data.description||r.data.reason)}</p>${r.kind==='listing'?`${facts([['Price',money(r.data.price)],['Location',r.data.city+' '+r.data.state],['Condition',r.data.condition]])}<p>${esc(r.data.fulfillment)}</p><div class="grid">${(r.data.resolvedPhotos||[]).map(p=>`<figure><img class="cover" src="${esc(photoUrl(p.url))}" alt="${esc(p.caption||p.view)}"><figcaption>${esc(p.view)}: ${esc(p.caption)}</figcaption></figure>`).join('')}</div>${r.data.vehicle?`<pre class="prose">${esc(JSON.stringify(r.data.vehicle,null,2))}</pre>`:''}`:''}${r.videoUrl?`<video class="cover" data-playback="${esc(r.videoUrl)}" controls playsinline preload="metadata" aria-label="Submitted seller video"></video>`:r.videoUnavailable?'<p>Video is still processing. Retry before approving.</p>':''}<form class="review-form" data-id="${r.id}">${r.data.videoFileUrl?'<label class="check"><input name="videoReviewed" type="checkbox">I watched the full video and checked its length and content.</label>':''}${area('note','Review notes / reason')}${select('decision','Decision',r.kind==='report'?['RESOLVE']:['APPROVE','REJECT','REMOVE'])}<button>Record decision</button></form></section>`).join('')||empty('Nothing waiting here','New submissions and reports will appear here.')}`;}
function showHelp(){content.innerHTML=`<p class="eyebrow">A clear way forward</p><h1>Marketplace help.</h1><section class="panel"><h2>Shop with the details in front of you.</h2><details open><summary>How do I buy something?</summary><p>Browse without signing in. Open a listing to read the price, condition, photos and pickup or delivery details. Sign in to message the seller or request a viewing. Arrange payment with the seller; this release does not provide an integrated checkout or purchase protection.</p></details><details><summary>How do stores and listings work?</summary><p>Sellers manage their own listings and store. New submissions are reviewed before appearing publicly. Approval to display a listing is not a guarantee of quality, ownership or condition.</p></details><details><summary>What does a vehicle report tell me?</summary><p>The report combines NHTSA VIN identity data, when available, with the seller’s mileage, condition answers and photos. Missing information is marked unknown. Accident/title history, automated photo analysis and independent inspections are not currently connected. Arrange an inspection if you need one before purchasing.</p></details><details><summary>What can I list?</summary><p>List goods you own or are authorized to sell. Describe defects honestly and use photos you have permission to share. Do not post illegal goods, stolen items, deceptive offers or private documents. Wanted requests must be genuine. Lighthouse may reject or remove misleading or inappropriate content.</p></details><details><summary>Where is my draft?</summary><p>After signing in, open My listings &amp; store. Drafts save to your account. Keep the page open until you see the saved confirmation. Browser backups may be unavailable in private browsing.</p></details><details><summary>Complimentary access and permissions</summary><p>Complimentary customer access does not grant website editing, backend access or owner permissions. Marketplace items may still cost money. Creating a seller listing gives you control over your own content only.</p></details><details><summary>How do I report a problem?</summary><p>Use Report a concern on the listing. If a screen fails, retry without reloading first to keep your input. You can always return to Lighthouse Home.</p><a href="${SITE}/contact" target="_top">Contact Lighthouse</a></details></section>`;}
async function startVideos(){
    hlsPlayers.forEach(p=>p.destroy());hlsPlayers=[];
    for(const video of document.querySelectorAll('video[data-playback]')){
        const url=video.dataset.playback;let parsed;try{parsed=new URL(url);}catch{return;}
        if(parsed.protocol!=='https:'||!['repackager.wixmp.com','video.wixstatic.com'].includes(parsed.hostname))return;
        if(video.canPlayType('application/vnd.apple.mpegurl'))video.src=url;
        else {try{const Hls=await loadHls();if(!video.isConnected)continue;if(Hls.isSupported()){const player=new Hls({autoStartLoad:false});player.loadSource(url);player.attachMedia(video);video.addEventListener('play',()=>player.startLoad(),{once:true});hlsPlayers.push(player);}}catch(error){notify(error.message,true);}}
    }
}
async function render(){const generation=++loadGeneration;const r=route();notify('');document.querySelectorAll('[data-screen]').forEach(a=>{if(a.dataset.screen===r.screen)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});if(r.screen!=='sell'){clearTimeout(saveTimer);if(draft&&session.signedIn)persistDraft();}content.innerHTML='<p class="loading">Opening…</p>';try{switch(r.screen){case'browse':await loadBrowse();break;case'stores':await showStores();break;case'listing':case'report':await showListing(r.query.get('id'),r.screen==='report');break;case'compare':await showCompare();break;case'sell':await showSell();break;case'seller':await showSeller();break;case'saved':await showSaved();break;case'messages':await showMessages(r.query.get('id'));break;case'account':await showAccount();break;case'owner':await showOwner();startVideos();break;case'help':showHelp();break;default:go('browse');}if(generation===loadGeneration)content.focus({preventScroll:true});}catch(error){if(error.message==='NAVIGATION_CHANGED')return;content.innerHTML=empty('Let’s get you back on track.',error.message,`<div class="actions">${action('refresh','Try again','',false)}<a class="button secondary" href="#browse">Browse Marketplace</a><a href="${SITE}/" data-home>Lighthouse Home</a></div>`);}}
document.addEventListener('click',async event=>{
    const home=event.target.closest('[data-home]');if(home&&embedded){event.preventDefault();parent.postMessage({type:'mall:home'},PARENT_ORIGIN);return;}
    const anchor=event.target.closest('a[href^="#listing"]');if(anchor&&route().screen==='browse')writeLocal('mall-scroll',{hash:location.hash,y:window.scrollY});
    const button=event.target.closest('[data-action]');if(!button)return;const a=button.dataset.action,id=button.dataset.id;button.disabled=true;
    try{switch(a){
        case'refresh':await render();break;
        case'relogin':if(await ensureMember()){notify('Signed in. You can retry your action.');}break;
        case'login':if(await ensureMember('account'))await render();break;
        case'more':await loadBrowse(true);break;
        case'save':if(await ensureMember('listing',id,'save')){await api('toggle',{kind:'saved',id,enabled:true});notify('Saved to your account.');}break;
        case'follow':if(await ensureMember('stores',id,'follow')){await api('toggle',{kind:'follow',id,enabled:true});notify('Store followed.');}break;
        case'save-search':if(await ensureMember('browse','','save-search')){await api('toggle',{kind:'search',filters:filterValues(),enabled:true});notify('Search saved. Find it under Saved.');}break;
        case'unsave':{const r=records.get(id);await api('toggle',{kind:r.kind,id:r.data.targetId,filters:r.data.filters,enabled:false,version:r.version});await showSaved();break;}
        case'compare':selectedCompare=selectedCompare.includes(id)?selectedCompare.filter(x=>x!==id):selectedCompare.length<3?[...selectedCompare,id]:(()=>{throw new Error('Compare up to three vehicles. Remove one first.');})();writeLocal('lighthouse-mall-compare',selectedCompare);if(route().screen==='compare')await showCompare();else {button.textContent=selectedCompare.includes(id)?'Remove comparison':'Compare';notify(`${selectedCompare.length} vehicle${selectedCompare.length===1?'':'s'} in your comparison. Open Compare vehicles to review them.`);}break;
        case'photo-view':document.querySelector('#cover').src=button.dataset.url;document.querySelector('#cover').alt=button.dataset.caption;break;
        case'contact':if(await ensureMember('listing',id,'contact')){const thread=await api('contact',{listingId:id});go('messages',{id:thread.id});}break;
        case'decode-vin':captureDraft(document.querySelector('#listing-form'));{const check=await api('decode',{vin:draft.vehicle?.vin,year:draft.vehicle?.year});draft.vehicle={...draft.vehicle,vin:check.vin,year:String(check.year),make:check.make,model:check.model};persistDraft();await saveDraft();renderSell();notify('NHTSA vehicle details filled in. Continue with the condition questions.');}break;
        case'previous':captureDraft(document.querySelector('#listing-form'));draftStep=Math.max(0,draftStep-1);persistDraft();renderSell();break;
        case'draft-save':captureDraft(document.querySelector('#listing-form'));await saveDraft();notify('Draft saved to your account.');break;
        case'resume':await resumeAction();break;
        case'video-remove':draft.videoId='';draft.videoDuration=0;await saveDraft();renderSell();break;
        case'photo-remove':draft.photos.splice(Number(button.dataset.index),1);await saveDraft();renderSell();break;
        case'photo-up':{const n=Number(button.dataset.index);[draft.photos[n-1],draft.photos[n]]=[draft.photos[n],draft.photos[n-1]];await saveDraft();renderSell();break;}
        case'new-listing':draft={draftKey:uuid(),category:'home-goods',photos:[],vehicle:{photoExceptions:{}},price:''};draftStep=0;draftRecord=null;persistDraft();go('sell');break;
        case'edit-draft':{const r=records.get(id);draft={...r.data,draftKey:r.data.draftKey||id,photos:(r.data.photos||[]).map(p=>({...p,url:r.data.resolvedPhotos?.find(x=>x.mediaId===p.mediaId)?.url||p.url||''}))};draftRecord=r;draftStep=0;persistDraft();go('sell');break;}
        case'listing-status':{const r=records.get(id);await api('listingStatus',{id,status:button.dataset.status,version:r.version});await showSeller();notify('Listing status updated.');break;}
        case'viewing-action':{const r=records.get(id);await api('updateViewing',{id,action:button.dataset.command,version:r.version});await showMessages();notify('Viewing updated.');break;}
    }}catch(error){notify(error.message,true);}finally{button.disabled=false;}
});
document.addEventListener('input',event=>{
    const form=event.target.closest('#listing-form');if(form&&draft){captureDraft(form);const n=event.target.dataset.photoCaption;if(n!==undefined)draft.photos[Number(n)].caption=event.target.value;persistDraft();clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveDraft().catch(e=>notify(e.message,true)),1200);}
    if(event.target.closest('#message-form')){const f=event.target.closest('form');writeLocal(`mall-message:${session.id}:${activeThread.id}`,{body:f.elements.body.value,messageKey:f.dataset.key});}
});
document.addEventListener('change',async event=>{try{if(event.target.name==='category'&&draft){captureDraft(event.target.form);renderSell();}if(event.target.dataset.photoView!==undefined){draft.photos[Number(event.target.dataset.photoView)].view=event.target.value;await saveDraft();}if(event.target.name==='photo-files'){await uploadFiles(event.target.files);}if(event.target.name==='video-file'){await uploadVideoFile(event.target.files[0]);}}catch(error){notify(error.message,true);}});
document.addEventListener('submit',async event=>{
    event.preventDefault();const form=event.target,button=form.querySelector('button:not([type="button"])'),values=Object.fromEntries(new FormData(form));if(button)button.disabled=true;
    try{
        if(form.id==='search-form'||form.id==='filter-form'){go('browse',{...filterValues(),...values});}
        else if(form.id==='listing-form'){clearTimeout(saveTimer);captureDraft(form);await saveDraft();if(draftStep<3){draftStep++;persistDraft();renderSell();}else{await api('submit',{id:draftRecord.id,version:draftRecord.version});draft=null;draftRecord=null;writeLocal(draftStorageKey(),null);go('seller');notify('Submitted for review. Your listing is not public yet.');}}
        else if(form.id==='store-form'){await api('saveStore',{...values,version:values.version?Number(values.version):undefined});await showSeller();notify('Store submitted for review.');}
        else if(form.id==='message-form'){await api('send',{threadId:activeThread.id,body:values.body,messageKey:form.dataset.key});writeLocal(`mall-message:${session.id}:${activeThread.id}`,{body:'',messageKey:uuid()});await showMessages(activeThread.id);notify('Message sent.');}
        else if(form.id==='viewing-form'){form.dataset.key ||= uuid();await api('requestViewing',{threadId:activeThread.id,proposedAt:new Date(values.proposedAt).toISOString(),location:values.location,requestKey:form.dataset.key});go('messages');notify('Viewing requested. Wait for the seller to confirm.');}
        else if(form.classList.contains('reschedule-form')){const r=records.get(form.dataset.id);await api('updateViewing',{id:r.id,version:r.version,action:'propose',proposedAt:new Date(values.proposedAt).toISOString()});await showMessages();notify('New time proposed; the other participant must confirm.');}
        else if(form.id==='report-form'){if(await ensureMember('listing',form.dataset.id)){form.dataset.key ||= uuid();await api('report',{listingId:form.dataset.id,reason:values.reason,reportKey:form.dataset.key});form.reset();notify('Report received for owner review.');}}
        else if(form.classList.contains('review-form')){const r=records.get(form.dataset.id);await api('review',{id:r.id,version:r.version,...values,videoReviewed:form.elements.videoReviewed?.checked===true});await showOwner();startVideos();notify('Review decision recorded.');}
    }catch(error){notify(error.message,true);}finally{if(button)button.disabled=false;}
});
window.addEventListener('hashchange',()=>render());
window.addEventListener('beforeunload',()=>{if(draft)persistDraft();});
let returnFilters={};try{const f=JSON.parse(params.get('filters')||'{}');if(f&&typeof f==='object'&&!Array.isArray(f))returnFilters=Object.fromEntries(['q','location','category','condition','minPrice','maxPrice','storeId','sort'].filter(k=>typeof f[k]==='string').map(k=>[k,f[k].slice(0,150)]));}catch{}
if(Object.keys(returnFilters).length)browseHash=link('browse',returnFilters);
if(!location.hash){const s=params.get('screen')||'browse',id=params.get('id');history.replaceState(null,'',link(s,s==='browse'?returnFilters:id?{id}:{}));}
try{session=await api('session');}catch(error){notify(error.message,true);}
await render();

async function uploadVideoFile(file){
    if(!file)return;
    if(file.type!=='video/mp4'||file.size>8*1024*1024)throw new Error('Choose an MP4 video smaller than 8 MB.');
    await saveDraft();
    document.querySelector('#video-status').textContent='Uploading video… Keep this page open.';
    const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('The video could not be read. Please retry.'));reader.readAsDataURL(file);});
    const result=await api('video',{listingId:draftRecord.id,uploadKey:uuid(),base64});
    draft.videoId=result.id;draft.videoDuration=result.duration;persistDraft();await saveDraft();renderSell();notify('Video uploaded. It will be reviewed before publication.');
}
let continuation=params.get('action')||'';
async function resumeAction(){
    if(!continuation)return;
    if(!await ensureMember(route().screen,params.get('id')||''))return;
    const id=params.get('id')||'';
    if(continuation==='save')await api('toggle',{kind:'saved',id,enabled:true});
    else if(continuation==='follow')await api('toggle',{kind:'follow',id,enabled:true});
    else if(continuation==='save-search')await api('toggle',{kind:'search',filters:returnFilters,enabled:true});
    else if(continuation==='contact'){const thread=await api('contact',{listingId:id});continuation='';go('messages',{id:thread.id});return;}
    continuation='';notify('Done—your selection is saved to your account.');
}
if(continuation){try{await resumeAction();}catch(error){notify(error.message,true);const retry=document.createElement('button');retry.type='button';retry.dataset.action='resume';retry.textContent='Sign in and continue';notice.append(' ',retry);}}
