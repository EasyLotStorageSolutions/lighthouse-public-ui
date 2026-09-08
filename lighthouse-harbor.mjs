import {sections} from './lighthouse-guide-data.mjs?v=20260908-harbor-names1';
import {youtubeId} from './lighthouse-guide-data.mjs?v=20260908-harbor-names1';
import {featuredVideos} from './lighthouse-featured-videos.mjs?v=1';
import {restoreDestination} from './lighthouse-destination-recovery.mjs?v=20260908-recovery1';
const root=document.querySelector('main');
const sourceIds={storage:'storage',employment:'lighthouse-work',social:'lighthouse-world',marketplace:'marketplace-showcase',music:'lighthouse-video-studio'};
const descriptors={storage:'Space for your next chapter',employment:'Opportunity starts with people',social:'A place to belong',marketplace:'Discover something unexpected',music:'Make room for your imagination'};
const paths={storage:[['Find storage','/find-storage'],['My rental & payments','/customer-portal?view=storage'],['For operators','/find-storage?area=operators']],employment:[['Find work','/customer-portal?view=work'],['Hire people','/pricing-plans?for=employer']],social:[['Explore the social preview','https://lighthouse-world-entrance.sreichert21.chatgpt.site/social.html']],marketplace:[['Explore Marketplace','/marketplace'],['Sell something','/sell-something'],['Auction Hall · view only','/auction-hall']],music:[['Open the Studio','/customer-portal?view=studio']]};
const base=new URL('./assets/lighthouse-guides/',import.meta.url);
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;}
function button(text,cls,fn){const b=el('button',cls,text);b.type='button';b.addEventListener('click',fn);return b;}
let prefs={theme:'sunset',favorites:[],remember:false,last:'home',still:false};
try{const saved=JSON.parse(localStorage.getItem('lighthouse-harbor-v1')||'null');if(saved&&typeof saved==='object'){prefs={...prefs,theme:['day','sunset','night'].includes(saved.theme)?saved.theme:'sunset',favorites:Array.isArray(saved.favorites)?saved.favorites.filter(id=>sourceIds[id]):[],remember:saved.remember===true,last:sourceIds[saved.last]?saved.last:'home',still:saved.still===true};}}catch{}
function save(){try{localStorage.setItem('lighthouse-harbor-v1',JSON.stringify(prefs));}catch{announcement.textContent='Your browser cannot save preferences. You can still explore everything.';}}
const original=[...root.children];
const app=el('div','harbor-app');app.dataset.theme=prefs.theme;app.dataset.view='home';app.classList.toggle('harbor-still',prefs.still);
const scene=el('div','harbor-scene');scene.setAttribute('aria-hidden','true');scene.append(el('div','harbor-atmosphere'),el('div','harbor-beam'),el('div','harbor-lantern'),el('div','harbor-water'));
const header=el('header','harbor-header');
const home=button('Lighthouse Home','harbor-brand',()=>go('home',true));home.setAttribute('aria-label','Return to Lighthouse Home');
const tools=el('div','harbor-header-tools');
const themes=el('div','harbor-themes');themes.setAttribute('role','group');themes.setAttribute('aria-label','Choose atmosphere');
['day','sunset','night'].forEach(theme=>{const b=button(theme[0].toUpperCase()+theme.slice(1),'',()=>{prefs.theme=theme;app.dataset.theme=theme;save();updateTheme();});b.dataset.theme=theme;themes.append(b);});
function updateTheme(){[...themes.children].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===prefs.theme)));}
const motion=button('Pause scene','harbor-subtle',()=>{prefs.still=!prefs.still;app.classList.toggle('harbor-still',prefs.still);motion.textContent=prefs.still?'Animate scene':'Pause scene';motion.setAttribute('aria-pressed',String(prefs.still));save();});motion.textContent=prefs.still?'Animate scene':'Pause scene';motion.setAttribute('aria-pressed',String(prefs.still));
const more=button('More at Lighthouse','harbor-subtle',()=>openMore());const sceneOptions=el('details','harbor-scene-options');sceneOptions.append(el('summary',null,'Scene'),themes,motion);tools.append(sceneOptions);header.append(home,tools);
const welcome=el('section','harbor-welcome');welcome.setAttribute('aria-labelledby','harbor-title');
const heading=el('h1',null,'Your world. One Lighthouse.');heading.id='harbor-title';
welcome.append(el('p','harbor-eyebrow','A place for everything that moves you'),heading,el('p','harbor-invitation','Shop, find work and space, create, and connect. Choose your next destination.'));
const beacon=button('✦ Enter the Beacon','harbor-watch',()=>document.getElementById('beacon-quest')?.showModal());
const meetYvette=button('Meet Yvette · AI in development','harbor-subtle',()=>openMore('lighthouse-title'));
const explore=button('Explore the Mall ↓','harbor-explore',()=>{nav.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});nav.querySelector('.harbor-feature-enter')?.focus({preventScroll:true});});welcome.append(explore);beacon.textContent='Enter the Beacon · find a little inspiration';
const introduction=el('section','harbor-introduction');
introduction.setAttribute('aria-labelledby','harbor-introduction-title');
const introductionTitle=el('h2',null,'One place for the many parts of life');introductionTitle.id='harbor-introduction-title';introductionTitle.textContent='Where would you like to go?';
introduction.append(el('p','harbor-eyebrow','Welcome to Lighthouse Mall'),introductionTitle,el('p',null,'Six destinations. Find what you need, share what you have, and discover what comes next.'));
const nav=el('nav','harbor-nav');nav.setAttribute('aria-label','Lighthouse destinations');nav.id='mall-destinations';
const carousel=el('div','harbor-carousel-controls');carousel.setAttribute('aria-label','Move between Lighthouse destinations');
const carouselPrevious=button('←','harbor-carousel-arrow',()=>moveCarousel(-1));carouselPrevious.setAttribute('aria-label','Previous Lighthouse');
const carouselDots=el('div','harbor-carousel-dots');
const carouselNext=button('→','harbor-carousel-arrow',()=>moveCarousel(1));carouselNext.setAttribute('aria-label','Next Lighthouse');
const carouselStatus=el('p','harbor-carousel-status');carouselStatus.setAttribute('aria-live','polite');
carousel.append(carouselPrevious,carouselDots,carouselNext,carouselStatus);
let centeredCarouselIndex=0;
function carouselItems(){return [...nav.querySelectorAll('.harbor-destination')];}
function centerCarousel(index,announce=true){const items=carouselItems();if(!items.length)return;centeredCarouselIndex=Math.max(0,Math.min(items.length-1,index));const item=items[centeredCarouselIndex];nav.scrollTo({left:item.offsetLeft-(nav.clientWidth-item.offsetWidth)/2,behavior:'smooth'});updateCarousel(announce);}
function moveCarousel(direction){centerCarousel(centeredCarouselIndex+direction);}
function updateCarousel(announce=false){const items=carouselItems();if(!items.length)return;centeredCarouselIndex=Math.max(0,Math.min(items.length-1,centeredCarouselIndex));items.forEach((item,index)=>item.classList.toggle('is-centered',index===centeredCarouselIndex));app.style.setProperty('--beam-angle','0deg');carouselDots.replaceChildren();items.forEach((item,index)=>{const dot=button('',index===centeredCarouselIndex?'is-active':'',()=>centerCarousel(index));dot.setAttribute('aria-label','Show '+(item.querySelector('.harbor-destination-text strong')?.textContent||'Lighthouse'));dot.setAttribute('aria-pressed',String(index===centeredCarouselIndex));carouselDots.append(dot);});carouselPrevious.disabled=centeredCarouselIndex===0;carouselNext.disabled=centeredCarouselIndex===items.length-1;if(announce)carouselStatus.textContent=(items[centeredCarouselIndex].querySelector('.harbor-destination-text strong')?.textContent||'Lighthouse')+' facing you';}
let carouselFrame=0;nav.addEventListener('scroll',()=>{cancelAnimationFrame(carouselFrame);carouselFrame=requestAnimationFrame(()=>{const center=nav.scrollLeft+nav.clientWidth/2;const items=carouselItems();let nearest=0;let distance=Infinity;items.forEach((item,index)=>{const nextDistance=Math.abs(item.offsetLeft+item.offsetWidth/2-center);if(nextDistance<distance){distance=nextDistance;nearest=index;}});if(nearest!==centeredCarouselIndex){centeredCarouselIndex=nearest;updateCarousel();}});},{passive:true});
new MutationObserver(()=>updateCarousel()).observe(nav,{childList:true});
const cards=new Map();const panels=new Map();
const stage=el('div','harbor-stage');
const panelHeading=el('div','harbor-panel-heading');
const back=button('Return home','harbor-subtle harbor-panel-home',()=>go('home',true));
const pin=button('☆ Add to favorites','harbor-subtle',()=>{if(!sourceIds[current])return;prefs.favorites=prefs.favorites.includes(current)?prefs.favorites.filter(id=>id!==current):[...prefs.favorites,current];save();updateFavorite();});
panelHeading.append(back,pin);stage.append(panelHeading);
let current='home';
function renderFeature(preview,s,feature){
  preview.replaceChildren();
  const photo=el('img');photo.src=feature.mode==='image'?feature.source:feature.poster;photo.alt=feature.title||s.name+' preview';photo.width=200;photo.height=112;
  preview.append(photo);
  if(feature.mode==='video'){
    const video=el('video');video.controls=false;video.addEventListener('play',()=>video.controls=true);video.playsInline=true;video.preload='none';video.poster=feature.poster;video.src=feature.source;video.setAttribute('aria-label',feature.title||s.name+' featured video');
    if(feature.captions){video.crossOrigin='anonymous';const track=el('track');track.kind='captions';track.srclang='en';track.label='English';track.src=feature.captions;video.append(track);}
    video.addEventListener('play',()=>{document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();});document.querySelectorAll('.harbor-feature-preview iframe').forEach(f=>f.src=f.src.replace('autoplay=1','autoplay=0'));});
    video.addEventListener('error',()=>{video.hidden=true;photo.hidden=false;});
    photo.hidden=true;preview.append(video);
  }else if(feature.mode==='youtube'){
    const play=button('▷ Watch '+s.name,'harbor-feature-play',()=>{
      pauseAll();const frame=el('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+youtubeId(feature.source)+'?autoplay=1&playsinline=1';frame.title=s.name+' featured video';frame.allow='autoplay; fullscreen; picture-in-picture';frame.allowFullscreen=true;preview.replaceChildren(frame);
    });preview.append(play);
  }
  if(feature.title){const caption=el('p','harbor-feature-caption');caption.append(el('strong',null,feature.title));if(feature.note)caption.append(el('span',null,feature.note));preview.append(caption);}
}
for(const s of sections){
  const card=el('article','harbor-destination');card.dataset.destination=s.id;
  const preview=el('div','harbor-feature-preview');renderFeature(preview,s,featuredVideos[s.id]);
  const enter=button('','harbor-feature-enter',()=>go(s.id,true));enter.setAttribute('aria-label','Enter '+s.name);
  const cardText=el('span','harbor-destination-text');cardText.append(el('strong',null,'Enter '+(s.id==='employment'?'Work':s.name)),el('small',null,({storage:'Find space or manage your rental',employment:'Find work or hire people',social:'Community and connections',marketplace:'Discover, buy, sell, and trade',music:'Watch, listen, and create'})[s.id]));enter.append(cardText,el('span','harbor-destination-arrow','↗'));card.append(preview,enter);
  card.addEventListener('pointerenter',()=>app.style.setProperty('--beam-angle',({storage:'-16deg',employment:'-8deg',social:'0deg',marketplace:'8deg',music:'16deg'})[s.id]));
  card.addEventListener('focus',()=>app.style.setProperty('--beam-angle',({storage:'-16deg',employment:'-8deg',social:'0deg',marketplace:'8deg',music:'16deg'})[s.id]));
  nav.append(card);cards.set(s.id,card);
  const source=document.getElementById(sourceIds[s.id]);
  const phone=source?.querySelector('.yvette-phone-group');
  const panel=el('section','harbor-panel');panel.hidden=true;panel.id='harbor-'+s.id;panel.setAttribute('aria-labelledby','harbor-heading-'+s.id);card.setAttribute('aria-controls',panel.id);
  const overview=el('div','harbor-overview');const intro=el('div','harbor-intro');
  intro.append(el('p','harbor-eyebrow',s.eyebrow));const h=el('h2',null,s.title);h.id='harbor-heading-'+s.id;h.tabIndex=-1;intro.append(h,el('p','harbor-description',s.description));
  const makeAction=([text,href])=>{const a=el('a',null,text);a.href=href.startsWith('/')?'https://www.easylotstoragesolutions.com'+href:href;a.target='_top';return a};
  const [primaryPath,...otherPaths]=paths[s.id];const start=el('div','harbor-start');start.append(el('span',null,'Recommended first step'),makeAction(primaryPath));intro.append(start);
  if(otherPaths.length){const morePaths=el('details','harbor-paths');morePaths.append(el('summary',null,'Other ways into this area'));const actions=el('div','harbor-actions');otherPaths.forEach(path=>actions.append(makeAction(path)));morePaths.append(actions);intro.append(morePaths)}
  const expectations={storage:'Browse without an account. Availability and rental terms come from each listing; entering this area does not reserve a space.',employment:'Your work profile and hiring details stay behind sign-in. Review available access before choosing a paid plan; an introduction is not a job offer.',social:'Try the sample experience without an account. Posts and messages in this preview are not shared with real people.',marketplace:'Browse approved listings without signing in. If there are no listings yet, the page will say so. Read item details before contacting a seller.',music:'Sign in to save studio projects and manage your work. This is a creative workspace, not a music streaming or distribution service.'};
  intro.append(el('p','harbor-availability',expectations[s.id]));
  const guide=el('div','harbor-guide-note');const avatar=el('img');avatar.src=new URL('yvette-portrait.jpg',base).href;avatar.alt='';avatar.width=42;avatar.height=42;guide.append(avatar,el('p',null,'Yvette is here to show you around. Press Play guide in the Lighthouse viewer whenever you’re ready.'));intro.append(guide);
  if(s.id==='social')intro.append(el('p','harbor-availability','Social preview · Adults 18+ · Sample activity, not a live network.'));
  overview.append(intro);if(phone){phone.classList.add('lighthouse-viewer');phone.querySelector('.yvette-phone')?.setAttribute('aria-label',s.name+' video inside a Lighthouse lantern');const screen=phone.querySelector('.yvette-screen');if(screen)screen.style.backgroundImage=`url("${new URL(s.id+'-poster.jpg',base).href}")`;overview.append(phone);}panel.append(overview);
  restoreDestination({panel,source,overview,section:s});
  panels.set(s.id,panel);stage.append(panel);
}
const footer=el('footer','harbor-footer');
const favorites=el('div','harbor-favorites');favorites.setAttribute('aria-label','Your favorite destinations');
const rememberLabel=el('label','harbor-remember');const remember=el('input');remember.type='checkbox';remember.checked=prefs.remember;remember.addEventListener('change',()=>{prefs.remember=remember.checked;prefs.last=current;save();});rememberLabel.append(remember,el('span',null,'Reopen my last destination on this device'));rememberLabel.title='When enabled, Lighthouse opens your last visited destination on this browser. You can turn this off at any time.';
footer.append(rememberLabel);
const story=el('section','harbor-story');story.setAttribute('aria-labelledby','harbor-story-title');
const storyLead=el('div','harbor-story-lead');const storyTitle=el('h2',null,'A light for real life.');storyTitle.id='harbor-story-title';
storyLead.append(el('p','harbor-eyebrow','What Lighthouse offers'),storyTitle,el('p',null,'Lighthouse Mall brings practical parts of everyday life into one connected community. The Marketplace has places for vehicles, equipment, household goods, business assets, free items, trades, wanted posts, handmade work, repairs, and reviewed auctions. Storage & Space helps people describe what they need and connect with a fitting space. Lighthouse Work brings workers, drivers, employers, and opportunities together. Business, service, creative, music, and community areas give people more ways to be discovered, create, and connect.'));
const storyColumns=el('div','harbor-story-columns');
const goal=el('article');goal.append(el('p','harbor-eyebrow','Our goal'),el('h3',null,'Make opportunity easier to find and understand.'),el('p',null,'We are building a place where people are treated like people—not listings, leads, or numbers. Information should be honest, private contact details should be protected, choices should be explained clearly, and unavailable or developing features should always say so.'),el('p',null,'Lighthouse connects people. It does not take a percentage of their work, sale, or opportunity. The platform is supported through clear subscription services, not hidden transaction fees.'));
const future=el('article');future.append(el('p','harbor-eyebrow','Where we are heading'),el('h3',null,'One guide across every destination.'),el('p',null,'The future of Lighthouse is a connected place that can guide each visitor without taking away their control. Someone looking for work may also need transportation or storage. A business may need workers, equipment, space, and local services. A seller may meet a buyer through the Marketplace or a request on the Wanted Board.'),el('p',null,'Lighthouse AI is being developed to help people understand their choices, see why something is recommended, protect private information, and take a clear next step. The goal is not to replace human connection—it is to make that connection easier to find.'));
storyColumns.append(goal,future);
const fullStory=el('details','harbor-full-story');fullStory.id='lighthouse-vision';fullStory.append(el('summary',null,'About Lighthouse · our mission and vision'),storyColumns);
const completeOverview=storyLead.lastElementChild.cloneNode(true);fullStory.append(completeOverview);
storyLead.lastElementChild.textContent='Life does not fit into one category. Lighthouse brings people, opportunities, space, and creativity into one connected community.';
const promises=el('ul','harbor-promises');['People first. Honest information and human connection.','Your choices stay yours. Private contact details stay protected.','Clear subscriptions. No percentage taken from your work or sale.'].forEach(text=>promises.append(el('li',null,text)));
story.append(storyLead,promises,fullStory);
const yvetteSection=el('section','harbor-yvette-preview');yvetteSection.append(el('p','harbor-eyebrow','Lighthouse AI · in development'),el('h2',null,'Meet Yvette, your future guide.'),el('p',null,'Yvette is being developed to help you understand your choices and find a useful next step. The destinations are here to explore while she grows.'),meetYvette);
const discovery=el('div','harbor-discovery');discovery.append(beacon);
const announcement=el('p','harbor-announcement');announcement.setAttribute('role','status');
const moreDialog=el('dialog','harbor-more');moreDialog.setAttribute('aria-label','More at Lighthouse');
const closeMore=button('Close ×','harbor-close',()=>moreDialog.close());moreDialog.append(closeMore,el('h2',null,'More at Lighthouse'));
const info=el('div','harbor-more-content');moreDialog.append(info);
const infoNav=el('nav','harbor-info-nav');infoNav.setAttribute('aria-label','About Lighthouse');
[['How It Works','how-easy-works'],['For You','what-easy-does'],['Meet Yvette','lighthouse-title'],['AI status','assistant'],['For Business','for-business']].forEach(([label,target])=>infoNav.append(button(label,'harbor-subtle',()=>openMore(target))));moreDialog.insertBefore(infoNav,info);
const selectedSources=new Set(Object.values(sourceIds));
original.forEach(node=>{if(selectedSources.has(node.id)||node.tagName==='DIALOG')return;if(node.classList.contains('hero')){const journey=node.querySelector('#starting-journey');if(journey)info.append(journey);node.hidden=true;return;}info.append(node);});
function openMore(target='how-easy-works'){
  const requested=info.querySelector('#'+CSS.escape(target));
  const section=requested && [...info.children].find(node=>node===requested||node.contains(requested));
  [...info.children].forEach(node=>node.hidden=section?node!==section:false);
  moreDialog.querySelector('h2').textContent=target==='how-easy-works'?'How Lighthouse Works':target==='what-easy-does'?'Find your next step':'Meet Yvette · in development';
  moreDialog.showModal();moreDialog.scrollTop=0;
}
moreDialog.addEventListener('click',e=>{if(e.target===moreDialog)moreDialog.close();});
function pauseAll(){document.querySelectorAll('video').forEach(v=>v.pause());document.querySelectorAll('.harbor-panel:not([hidden]) iframe,.harbor-feature-preview iframe,.harbor-cinema iframe').forEach(f=>{const src=f.getAttribute('src');if(src)f.setAttribute('src',src.replace('autoplay=1','autoplay=0'));});}
function updateFavorite(){cards.forEach((card,id)=>card.classList.toggle('is-favorite',prefs.favorites.includes(id)));pin.textContent=prefs.favorites.includes(current)?'★ Saved to favorites':'☆ Add to favorites';pin.setAttribute('aria-pressed',String(prefs.favorites.includes(current)));favorites.replaceChildren();if(prefs.favorites.length){favorites.append(el('span',null,'Your places'));prefs.favorites.forEach(id=>favorites.append(button(sections.find(s=>s.id===id).name,'',()=>go(id,true))));}else favorites.append(el('span',null,'Make this place yours. Save a favorite inside any destination.'));}
function go(id,user=false){
  if(id!=='home'&&!panels.has(id))return;
  moreDialog.close();document.getElementById('beacon-quest')?.close();
  pauseAll();current=id;app.dataset.view=id;welcome.hidden=id!=='home';stage.hidden=id==='home';panels.forEach((p,key)=>p.hidden=key!==id);cards.forEach((b,key)=>b.querySelector('.harbor-feature-enter').setAttribute('aria-current',key===id?'page':'false'));updateFavorite();
  if(prefs.remember){prefs.last=id;save();}
  if(user){const url=new URL(location.href);url.searchParams.delete('section');url.hash=id==='home'?'':sourceIds[id];if(url.href!==location.href)history.pushState(null,'',url.href);(id==='home'?heading:document.getElementById('harbor-heading-'+id)).focus({preventScroll:true});app.scrollIntoView({block:'start'});}
}
function openDestination(target){
  if(!target)return false;
  if(target==='mall-destinations'||target==='what-easy-does'){go('home',true);(document.getElementById('lighthouse-mall-map')||nav).scrollIntoView({block:'start'});return true;}
  if(target==='lighthouse-vision'){go('home',true);fullStory.open=true;fullStory.scrollIntoView({block:'start'});return true;}
  const id=Object.keys(sourceIds).find(key=>sourceIds[key]===target);
  if(id){go(id,true);return true;}
  const nested=document.getElementById(target);
  const owner=nested&&[...panels].find(([,panel])=>panel.contains(nested));
  if(owner){go(owner[0],true);owner[1].dispatchEvent(new CustomEvent('lighthouse:reveal',{detail:nested}));nested.scrollIntoView({block:'start'});return true;}
  if(info.querySelector('#'+CSS.escape(target))){document.getElementById('beacon-quest')?.close();openMore(target);return true;}
  return false;
}
document.addEventListener('click',event=>{const a=event.target.closest('a[href^="#"],a[href^="/#"]');if(!a)return;if(openDestination(a.getAttribute('href').replace(/^\/?#/,''))){event.preventDefault();event.stopImmediatePropagation();}},true);
window.addEventListener('message',event=>{
  const trusted=['https://www.easylotstoragesolutions.com','https://easylotstoragesolutions.com'];if(location.hostname==='localhost')trusted.push(location.origin);
  if(event.source!==window.parent||!trusted.includes(event.origin)||event.data?.type!=='lighthouse:navigate')return;
  openDestination(String(event.data.section||''));
});
function restoreHistoryDestination(){const target=location.hash.slice(1)||new URLSearchParams(location.search).get('section');const id=Object.keys(sourceIds).find(key=>sourceIds[key]===target);if(id)go(id);else if(!target)go('home');}
window.addEventListener('hashchange',restoreHistoryDestination);
window.addEventListener('popstate',restoreHistoryDestination);
const cinema=el('dialog','harbor-cinema');cinema.setAttribute('aria-label','Watch Lighthouse');
const cinemaTitle=el('h2',null,'Watch the Lighthouse');const cinemaClose=button('Close ×','harbor-close',()=>cinema.close());
const film=el('video');film.controls=true;film.playsInline=true;film.preload='none';film.poster=new URL('./assets/lighthouse-memorial-hero-poster.jpg',import.meta.url).href;film.src=new URL('./assets/lighthouse-memorial-hero.mp4',import.meta.url).href;film.setAttribute('aria-label','Original Lighthouse coastal film');
cinema.append(cinemaClose,cinemaTitle,film);cinema.addEventListener('close',()=>pauseAll());cinema.addEventListener('click',e=>{if(e.target===cinema)cinema.close();});
const watch=button('▷ Watch Lighthouse','harbor-watch',()=>{pauseAll();cinema.showModal();});discovery.append(watch);welcome.append(discovery);
app.append(scene,header,welcome,favorites,introduction,nav,carousel,stage,story,yvetteSection,footer,announcement,moreDialog,cinema);root.prepend(app);heading.tabIndex=-1;updateCarousel();
// The Studio's original film collection belongs in Sound Harbor. The separate
// Watch Lighthouse dialog retains the homepage's coastal film.
document.documentElement.classList.add('harbor-ready');updateTheme();updateFavorite();
const fromHash=Object.keys(sourceIds).find(key=>sourceIds[key]===location.hash.slice(1));go(fromHash||(prefs.remember?prefs.last:'home'));
openDestination(new URLSearchParams(location.search).get('section')||location.hash.slice(1));
if(new URLSearchParams(location.search).has('easyStart'))openMore();
// The first screen is complete at this point. Load resizing and live media in the
// background so a slow phone never waits on below-the-fold features.
void import('./lighthouse-embed-height.mjs?v=1').catch(()=>{});
await import('./lighthouse-live.mjs?v=20260908-harbor-names1');
const {mountMallMap}=await import('./lighthouse-mall-map.mjs?v=20260908-recovery1');
mountMallMap({app,nav,go,explore,introduction,prefs});

// Receive only published editorial fields from the owning Wix page. Keep original
// media intact when the bridge or CMS is unavailable (including standalone previews).
const mediaParentOrigins=['https://www.easylotstoragesolutions.com','https://easylotstoragesolutions.com'];
window.addEventListener('message',event=>{
  if(event.source!==window.parent||!mediaParentOrigins.includes(event.origin)||event.data?.type!=='lighthouse-media:publicResult')return;
  for(const s of sections){const custom=event.data.features?.[s.id];if(!custom||custom.mode==='default')continue;
    try{renderFeature(cards.get(s.id).querySelector('.harbor-feature-preview'),s,{...custom,poster:custom.poster||featuredVideos[s.id].poster});if(custom.title){const text=cards.get(s.id).querySelector('.harbor-destination-text small');text.textContent=custom.title;text.title=custom.note||custom.title;}}catch{renderFeature(cards.get(s.id).querySelector('.harbor-feature-preview'),s,featuredVideos[s.id]);}
  }
});
if(window.parent!==window)mediaParentOrigins.forEach(origin=>window.parent.postMessage({type:'lighthouse-media:public'},origin));
