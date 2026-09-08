import {openCenterPlayer} from './lighthouse-live.mjs?v=20260908-store-media1';
const districts=[
 {id:'marketplace',name:'Marketplace',hint:'Buy, sell, trade & discover',x:15,y:18,mx:20,my:10,angle:-145},
 {id:'employment',name:'Jobs & Hiring',hint:'Find work or hire people',x:38,y:12,mx:80,my:10,angle:-110},
 {id:'storage',name:'Storage & Space',hint:'Find or offer storage space',x:63,y:12,mx:20,my:28,angle:-70},
 {id:'social',name:'Community & Social',hint:'People, groups & connections',x:86,y:18,mx:80,my:28,angle:-35},
 {id:'makers',name:'Makers Market & Community',hint:'Handmade goods, custom work & maker connections',x:90,y:52,mx:20,my:65,angle:0,url:'https://easylotstoragesolutions.github.io/lighthouse-public-ui/marketplace-maker-space.html'},
 {id:'music',name:'Creative Studio',hint:'Music, video & creative tools',x:82,y:84,mx:80,my:65,angle:35},
 {id:'locksmith',name:'Locksmith Services',hint:'Find a locksmith or join the trade',x:62,y:89,mx:20,my:83,angle:70},
 {id:'towing',name:'Towing & Roadside Assistance',hint:'Towing, roadside help & vehicle transport',x:38,y:89,mx:80,my:83,angle:110,url:'https://easylotstoragesolutions.github.io/lighthouse-public-ui/towing-roadside.html'},
 {id:'contractors',name:'Contractors & Home Services',hint:'Find contractors & home-service professionals',x:18,y:84,mx:50,my:95,angle:145,url:'https://easylotstoragesolutions.github.io/lighthouse-public-ui/contractors-home-services.html'}
];
const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n;};
const btn=(text,cls,fn)=>{const n=make('button',cls,text);n.type='button';n.addEventListener('click',fn);return n;};
export function mountMallMap({app,nav,go,explore,introduction,prefs}){
 const map=make('section','mall-map');map.id='lighthouse-mall-map';map.setAttribute('aria-label','Explore Easy categories');
 const toolbar=make('div','mall-toolbar');const title=make('div','mall-title');title.append(make('span','harbor-eyebrow','EXPLORE EASY'),make('h2',null,'Find what you need.'));
 const controls=make('div','mall-toolbar-controls');const mapButton=btn('Category Map','is-active',()=>showMap());const directoryButton=btn('Directory','',()=>showDirectory(false));const favoriteButton=btn('★ Favorites','',()=>showDirectory(true));controls.append(mapButton,directoryButton,favoriteButton);toolbar.append(title,controls);
 const world=make('div','mall-world');const canvas=make('div','mall-canvas');canvas.setAttribute('aria-label','Choose a category');
 const central=make('img','mall-central');central.src=new URL('./assets/lighthouse-media-console-2040.webp',import.meta.url).href;central.alt='The Lighthouse at the heart of the mall';central.width=400;central.height=600;
 const beam=make('div','mall-selection-beam');beam.setAttribute('aria-hidden','true');canvas.append(beam,central);
 const marker=make('span','mall-you-are-here','THE LIGHTHOUSE');canvas.append(marker);
 const theater=make('section','mall-theater');theater.hidden=true;theater.setAttribute('aria-label','Center Lighthouse theater');
 const watchCenter=btn('▶ TV & Radio Lounge','mall-center-play',()=>{showMap();canvas.hidden=true;theater.hidden=false;world.classList.add('show-theater');openCenterPlayer(theater,()=>{theater.hidden=true;world.classList.remove('show-theater');canvas.hidden=!directory.hidden;if(directory.hidden)watchCenter.focus({preventScroll:true});});});canvas.append(watchCenter);
 const nodes=new Map();districts.forEach(d=>{const n=btn('','mall-district',()=>select(d));n.style.setProperty('--x',d.x+'%');n.style.setProperty('--y',d.y+'%');n.style.setProperty('--mx',d.mx+'%');n.style.setProperty('--my',d.my+'%');n.setAttribute('aria-label','Enter '+d.name);if(!d.url&&d.id!=='locksmith')n.setAttribute('aria-controls','harbor-'+d.id);n.append(make('span','mall-node-light','✦'),make('strong',null,d.name),make('small',null,d.hint));nodes.set(d.id,n);canvas.append(n);});
 const prompt=make('p','mall-map-prompt','Choose a category. See what’s inside.');canvas.append(prompt);
 const panel=make('section','mall-district-panel');panel.id='mall-district-panel';panel.hidden=true;panel.setAttribute('aria-label','Selected district');
 const close=btn('← All categories','mall-close',()=>showMap());const panelTitle=make('h3');panelTitle.tabIndex=-1;const panelHint=make('p','mall-panel-hint');panel.append(close,panelTitle,panelHint,nav);
 const directory=make('section','mall-directory');directory.hidden=true;directory.setAttribute('aria-label','Category directory');
 const searchLabel=make('label','mall-search-label','Find a destination');const search=make('input');search.type='search';search.placeholder='Search stores, work, storage…';searchLabel.append(search);const results=make('div','mall-directory-results');const resultStatus=make('p','mall-result-status');resultStatus.setAttribute('role','status');directory.append(searchLabel,resultStatus,results);let favoritesOnly=false;
 function renderDirectory(){const q=search.value.trim().toLowerCase();const matches=districts.filter(d=>(!favoritesOnly||prefs.favorites.includes(d.id))&&`${d.id} ${d.name} ${d.hint}`.toLowerCase().includes(q));results.replaceChildren();for(const d of matches){const row=btn('','mall-directory-row',()=>select(d));row.append(make('strong',null,d.name),make('span',null,d.hint),make('span','mall-row-arrow','→'));results.append(row);}resultStatus.textContent=matches.length?`${matches.length} ${matches.length===1?'category':'categories'}`:favoritesOnly?'No saved categories yet. Open a category and choose Add to favorites.':'No matching categories. Try another name.';}
 search.addEventListener('input',renderDirectory);
 function tabState(active){[mapButton,directoryButton,favoriteButton].forEach(b=>{b.classList.toggle('is-active',b===active);b.setAttribute('aria-pressed',String(b===active));});}
 function showMap(focus=false){const player=theater.querySelector('dialog[open]');if(player)player.close();directory.hidden=true;canvas.hidden=false;panel.hidden=true;world.classList.remove('has-selection','show-directory');tabState(mapButton);if(focus)nodes.values().next().value.focus();}
 function showDirectory(favorites){showMap();favoritesOnly=favorites;directory.hidden=false;canvas.hidden=true;panel.hidden=true;world.classList.remove('has-selection');world.classList.add('show-directory');tabState(favorites?favoriteButton:directoryButton);search.value='';renderDirectory();search.focus();}
 function select(d){
   // A district is an entrance, not another directory. Locksmith has its own
   // existing site page; the other five retain their original in-page tools.
   if(d.url){window.top.location.href=d.url;return;}
   if(d.id==='locksmith'){nav.querySelector('[data-destination="locksmith"] .harbor-feature-enter')?.click();return;}
   showMap();go(d.id,true);
 }
 map.addEventListener('keydown',e=>{if(e.key==='Escape'){showMap(true);e.stopPropagation();}});
 world.append(canvas,panel,directory,theater);map.append(toolbar,world);const extras=app.querySelector('.harbor-discovery');if(extras)map.append(extras);introduction.replaceWith(map);app.classList.add('mall-map-ready');
 explore.textContent='Explore Categories';explore.addEventListener('click',()=>{showMap();map.scrollIntoView({block:'start',behavior:'auto'});nodes.values().next().value.focus({preventScroll:true});});
 const returnMap=btn('← Category Map','mall-return',()=>{go('home',true);showMap();map.scrollIntoView({block:'start'});});app.prepend(returnMap);
 // Home navigation and saved-destination behavior retain their original handlers.
 new MutationObserver(()=>{if(app.dataset.view==='home')showMap();}).observe(app,{attributes:true,attributeFilter:['data-view']});
 showMap();
}
