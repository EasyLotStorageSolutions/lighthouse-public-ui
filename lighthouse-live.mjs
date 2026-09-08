let centerPlayer;
export function openCenterPlayer(host,onClose){centerPlayer?.(host,onClose);}
const app=document.querySelector('.harbor-app');
if(app){
  const experiences={
    storage:{name:'Storage',guide:'Tour',tv:'Property TV',radio:'Local Radio',video:'0TPmbw4sPUo',prompt:'your city, state, or station',suggestions:['weather','talk','community']},
    employment:{name:'Employment',guide:'Yvette',tv:'Work TV',radio:'News Radio',video:'lLqdB_7FfUA',prompt:'business news',suggestions:['business news','public radio','education']},
    social:{name:'Lighthouse World',guide:'Yvette',tv:'Community TV',radio:'Talk Radio',video:'Sj_7xYkL680',prompt:'community',suggestions:['community','talk','culture']},
    marketplace:{name:'Marketplace',guide:'Showcase',tv:'Market TV',radio:'Business Radio',video:'r0fwqV0glGs',prompt:'business',suggestions:['business','entrepreneur','local']},
    music:{name:'Music',guide:'Yvette',tv:'Music TV',radio:'Music Radio',video:'x0DinqPXxTo',prompt:'jazz',suggestions:['jazz','soul','classical']}
  };
  const art=new URL('./assets/lighthouse-media-console-2040.webp',import.meta.url).href;
  const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text)node.textContent=text;return node};
  const button=(text,cls,fn)=>{const node=el('button',cls,text);node.type='button';node.addEventListener('click',fn);return node};
  let activeCategory='social';

  const dialog=el('dialog','harbor-live');dialog.setAttribute('aria-labelledby','harbor-live-title');
  const close=button('Close ×','harbor-close',()=>dialog.close());
  const eyebrow=el('p','harbor-eyebrow','Live from your Lighthouse');
  const title=el('h2',null,'Lighthouse Live');title.id='harbor-live-title';
  const intro=el('p','harbor-live-intro','Choose a visual channel or find an internet radio station. Nothing starts until you choose it.');
  const modes=el('div','harbor-live-modes');modes.setAttribute('role','group');modes.setAttribute('aria-label','Choose Lighthouse Live mode');
  const visualButton=button('Watch',null,()=>showVisual());
  const radioButton=button('Radio',null,()=>showRadio());
  const iheartButton=button('iHeart',null,()=>showIHeart());
  modes.append(visualButton,radioButton,iheartButton);

  const media=el('div','lighthouse-media harbor-live-lighthouse');
  const image=el('img');image.src=art;image.alt='Lighthouse lantern surrounding the live media screen';
  const screen=el('div','lighthouse-screen harbor-live-screen');
  const frame=el('iframe');frame.title='Selected Lighthouse visual channel';frame.loading='lazy';frame.allow='accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;
  const radioPanel=el('div','harbor-radio-panel');
  const radioNow=el('strong',null,'Find a station to begin.');
  const radioMeta=el('span',null,'Search by station name, city, or style.');
  const audio=el('audio');audio.controls=true;audio.preload='none';
  radioPanel.append(el('span','harbor-radio-wave','◖ ))) ◗'),radioNow,radioMeta,audio);screen.append(frame,radioPanel);media.append(image,screen);

  const tvControls=el('div','harbor-tv-controls');
  const tvExpand=button('EXPAND TV','',async()=>{try{if(media.requestFullscreen)await media.requestFullscreen();else if(frame.requestFullscreen)await frame.requestFullscreen()}catch{tvStatus.textContent='Use the full-screen control inside the video player.'}});
  const tvForm=el('form','harbor-tv-form');
  const tvLabel=el('label',null,'Bring a YouTube video to this Lighthouse');
  const tvInput=el('input');tvInput.type='url';tvInput.inputMode='url';tvInput.placeholder='Paste a YouTube video link';tvInput.autocomplete='off';tvInput.maxLength=240;
  const tvLoad=button('WATCH HERE','',()=>{});tvLoad.type='submit';tvLabel.append(tvInput);tvForm.append(tvLabel,tvLoad);
  const tvStatus=el('p','harbor-live-status','The Lighthouse expands into a theater when you choose TV. Nothing starts automatically.');tvStatus.setAttribute('role','status');
  tvControls.append(tvExpand);
  const tvGuide=el('div','harbor-tv-guide');tvGuide.setAttribute('aria-label','Free official TV streams');
  const tvChannels=[
    {name:'ABC News Live',id:'gN0PZCe-kwQ'},
    {name:'NBC News NOW',id:'X2yC-iFqVv0'},
    {name:'CBS News 24/7',id:'PLdwd3wmC8c'},
    {name:'Bloomberg TV',id:'iEpJwprxDdk'},
    {name:'NASA TV',id:'21X5lGlDOfg'}
  ];
  const tvChannelButtons=tvChannels.map(channel=>button(channel.name,'',()=>loadTvChannel(channel)));
  tvGuide.append(...tvChannelButtons);

  const localControls=el('div','harbor-local-controls');
  const localButton=button('FIND STATIONS NEAR ME','',()=>findLocalStations(true));
  const localStatus=el('p','harbor-live-status','Allow location once and Lighthouse will find stations from your area. Exact coordinates go to the location lookup service once and are not saved by Lighthouse.');localStatus.setAttribute('role','status');
  localControls.append(localButton,localStatus);

  const searchForm=el('form','harbor-radio-search');
  const searchLabel=el('label',null,'Find an internet radio station');
  const searchInput=el('input');searchInput.type='search';searchInput.name='station';searchInput.placeholder='Try jazz, Baltimore, news, or a station name';searchInput.maxLength=80;searchInput.autocomplete='off';
  const searchButton=button('SEARCH RADIO','',()=>{});searchButton.type='submit';
  searchLabel.append(searchInput);searchForm.append(searchLabel,searchButton);
  const status=el('p','harbor-live-status','Radio search is powered by the public Radio Browser directory. Station availability can change.');status.setAttribute('role','status');
  const suggestions=el('div','harbor-radio-suggestions');suggestions.setAttribute('aria-label','Suggested radio searches');
  const iheartControls=el('div','harbor-iheart-controls');
  const iheartLabel=el('label',null,'Choose an iHeartRadio station');
  const iheartSelect=el('select');
  [
    ['Z104.3 · Baltimore','https://www.iheart.com/live/1077/?embed=true&theme=dark'],
    ['Magic 95.9 · Baltimore','https://www.iheart.com/live/magic-959-8938/?embed=true&theme=dark'],
    ['Mix 106.5 · Baltimore','https://www.iheart.com/live/mix-1065-10792/?embed=true&theme=dark'],
    ['Spirit 1400 · Baltimore','https://www.iheart.com/live/spirit-1400-8940/?embed=true&theme=dark'],
    ["Today's 101.9 · Baltimore",'https://www.iheart.com/live/todays-1019-10803/?embed=true&theme=dark']
  ].forEach(([label,value])=>{const option=el('option',null,label);option.value=value;iheartSelect.append(option)});
  const iheartBrowse=el('a',null,'Browse more stations on iHeart');iheartBrowse.href='https://www.iheart.com/live/';iheartBrowse.target='_blank';iheartBrowse.rel='noopener noreferrer';
  iheartLabel.append(iheartSelect);iheartControls.append(iheartLabel,iheartBrowse);
  const iheartCustom=el('form','harbor-iheart-custom');
  const iheartCustomLabel=el('label',null,'Use any iHeart station');
  const iheartCustomInput=el('input');iheartCustomInput.type='url';iheartCustomInput.inputMode='url';iheartCustomInput.placeholder='Paste an iHeart station link';iheartCustomInput.autocomplete='off';iheartCustomInput.maxLength=240;
  const iheartCustomButton=button('LOAD IN LIGHTHOUSE','',()=>{});iheartCustomButton.type='submit';
  const iheartStatus=el('p','harbor-live-status','Choose a quick station above, or find any station on iHeart and paste its link here.');iheartStatus.setAttribute('role','status');
  iheartCustomLabel.append(iheartCustomInput);iheartCustom.append(iheartCustomLabel,iheartCustomButton);
  const results=el('div','harbor-radio-results');
  function disclosure(label,...content){const box=el('details','harbor-live-disclosure');const summary=el('summary',null,label);box.append(summary,...content);return box}
  const tvCustom=disclosure('Bring a different YouTube video',tvForm);
  const radioSearch=disclosure('Search for another station',searchForm,suggestions);
  const iheartCustomPanel=disclosure('Use a different iHeart station',iheartCustom);
  dialog.append(close,eyebrow,title,intro,modes,media,tvGuide,tvControls,tvCustom,tvStatus,localControls,radioSearch,status,results,iheartControls,iheartCustomPanel,iheartStatus);
  app.append(dialog);
  const categoryLabel=el('label','harbor-channel-category','Lighthouse channels');
  const categorySelect=el('select');
  Object.entries(experiences).forEach(([id,experience])=>{const option=el('option',null,experience.name);option.value=id;categorySelect.append(option)});
  categoryLabel.append(categorySelect);modes.before(categoryLabel);
  categorySelect.addEventListener('change',()=>{audio.pause();activeCategory=categorySelect.value;dialog.dataset.mode==='radio'?showRadio():dialog.dataset.mode==='iheart'?showIHeart():showVisual()});
  let returnToMap=null;
  centerPlayer=(host,onClose)=>{
    if(dialog.open)dialog.close();
    host.append(dialog);dialog.classList.add('harbor-center-player');close.textContent='← Home';returnToMap=onClose;
    activeCategory='music';categorySelect.value=activeCategory;dialog.show();showVisual();close.focus({preventScroll:true});
  };

  function setMode(mode){
    if(dialog.classList.contains('harbor-center-player'))requestAnimationFrame(()=>dialog.scrollIntoView({block:'start',behavior:'instant'}));
    const radio=mode==='radio',iheart=mode==='iheart',visual=mode==='visual';visualButton.setAttribute('aria-pressed',String(visual));radioButton.setAttribute('aria-pressed',String(radio));iheartButton.setAttribute('aria-pressed',String(iheart));
    dialog.dataset.mode=mode;frame.hidden=radio;radioPanel.hidden=!radio;tvGuide.hidden=!visual;tvControls.hidden=!visual;tvCustom.hidden=!visual;tvStatus.hidden=!visual;localControls.hidden=!radio;radioSearch.hidden=!radio;searchForm.hidden=!radio;suggestions.hidden=!radio;status.hidden=!radio;results.hidden=!radio;iheartControls.hidden=!iheart;iheartCustomPanel.hidden=!iheart;iheartCustom.hidden=!iheart;iheartStatus.hidden=!iheart;
  }
  function loadTvChannel(channel){
    frame.src=`https://www.youtube-nocookie.com/embed/${channel.id}?rel=0`;frame.title=channel.name;
    tvChannelButtons.forEach((item,index)=>item.setAttribute('aria-pressed',String(tvChannels[index]===channel)));
    tvStatus.textContent=`${channel.name} loaded. Press play or choose Expand TV. Live-stream availability is controlled by the broadcaster.`;
    try{localStorage.setItem(`lighthouse-tv-${activeCategory}`,JSON.stringify(channel))}catch{}
  }
  function showVisual(){
    audio.pause();dialog.scrollTop=0;setMode('visual');
    const experience=experiences[activeCategory];let saved=null;try{saved=JSON.parse(localStorage.getItem(`lighthouse-tv-${activeCategory}`)||'null')}catch{}
    if(saved?.id&&/^[A-Za-z0-9_-]{11}$/.test(saved.id))loadTvChannel(saved);else{frame.src=`https://www.youtube-nocookie.com/embed/${experience.video}?rel=0`;tvChannelButtons.forEach(item=>item.setAttribute('aria-pressed','false'))}
    title.textContent=`${experience.name} Lighthouse · Watch`;
    intro.textContent='The Lighthouse opens into a larger theater. Choose play when you are ready, expand to full screen, or bring in a YouTube video.';
  }
  function showRadio(){
    const experience=experiences[activeCategory];dialog.scrollTop=0;frame.src='about:blank';setMode('radio');title.textContent=`${experience.name} Lighthouse · Radio`;
    intro.textContent='Search thousands of internet stations, then listen without leaving your Lighthouse.';
    searchInput.placeholder=`Try ${experience.prompt} or a station name`;
    suggestions.replaceChildren(...experience.suggestions.map(term=>button(term,'',()=>{searchInput.value=term;searchStations(term)})));
    try{const saved=JSON.parse(localStorage.getItem(`lighthouse-radio-${activeCategory}`)||'null');if(saved?.url&&/^https:\/\//i.test(saved.url)){radioNow.textContent=saved.name;radioMeta.textContent=saved.meta;audio.src=saved.url;status.textContent='Your last station for this Lighthouse is ready. Press play when you want it.'}}catch{}
    findLocalStations(false);
  }
  function showIHeart(){
    audio.pause();dialog.scrollTop=0;setMode('iheart');frame.title='Official iHeartRadio station widget';
    let station=iheartSelect.value;
    try{const saved=localStorage.getItem(`lighthouse-iheart-${activeCategory}`);if(saved&&toIHeartEmbed(saved)){station=saved;iheartCustomInput.value=saved;iheartStatus.textContent='Your station for this Lighthouse is ready. Press play in the official iHeart player.'}}catch{}
    frame.src=toIHeartEmbed(station)||station;
    title.textContent=`${experiences[activeCategory].name} Lighthouse · iHeartRadio`;
    intro.textContent='Choose a quick station or bring in any official iHeart station. The player stays inside this Lighthouse and does not autoplay.';
  }
  function openLive(category,mode){activeCategory=category;categorySelect.value=category;dialog.showModal();mode==='radio'?showRadio():showVisual();}
  iheartSelect.addEventListener('change',()=>{if(iheartButton.getAttribute('aria-pressed')==='true'){frame.src=iheartSelect.value}});
  function toIHeartEmbed(value){
    try{const url=new URL(value);if(!['iheart.com','www.iheart.com'].includes(url.hostname.toLowerCase()))return null;const match=url.pathname.match(/^\/live\/([a-z0-9-]+)\/?$/i);if(!match)return null;return `https://www.iheart.com/live/${match[1]}/?embed=true&theme=dark`}catch{return null}
  }
  iheartCustom.addEventListener('submit',event=>{
    event.preventDefault();const station=iheartCustomInput.value.trim();const embed=toIHeartEmbed(station);
    if(!embed){iheartStatus.textContent='Paste a complete iHeart station link, such as https://www.iheart.com/live/station-name-1234/';return}
    frame.src=embed;iheartStatus.textContent='Station loaded. Press play in the official iHeart player.';
    try{localStorage.setItem(`lighthouse-iheart-${activeCategory}`,station)}catch{}
  });
  function youtubeVideoId(value){
    try{const url=new URL(value);const host=url.hostname.toLowerCase();let id='';if(host==='youtu.be')id=url.pathname.slice(1).split('/')[0];else if(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)){id=url.searchParams.get('v')||url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})/)?.[1]||''}return /^[A-Za-z0-9_-]{11}$/.test(id)?id:null}catch{return null}
  }
  tvForm.addEventListener('submit',event=>{
    event.preventDefault();const id=youtubeVideoId(tvInput.value.trim());if(!id){tvStatus.textContent='Paste a complete YouTube video link.';return}frame.src=`https://www.youtube-nocookie.com/embed/${id}?rel=0`;tvChannelButtons.forEach(item=>item.setAttribute('aria-pressed','false'));tvStatus.textContent='Video loaded. Press play or choose Expand TV.';
  });

  async function fetchStations(params){
    const hosts=['https://de1.api.radio-browser.info','https://de2.api.radio-browser.info','https://fi1.api.radio-browser.info'];
    for(const host of hosts){try{const response=await fetch(`${host}/json/stations/search?${params}`,{headers:{Accept:'application/json'}});if(response.ok)return await response.json()}catch{}}
    return [];
  }
  function renderStations(stations,emptyMessage){
    stations=stations.filter(station=>station.name&&/^https:\/\//i.test(station.url_resolved||'')).filter((station,index,list)=>list.findIndex(item=>item.url_resolved===station.url_resolved)===index).slice(0,12);
    if(!stations.length){status.textContent=emptyMessage;return}
    status.textContent=`${stations.length} stations found. Choose one to begin listening.`;
    stations.forEach(station=>{
      const item=button('', 'harbor-radio-result',()=>{
        audio.pause();audio.src=station.url_resolved;radioNow.textContent=station.name;radioMeta.textContent=[station.state||station.country,station.tags].filter(Boolean).join(' · ').slice(0,130)||'Live internet radio';
        audio.play().catch(()=>{status.textContent='This station did not start. Choose another station or press play in the audio controls.'});
        try{localStorage.setItem(`lighthouse-radio-${activeCategory}`,JSON.stringify({name:station.name,url:station.url_resolved,meta:radioMeta.textContent}))}catch{}
      });
      const mark=el('span','harbor-radio-mark','◉');const copy=el('span');copy.append(el('strong',null,station.name),el('small',null,[station.state||station.countrycode,station.tags].filter(Boolean).join(' · ').slice(0,90)||'Internet radio'));item.append(mark,copy);results.append(item);
    });
  }
  async function searchRegion(region){
    results.replaceChildren();status.textContent=`Finding stations in ${region.state || region.city}…`;
    const params=new URLSearchParams({countrycode:'US',state:region.state||region.city,hidebroken:'true',is_https:'true',limit:'40',order:'votes',reverse:'true'});
    const stations=await fetchStations(params);
    localStatus.textContent=`Local dial: ${[region.city,region.state].filter(Boolean).join(', ')}. Only this city and state are remembered on this device.`;
    renderStations(stations,`No playable stations were found for ${region.state||region.city}. Try the station search below.`);
  }
  async function findLocalStations(forcePrompt){
    if(!forcePrompt){try{const saved=JSON.parse(localStorage.getItem('lighthouse-radio-region')||'null');if(saved?.state||saved?.city){await searchRegion(saved);return}}catch{}}
    if(!forcePrompt)return;
    if(!navigator.geolocation){localStatus.textContent='Location is unavailable in this browser. Search by city, state, or station below.';return}
    localButton.disabled=true;localStatus.textContent='Waiting for location permission…';
    navigator.geolocation.getCurrentPosition(async position=>{
      try{
        const query=new URLSearchParams({latitude:String(position.coords.latitude),longitude:String(position.coords.longitude),localityLanguage:'en'});
        const response=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${query}`);
        if(!response.ok)throw new Error('REGION_LOOKUP_FAILED');
        const data=await response.json();const region={city:String(data.locality||data.city||'').slice(0,80),state:String(data.principalSubdivision||'').slice(0,80)};
        if(!region.state&&!region.city)throw new Error('REGION_NOT_FOUND');
        try{localStorage.setItem('lighthouse-radio-region',JSON.stringify(region))}catch{}
        await searchRegion(region);
      }catch{localStatus.textContent='Lighthouse could not identify the area. Search by city, state, or station below.'}finally{localButton.disabled=false}
    },()=>{localButton.disabled=false;localStatus.textContent='Location was not shared. Search by city, state, or station below.'},{enableHighAccuracy:false,timeout:9000,maximumAge:86400000});
  }
  async function searchStations(query){
    status.textContent='Searching the radio dial…';results.replaceChildren();
    const params=new URLSearchParams({name:query,hidebroken:'true',is_https:'true',limit:'10',order:'votes',reverse:'true'});
    renderStations(await fetchStations(params),'No playable HTTPS stations were found. Try a different city, state, name, or style.');
  }
  searchForm.addEventListener('submit',event=>{event.preventDefault();const query=searchInput.value.trim();if(query.length<2){status.textContent='Enter at least two letters to search for a station.';return}searchStations(query)});
  dialog.addEventListener('close',()=>{audio.pause();frame.src='about:blank';if(returnToMap){const restore=returnToMap;returnToMap=null;dialog.classList.remove('harbor-center-player');app.append(dialog);close.textContent='Close ×';restore();}});
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});

  app.querySelectorAll('.harbor-destination').forEach(card=>{
    const category=card.dataset.destination;if(!experiences[category])return;
    const preview=card.querySelector('.harbor-feature-preview');if(!preview)return;
    const lantern=el('div','harbor-mini-lighthouse');
    const architecture=el('img','harbor-mini-lighthouse-art');architecture.src=art;architecture.alt='';architecture.setAttribute('aria-hidden','true');
    preview.replaceWith(lantern);lantern.append(architecture,preview);
    const experience=experiences[category];const controls=el('div','harbor-mini-controls');controls.setAttribute('aria-label',`${experience.name} Lighthouse media controls`);
    const guideButton=button(experience.guide,'',()=>{const video=preview.querySelector('video');const play=preview.querySelector('.harbor-feature-play');if(video){video.paused?video.play().catch(()=>{}):video.pause()}else if(play){play.click();guideButton.setAttribute('aria-pressed','true')}});
    guideButton.setAttribute('aria-pressed','false');
    const guideVideo=preview.querySelector('video');
    if(guideVideo){guideVideo.addEventListener('play',()=>{guideButton.textContent='Pause';guideButton.setAttribute('aria-pressed','true')});guideVideo.addEventListener('pause',()=>{guideButton.textContent=experience.guide;guideButton.setAttribute('aria-pressed','false')});guideVideo.addEventListener('ended',()=>{guideButton.textContent=experience.guide;guideButton.setAttribute('aria-pressed','false')})}
    controls.append(guideButton,button(experience.tv,'',()=>openLive(category,'visual')),button(experience.radio,'',()=>openLive(category,'radio')));
    const options=el('details','harbor-media-options');options.append(el('summary',null,'Watch / Listen'),controls);card.append(options);card.classList.add('has-mini-lighthouse');
  });
}


// Lighthouse Locksmith: an independent storefront with its own media placement.
// This first-look entrance is intentionally separate from existing category tools.
{
  const nav=document.querySelector('.harbor-nav');
  if(nav&&!nav.querySelector('[data-destination="locksmith"]')){
    const store='https://www.easylotstoragesolutions.com/lighthouse-locksmith?release=20260908-network1';
    const art=new URL('./assets/lighthouse-media-console-2040.webp',import.meta.url).href;
    const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
    const style=make('style');style.textContent=
      '.harbor-nav.has-locksmith{grid-template-columns:repeat(6,minmax(0,1fr))}.locksmith-feature-empty{width:100%;height:100%;position:relative;background:radial-gradient(circle,#174963,#041624);display:grid;place-items:center;overflow:hidden}.locksmith-feature-empty img{width:100%!important;height:100%!important;position:absolute;object-fit:contain!important;opacity:.7}.locksmith-feature-empty span{position:relative;padding:5px 8px;border-radius:6px;background:#031422db;color:#fff0d2;font:10px Arial,sans-serif}.locksmith-media-controls{grid-template-columns:1fr}.locksmith-media-controls .locksmith-main-tv{min-height:38px;font-size:11px}.locksmith-main-tv{width:100%;min-height:36px;background:#0b2a42;color:#fff0d2;border:0;border-bottom:1px solid #edca8b44;cursor:pointer;font:600 12px Arial,sans-serif}.locksmith-main-dialog{width:min(620px,calc(100% - 24px));max-height:calc(100dvh - 24px);overflow:auto;border:1px solid #edca8b77;border-radius:16px;background:#08253b;color:#fff0d2;padding:24px}.locksmith-main-dialog::backdrop{background:#00101cd9}.locksmith-main-dialog button,.locksmith-main-dialog a{display:inline-block;min-height:44px;padding:12px 18px;background:#123e58;color:#fff0d2;border:1px solid #edca8b88;border-radius:24px;cursor:pointer;text-decoration:none}.locksmith-main-dialog>button{float:right}.locksmith-main-dialog .locksmith-main-screen{clear:both;aspect-ratio:16/9;display:grid;place-content:center;text-align:center;background:#051321;border:1px solid #edca8b55;margin:18px 0}.locksmith-main-dialog p{line-height:1.6}.locksmith-main-dialog h2{font:600 26px Georgia,serif}@media(max-width:1100px){.harbor-nav.has-locksmith{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:700px){.harbor-nav.has-locksmith{grid-template-columns:repeat(2,minmax(0,1fr))}.harbor-nav.has-locksmith .harbor-destination:last-child{grid-column:auto;display:block}.harbor-nav.has-locksmith .harbor-destination:last-child img{width:100%}}';
    document.head.append(style);
    const card=make('article','harbor-destination has-mini-lighthouse');card.dataset.destination='locksmith';
    const preview=make('div','harbor-feature-preview');const empty=make('div','locksmith-feature-empty');
    const image=make('img','harbor-mini-lighthouse-art');image.src=art;image.alt='';image.loading='lazy';empty.append(make('span',null,'Watch Locksmith TV'));preview.append(empty);const lantern=make('div','harbor-mini-lighthouse');lantern.append(image,preview);
    const tv=make('button','locksmith-main-tv','Locksmith TV');tv.type='button';
    const enter=make('a','harbor-feature-enter');enter.href=store;enter.target='_top';enter.setAttribute('aria-label','Enter Locksmith');
    const label=make('span','harbor-destination-text');label.append(make('strong',null,'Enter Locksmith'),make('small',null,'Explore the Locksmith store'));enter.append(label,make('span','harbor-destination-arrow','↗'));
    const controls=make('div','harbor-mini-controls locksmith-media-controls');const radio=make('a','locksmith-main-tv','Lounge Radio');radio.href='https://www.easylotstoragesolutions.com/customer-portal?view=locksmith&locksmithScreen=lounge';radio.target='_top';controls.append(tv,radio);const options=make('details','harbor-media-options');options.append(make('summary',null,'Watch / Listen'),controls);card.append(lantern,enter,options);nav.append(card);nav.classList.add('has-locksmith');
    const modal=make('dialog','locksmith-main-dialog');modal.setAttribute('aria-labelledby','locksmith-main-tv-title');
    const close=make('button',null,'Close ×');close.type='button';close.addEventListener('click',()=>modal.close());
    const title=make('h2',null,'Lighthouse Locksmith TV');title.id='locksmith-main-tv-title';
    const screen=make('div','locksmith-main-screen');const welcome=make('video');welcome.src=new URL('./assets/locksmith-welcome.mp4',import.meta.url).href;welcome.controls=true;welcome.playsInline=true;welcome.preload='metadata';welcome.style.width='100%';screen.append(welcome);modal.addEventListener('close',()=>welcome.pause());
    const visit=make('a',null,'Open the Locksmith TV network →');visit.href=store+'&screen=network';visit.target='_top';
    modal.append(close,title,screen,make('p',null,'Welcome to the trade. Watch member videos, meet creators and explore the Locksmith community.'),visit);document.body.append(modal);
    tv.addEventListener('click',()=>{document.querySelectorAll('video,audio').forEach(v=>v.pause());modal.showModal()});
    modal.addEventListener('click',event=>{if(event.target===modal)modal.close()});
  }
}

// Keep the Locksmith preview readable under the home page's shared typography.
{const style=document.createElement('style');style.textContent='.locksmith-main-dialog h2,.locksmith-main-dialog p,.locksmith-main-dialog strong{color:#fff0d2}.harbor-destination[data-destination=locksmith] .harbor-feature-enter{text-decoration:none}.harbor-destination[data-destination=locksmith] .harbor-destination-text small{display:block;margin-top:4px;color:#dfebf3;font:11px Arial,sans-serif}';document.head.append(style);}
