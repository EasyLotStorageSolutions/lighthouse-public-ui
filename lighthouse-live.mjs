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
  const results=el('div','harbor-radio-results');
  dialog.append(close,eyebrow,title,intro,modes,media,searchForm,suggestions,iheartControls,status,results);
  app.append(dialog);

  function setMode(mode){
    const radio=mode==='radio',iheart=mode==='iheart',visual=mode==='visual';visualButton.setAttribute('aria-pressed',String(visual));radioButton.setAttribute('aria-pressed',String(radio));iheartButton.setAttribute('aria-pressed',String(iheart));
    frame.hidden=radio;radioPanel.hidden=!radio;searchForm.hidden=!radio;suggestions.hidden=!radio;status.hidden=!radio;results.hidden=!radio;iheartControls.hidden=!iheart;
  }
  function showVisual(){
    audio.pause();dialog.scrollTop=0;setMode('visual');
    const experience=experiences[activeCategory];frame.src=`https://www.youtube-nocookie.com/embed/${experience.video}?rel=0`;
    title.textContent=`${experience.name} Lighthouse · Watch`;
    intro.textContent='Choose play inside the lantern when you are ready. The channel does not autoplay.';
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
    audio.pause();dialog.scrollTop=0;setMode('iheart');frame.title='Official iHeartRadio station widget';frame.src=iheartSelect.value;
    title.textContent=`${experiences[activeCategory].name} Lighthouse · iHeartRadio`;
    intro.textContent='Choose a station below, then use the official iHeartRadio player inside this Lighthouse. It does not autoplay.';
  }
  function openLive(category,mode){activeCategory=category;dialog.showModal();mode==='radio'?showRadio():showVisual();}
  iheartSelect.addEventListener('change',()=>{if(iheartButton.getAttribute('aria-pressed')==='true'){frame.src=iheartSelect.value}});

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
