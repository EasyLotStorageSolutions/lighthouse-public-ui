import {openCenterPlayer} from './lighthouse-live.mjs?v=20260908-harbor-names1';
const districts=[
 {id:'marketplace',name:'Market Harbor',hint:'Discover, buy, sell & trade',x:21,y:17,angle:-145},
 {id:'employment',name:'Work Pier',hint:'Find work or hire people',x:79,y:17,angle:-35},
 {id:'storage',name:'Storage Cove',hint:'Space for what matters',x:16,y:50,angle:180},
 {id:'social',name:'Lighthouse World',hint:'Community & connections',x:84,y:50,angle:0},
 {id:'music',name:'Sound Harbor',hint:'Music, video & studio',x:24,y:83,angle:145},
 {id:'locksmith',name:'Locksmith Point',hint:'Lighthouse Locksmith',x:76,y:83,angle:35}
];
const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n;};
const btn=(text,cls,fn)=>{const n=make('button',cls,text);n.type='button';n.addEventListener('click',fn);return n;};
export function mountMallMap({app,nav,go,explore,introduction,prefs}){
 const map=make('section','mall-map');map.id='lighthouse-mall-map';map.setAttribute('aria-label','Explore Lighthouse Mall');
 const toolbar=make('div','mall-toolbar');const title=make('div','mall-title');title.append(make('span','harbor-eyebrow','YOUR LIGHTHOUSE MALL'),make('h2',null,'Find your corner of the world.'));
 const controls=make('div','mall-toolbar-controls');const mapButton=btn('Mall Map','is-active',()=>showMap());const directoryButton=btn('Directory','',()=>showDirectory(false));const favoriteButton=btn('★ Favorites','',()=>showDirectory(true));controls.append(mapButton,directoryButton,favoriteButton);toolbar.append(title,controls);
 const world=make('div','mall-world');const canvas=make('div','mall-canvas');canvas.setAttribute('aria-label','Choose a district');
 const central=make('img','mall-central');central.src=new URL('./assets/lighthouse-media-console-2040.webp',import.meta.url).href;central.alt='The Lighthouse at the heart of the mall';central.width=400;central.height=600;
 const beam=make('div','mall-selection-beam');beam.setAttribute('aria-hidden','true');canvas.append(beam,central);
 const marker=make('span','mall-you-are-here','THE LIGHTHOUSE');canvas.append(marker);
 const theater=make('section','mall-theater');theater.hidden=true;theater.setAttribute('aria-label','Center Lighthouse theater');
 const watchCenter=btn('▶ TV & Radio Lounge','mall-center-play',()=>{showMap();canvas.hidden=true;theater.hidden=false;world.classList.add('show-theater');openCenterPlayer(theater,()=>{theater.hidden=true;world.classList.remove('show-theater');canvas.hidden=!directory.hidden;if(directory.hidden)watchCenter.focus({preventScroll:true});});});canvas.append(watchCenter);
 const nodes=new Map();districts.forEach(d=>{const n=btn('','mall-district',()=>select(d));n.style.setProperty('--x',d.x+'%');n.style.setProperty('--y',d.y+'%');n.setAttribute('aria-expanded','false');n.setAttribute('aria-controls','mall-district-panel');n.append(make('span','mall-node-light','✦'),make('strong',null,d.name),make('small',null,d.hint));nodes.set(d.id,n);canvas.append(n);});
 const prompt=make('p','mall-map-prompt','Choose a light. Discover what’s inside.');canvas.append(prompt);
 const panel=make('section','mall-district-panel');panel.id='mall-district-panel';panel.hidden=true;panel.setAttribute('aria-label','Selected district');
 const close=btn('← All districts','mall-close',()=>showMap());const panelTitle=make('h3');panelTitle.tabIndex=-1;const panelHint=make('p','mall-panel-hint');panel.append(close,panelTitle,panelHint,nav);
 const directory=make('section','mall-directory');directory.hidden=true;directory.setAttribute('aria-label','Mall directory');
 const searchLabel=make('label','mall-search-label','Find a destination');const search=make('input');search.type='search';search.placeholder='Search stores, work, storage…';searchLabel.append(search);const results=make('div','mall-directory-results');const resultStatus=make('p','mall-result-status');resultStatus.setAttribute('role','status');directory.append(searchLabel,resultStatus,results);let favoritesOnly=false;
 function renderDirectory(){const q=search.value.trim().toLowerCase();const matches=districts.filter(d=>(!favoritesOnly||prefs.favorites.includes(d.id))&&`${d.id} ${d.name} ${d.hint}`.toLowerCase().includes(q));results.replaceChildren();for(const d of matches){const row=btn('','mall-directory-row',()=>select(d));row.append(make('strong',null,d.name),make('span',null,d.hint),make('span','mall-row-arrow','→'));results.append(row);}resultStatus.textContent=matches.length?`${matches.length} ${matches.length===1?'district':'districts'}`:favoritesOnly?'No saved destinations yet. Enter a destination and choose Add to favorites.':'No matching destinations. Try another name.';}
 search.addEventListener('input',renderDirectory);
 function tabState(active){[mapButton,directoryButton,favoriteButton].forEach(b=>{b.classList.toggle('is-active',b===active);b.setAttribute('aria-pressed',String(b===active));});}
 function showMap(focus=false){const player=theater.querySelector('dialog[open]');if(player)player.close();directory.hidden=true;canvas.hidden=false;panel.hidden=true;world.classList.remove('has-selection','show-directory');nodes.forEach(n=>n.setAttribute('aria-expanded','false'));tabState(mapButton);if(focus)nodes.values().next().value.focus();}
 function showDirectory(favorites){showMap();favoritesOnly=favorites;directory.hidden=false;canvas.hidden=true;panel.hidden=true;world.classList.remove('has-selection');world.classList.add('show-directory');tabState(favorites?favoriteButton:directoryButton);search.value='';renderDirectory();search.focus();}
 function select(d){directory.hidden=true;canvas.hidden=false;panel.hidden=false;world.classList.remove('show-directory');world.classList.add('has-selection');panelTitle.textContent=d.name;panelHint.textContent=d.hint;panel.scrollTop=0;nav.querySelectorAll('.harbor-destination').forEach(c=>c.dataset.mapSelected=String(c.dataset.destination===d.id));nodes.forEach((n,id)=>n.setAttribute('aria-expanded',String(id===d.id)));canvas.style.setProperty('--district-angle',d.angle+'deg');tabState(mapButton);panelTitle.focus({preventScroll:true});}
 map.addEventListener('keydown',e=>{if(e.key==='Escape'){showMap(true);e.stopPropagation();}});
 world.append(canvas,panel,directory,theater);map.append(toolbar,world);const extras=app.querySelector('.harbor-discovery');if(extras)map.append(extras);introduction.replaceWith(map);app.classList.add('mall-map-ready');
 explore.textContent='Explore the Mall';explore.addEventListener('click',()=>{showMap();map.scrollIntoView({block:'start',behavior:'auto'});nodes.values().next().value.focus({preventScroll:true});});
 const returnMap=btn('← Mall Map','mall-return',()=>{go('home',true);showMap();map.scrollIntoView({block:'start'});});app.prepend(returnMap);
 // Home navigation and saved-destination behavior retain their original handlers.
 new MutationObserver(()=>{if(app.dataset.view==='home')showMap();}).observe(app,{attributes:true,attributeFilter:['data-view']});
 showMap();
}
