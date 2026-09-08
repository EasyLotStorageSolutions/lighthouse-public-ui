const app=document.querySelector('.harbor-app');
if(app){
  const experiences={
    storage:{name:'Storage',guide:'Tour',tv:'Property TV',radio:'Local Radio',video:'0TPmbw4sPUo',prompt:'Baltimore',suggestions:['Baltimore','weather','talk']},
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
  tvControls.append(tvExpand,tvForm);

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
  dialog.append(close,eyebrow,title,intro,modes,media,tvControls,tvStatus,searchForm,suggestions,iheartControls,iheartCustom,iheartStatus,status,results);
  app.append(dialog);

  function setMode(mode){
    const radio=mode==='radio',iheart=mode==='iheart',visual=mode==='visual';visualButton.setAttribute('aria-pressed',String(visual));radioButton.setAttribute('aria-pressed',String(radio));iheartButton.setAttribute('aria-pressed',String(iheart));
    dialog.dataset.mode=mode;frame.hidden=radio;radioPanel.hidden=!radio;tvControls.hidden=!visual;tvStatus.hidden=!visual;searchForm.hidden=!radio;suggestions.hidden=!radio;status.hidden=!radio;results.hidden=!radio;iheartControls.hidden=!iheart;iheartCustom.hidden=!iheart;iheartStatus.hidden=!iheart;
  }
  function showVisual(){
    audio.pause();dialog.scrollTop=0;setMode('visual');
    const experience=experiences[activeCategory];frame.src=`https://www.youtube-nocookie.com/embed/${experience.video}?rel=0`;
    title.textContent=`${experience.name} Lighthouse · Watch`;
    intro.textContent='The Lighthouse opens into a larger theater. Choose play when you are ready, expand to full screen, or bring in a YouTube video.';
  }
  function showRadio(){
    const experience=experiences[activeCategory];dialog.scrollTop=0;frame.src='about:blank';setMode('radio');title.textContent=`${experience.name} Lighthouse · Radio`;
    intro.textContent='Search thousands of internet stations, then listen without leaving your Lighthouse.';
    searchInput.placeholder=`Try ${experience.prompt} or a station name`;
    suggestions.replaceChildren(...experience.suggestions.map(term=>button(term,'',()=>{searchInput.value=term;searchStations(term)})));
    try{const saved=JSON.parse(localStorage.getItem(`lighthouse-radio-${activeCategory}`)||'null');if(saved?.url&&/^https:\/\//i.test(saved.url)){radioNow.textContent=saved.name;radioMeta.textContent=saved.meta;audio.src=saved.url;status.textContent='Your last station for this Lighthouse is ready. Press play when you want it.'}}catch{}
    setTimeout(()=>searchInput.focus(),0);
  }
  function showIHeart(){
    audio.pause();dialog.scrollTop=0;setMode('iheart');frame.title='Official iHeartRadio station widget';
    let station=iheartSelect.value;
    try{const saved=localStorage.getItem(`lighthouse-iheart-${activeCategory}`);if(saved&&toIHeartEmbed(saved)){station=saved;iheartCustomInput.value=saved;iheartStatus.textContent='Your station for this Lighthouse is ready. Press play in the official iHeart player.'}}catch{}
    frame.src=toIHeartEmbed(station)||station;
    title.textContent=`${experiences[activeCategory].name} Lighthouse · iHeartRadio`;
    intro.textContent='Choose a quick station or bring in any official iHeart station. The player stays inside this Lighthouse and does not autoplay.';
  }
  function openLive(category,mode){activeCategory=category;dialog.showModal();mode==='radio'?showRadio():showVisual();}
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
    event.preventDefault();const id=youtubeVideoId(tvInput.value.trim());if(!id){tvStatus.textContent='Paste a complete YouTube video link.';return}frame.src=`https://www.youtube-nocookie.com/embed/${id}?rel=0`;tvStatus.textContent='Video loaded. Press play or choose Expand TV.';
  });

  async function searchStations(query){
    status.textContent='Searching the radio dial…';results.replaceChildren();
    const params=new URLSearchParams({name:query,hidebroken:'true',is_https:'true',limit:'10',order:'votes',reverse:'true'});
    const hosts=['https://de1.api.radio-browser.info','https://de2.api.radio-browser.info','https://fi1.api.radio-browser.info'];
    let stations=[];
    for(const host of hosts){try{const response=await fetch(`${host}/json/stations/search?${params}`,{headers:{Accept:'application/json'}});if(response.ok){stations=await response.json();break}}catch{}}
    stations=stations.filter(station=>station.name&&/^https:\/\//i.test(station.url_resolved||'')).slice(0,8);
    if(!stations.length){status.textContent='No playable HTTPS stations were found. Try a different name or style.';return}
    status.textContent=`${stations.length} stations found. Choose one to begin listening.`;
    stations.forEach(station=>{
      const item=button('', 'harbor-radio-result',()=>{
        audio.pause();audio.src=station.url_resolved;radioNow.textContent=station.name;radioMeta.textContent=[station.country,station.tags].filter(Boolean).join(' · ').slice(0,130)||'Live internet radio';
        audio.play().catch(()=>{status.textContent='This station did not start. Choose another station or press play in the audio controls.'});
        try{localStorage.setItem(`lighthouse-radio-${activeCategory}`,JSON.stringify({name:station.name,url:station.url_resolved,meta:radioMeta.textContent}))}catch{}
      });
      const mark=el('span','harbor-radio-mark','◉');const copy=el('span');copy.append(el('strong',null,station.name),el('small',null,[station.state||station.countrycode,station.tags].filter(Boolean).join(' · ').slice(0,90)||'Internet radio'));item.append(mark,copy);results.append(item);
    });
  }
  searchForm.addEventListener('submit',event=>{event.preventDefault();const query=searchInput.value.trim();if(query.length<2){status.textContent='Enter at least two letters to search for a station.';return}searchStations(query)});
  dialog.addEventListener('close',()=>{audio.pause();frame.src='about:blank'});
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});

  app.querySelectorAll('.harbor-destination').forEach(card=>{
    const category=card.dataset.destination;if(!experiences[category])return;
    const preview=card.querySelector('.harbor-feature-preview');if(!preview)return;
    const lantern=el('div','harbor-mini-lighthouse');
    const architecture=el('img','harbor-mini-lighthouse-art');architecture.src=art;architecture.alt='';architecture.setAttribute('aria-hidden','true');
    preview.replaceWith(lantern);lantern.append(architecture,preview);
    const experience=experiences[category];const controls=el('div','harbor-mini-controls');controls.setAttribute('aria-label',`${experience.name} Lighthouse media controls`);
    controls.append(
      button(experience.guide,'',()=>{const video=preview.querySelector('video');const play=preview.querySelector('.harbor-feature-play');if(video){video.paused?video.play().catch(()=>{}):video.pause()}else if(play)play.click()}),
      button(experience.tv,'',()=>openLive(category,'visual')),
      button(experience.radio,'',()=>openLive(category,'radio'))
    );
    lantern.append(controls);card.classList.add('has-mini-lighthouse');
  });
}
