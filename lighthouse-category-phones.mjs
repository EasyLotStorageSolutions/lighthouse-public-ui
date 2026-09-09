import {sections} from './lighthouse-guide-data.mjs?v=20260908-yvette-balance1';

const media = new URL('./assets/lighthouse-guides/', import.meta.url);
const settings = {
  storage: {selector:'.storage-drivein', label:'Facility tour', href:'https://www.easylotstoragesolutions.com/find-storage'},
  employment: {selector:'#work-phone', label:'Try work demo', href:'https://www.easylotstoragesolutions.com/customer-portal?view=work'},
  marketplace: {selector:'#marketplace-phone', label:'Try listing demo', href:'https://www.easylotstoragesolutions.com/marketplace'},
  music: {selector:'.channel-tv', label:'Watch featured video', href:'https://www.easylotstoragesolutions.com/customer-portal?view=studio'}
};
const allVideos = new Set();
const walkthroughs={storage:'storage',employment:'employment',marketplace:'marketplace',music:'creative',social:'social'};
let activeNarration=null;
async function chooseYvetteVoice(){
  if(!('speechSynthesis' in window))return null;
  let voices=window.speechSynthesis.getVoices();
  if(!voices.length){await new Promise(resolve=>{const done=()=>{window.speechSynthesis.removeEventListener('voiceschanged',done);resolve()};window.speechSynthesis.addEventListener('voiceschanged',done,{once:true});setTimeout(done,1200)});voices=window.speechSynthesis.getVoices()}
  const preferred=[/Microsoft Aria/i,/Microsoft Jenny/i,/Samantha/i,/Zira/i,/Google US English/i,/female/i];
  for(const pattern of preferred){const match=voices.find(item=>/^en(?:-|_)/i.test(item.lang)&&pattern.test(item.name));if(match)return match}
  return null;
}
async function speakAsYvette(section,status){
  if(!('speechSynthesis' in window)){status.textContent='Open Read guide to follow the introduction.';return}
  window.speechSynthesis.cancel();const voice=await chooseYvetteVoice();
  if(!voice){status.textContent='A suitable feminine narrator is not available on this device. Open the written guide below.';return}
  const utterance=new SpeechSynthesisUtterance(section.transcript);utterance.voice=voice;utterance.rate=.94;utterance.pitch=1.03;utterance.onend=()=>{if(activeNarration?.utterance===utterance)activeNarration=null};utterance.onerror=()=>{if(activeNarration?.utterance===utterance)activeNarration=null;status.textContent='Open the written guide below to continue.'};activeNarration={sectionId:section.id,utterance};status.textContent='Guide narration is playing.';window.speechSynthesis.speak(utterance);
}
function stopYvette(sectionId){if(activeNarration?.sectionId===sectionId&&'speechSynthesis' in window){window.speechSynthesis.cancel();activeNarration=null}}
function make(tag, className, text) {
  const node = document.createElement(tag);
  if(className) node.className=className;
  if(text) node.textContent=text;
  return node;
}
function mountPhone(section, old, options) {
  const group=make('div','yvette-phone-group');
  const phone=make('section','yvette-phone');
  phone.setAttribute('aria-label',section.name+' optional guide');
  phone.dataset.category=section.id;
  const top=make('div','yvette-phone-top',section.name);
  top.append(make('span','yvette-island'));
  const screen=make('div','yvette-screen');
  const video=make('video','yvette-video');
  video.controls=false; video.playsInline=true; video.preload='none';video.muted=true;video.volume=0;
  video.poster=new URL(section.id+'-poster.jpg',media).href;
  video.src=new URL('../'+walkthroughs[section.id]+'-walkthrough.mp4',media).href;
  video.setAttribute('aria-label','Optional introduction to '+section.name);
  screen.append(video);allVideos.add(video);
  const fallback=make('p','yvette-error','The guide could not load. You can read it below or enter the section.');fallback.hidden=true;screen.append(fallback);
  video.addEventListener('error',()=>{fallback.hidden=true;status.textContent=fallback.textContent;});
  const dock=make('div','yvette-dock');
  const identity=make('div','yvette-identity');
  const greeting=make('div');greeting.append(make('strong',null,'Optional guide'),make('span',null,'A short introduction when you want it'));
  identity.append(greeting);dock.append(identity);
  const controls=make('div','yvette-controls');
  const play=make('button',null,'Play guide');play.type='button';
  const replay=make('button',null,'Replay');replay.type='button';
  const full=make('button',null,'Full screen');full.type='button';
  const status=make('p','yvette-status');status.setAttribute('role','status');
  const legacy=make('div','yvette-legacy');legacy.hidden=true;
  function showGuide(){legacy.hidden=true;screen.hidden=false;toggle?.setAttribute('aria-pressed','false');if(toggle)toggle.textContent=options.label;legacy.querySelectorAll('video').forEach(v=>v.pause());}
  async function start(){showGuide();try{await video.play();}catch{status.textContent='Tap the video’s play control to start the guide.';}}
  play.addEventListener('click',()=>video.paused?start():video.pause());
  replay.addEventListener('click',async()=>{const active=!legacy.hidden?legacy.querySelector('video'):video;if(active){active.currentTime=0;try{await active.play();}catch{status.textContent='Press play on the video to begin.';}}else{video.currentTime=0;start();}});
  full.addEventListener('click',async()=>{const active=!legacy.hidden?(legacy.querySelector('video')||legacy):video;try{if(active.requestFullscreen)await active.requestFullscreen();else if(active.webkitEnterFullscreen)active.webkitEnterFullscreen();else status.textContent='Use the full-screen control on the video.';}catch{status.textContent='Use the full-screen control on the video.';}});
  video.addEventListener('volumechange',()=>{if(!video.muted||video.volume!==0){video.muted=true;video.volume=0}});
  video.addEventListener('play',()=>{allVideos.forEach(other=>{if(other!==video)other.pause();});document.querySelectorAll('video:not(.yvette-video)').forEach(other=>other.pause());play.textContent='Pause';speakAsYvette(section,status);});
  video.addEventListener('pause',()=>{play.textContent='Play guide';stopYvette(section.id)});
  video.addEventListener('ended',()=>{play.textContent='Play guide';stopYvette(section.id)});
  controls.append(play,replay,full);dock.append(controls);
  let toggle;
  if(old){
    old.before(group);legacy.append(old);old.classList.add('yvette-unframed');
    toggle=make('button','yvette-mode',options.label);toggle.type='button';toggle.setAttribute('aria-pressed','false');
    toggle.addEventListener('click',()=>{const opening=legacy.hidden;video.pause();screen.hidden=opening;legacy.hidden=!opening;toggle.setAttribute('aria-pressed',String(opening));toggle.textContent=opening?'Back to guide':options.label;
      if(!opening){legacy.querySelectorAll('video').forEach(v=>v.pause());legacy.querySelectorAll('iframe').forEach(frame=>{const src=frame.getAttribute('src');if(src)frame.setAttribute('src',src);});}
    });dock.append(toggle);
  }
  const enter=make('a','yvette-enter',section.id==='employment'?'Open work profile':section.cta);enter.href=options.href;enter.target='_top';dock.append(enter,make('div','yvette-home-indicator'));
  phone.append(top,screen,legacy,dock);
  if(section.id==='storage'&&old){screen.hidden=true;legacy.hidden=false;toggle.setAttribute('aria-pressed','true');toggle.textContent='Hear guide';}
  const transcript=make('details','yvette-transcript');transcript.append(make('summary',null,'Read guide'),make('p',null,section.transcript));
  group.append(phone,status,transcript);
  return group;
}
for(const section of sections){
  if(section.id==='social')continue;
  const options=settings[section.id];const old=document.querySelector(options.selector);
  if(old)mountPhone(section,old,options);
  else if(section.id==='music'){
    // The original channel TV was replaced by the film collection. Its removal
    // must not silently remove Creative Studio's guide and shared lounge entrance.
    document.querySelector('#lighthouse-video-studio .container')?.append(mountPhone(section,null,options));
  }
}
// Keep the existing Work tools full width, beneath its description and phone.
const workShell=document.querySelector('.work-shell');
const workDemo=document.querySelector('.work-demo');
if(workShell&&workDemo){
  const phone=workDemo.querySelector('.yvette-phone-group');if(phone)workShell.append(phone);
  const mediaFigure=workDemo.querySelector('.work-media');
  if(mediaFigure){const details=make('details','yvette-extra-film');details.append(make('summary',null,'Watch the Lighthouse coastal film'),mediaFigure);workShell.append(details);}
  const driver=workDemo.querySelector('.work-driver');if(driver)workShell.append(driver);
  workDemo.hidden=true;
}
const social=sections.find(s=>s.id==='social');
const world=make('section','section yvette-world');world.id='lighthouse-world';
const layout=make('div','container yvette-category-layout');const copy=make('div','yvette-category-copy');
copy.append(make('div','eyebrow','Community & Social · Preview'),make('h2',null,social.title),make('p','copy',social.description),make('p','copy','Explore the adult-only social demonstration. Personal Spaces, communities, and chronological feeds are being built here.'));
layout.append(copy,mountPhone(social,null,{href:'https://lighthouse-world-entrance.sreichert21.chatgpt.site/social.html'}));world.append(layout);
document.querySelector('#marketplace-showcase')?.before(world);
// Direct category choices spare visitors a long scroll through every doorway.
const quick=make('nav','yvette-category-nav');quick.setAttribute('aria-label','Choose a category');
[['Storage & Space','storage'],['Jobs & Hiring','lighthouse-work'],['Community & Social','lighthouse-world'],['Marketplace','marketplace-showcase'],['Creative Studio','lighthouse-video-studio']].forEach(([name,id])=>{const a=make('a',null,name);a.href='#'+id;a.addEventListener('click',event=>{event.preventDefault();document.getElementById(id)?.scrollIntoView({behavior:'auto',block:'start'});});quick.append(a);});
document.querySelector('#storage')?.before(quick);
document.documentElement.classList.add('yvette-phones-ready');
// Keep detailed tools available on demand, with the category doorway first.
for(const [selector,label] of [['.work-driver','Work options, plans & hiring details'],['.studio-demo','Try the Studio editing demonstration']]){
  const content=document.querySelector(selector);
  if(content){const details=make('details','yvette-section-details');content.before(details);details.append(make('summary',null,label),content);}
}
// Wix supplies a fixed-height frame; allow its content to remain reachable at every screen size.
if(window.self!==window.top)document.documentElement.classList.add('yvette-embedded');

 document.querySelector('#phone-demo-replay')?.addEventListener('click',()=>{const phone=document.querySelector('.yvette-phone[data-category=marketplace]');if(phone?.querySelector('.yvette-legacy')?.hidden)phone.querySelector('.yvette-mode')?.click();});
const welcome=document.querySelector('.hero>.container');
if(welcome){
  welcome.insertBefore(quick,welcome.querySelector('.hero-note'));
  const descriptions=['Find your space','Find work or hire','Find your people','Discover & trade','Watch, listen & create'];
  const ids=['storage','employment','social','marketplace','music'];
  [...quick.children].forEach((link,index)=>{const name=link.textContent;link.textContent='';const photo=make('img','welcome-category-image');photo.src=new URL(ids[index]+'-poster.jpg',media).href;photo.alt='';photo.width=160;photo.height=84;const text=make('span','welcome-category-text');text.append(make('strong',null,name),make('small',null,descriptions[index]));link.append(photo,text);});
  document.querySelector('.hero').classList.add('lighthouse-welcome');
}

await import('./lighthouse-harbor.mjs?v=20260909-mobile-map1');
