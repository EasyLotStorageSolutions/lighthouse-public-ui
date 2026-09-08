// Keep the original, already-wired tools in their own destination. Moving these
// nodes (rather than recreating their HTML) preserves forms, demos and listeners.
export function restoreDestination({panel, source, overview, section}) {
  const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n;};
  panel.classList.add('destination-restored');
  const intro=overview.querySelector('.harbor-intro');
  intro.querySelector('h2').textContent=section.name;
  const phone=overview.querySelector('.yvette-phone-group');
  const guide=make('div','destination-guide');
  const guideCopy=make('div','destination-guide-copy');
  guideCopy.append(make('h3',null,section.title));
  intro.querySelectorAll('.harbor-availability,.harbor-guide-note').forEach(n=>guideCopy.append(n));
  guide.append(guideCopy);if(phone)guide.append(phone);
  const demoElement=phone?.querySelector('.yvette-legacy #work-phone,.yvette-legacy #marketplace-phone');
  let demo;
  if(demoElement){
    demo=make('div','destination-demo');demo.append(demoElement);demoElement.classList.remove('yvette-unframed');
    phone.querySelector('.yvette-mode')?.remove();phone.querySelector('.yvette-legacy').hidden=true;phone.querySelector('.yvette-screen').hidden=false;
  }
  overview.className='destination-introduction';
  const actions=make('div','destination-actions');
  intro.querySelectorAll('.harbor-start a,.harbor-paths a').forEach(a=>actions.append(a));
  intro.querySelectorAll('.harbor-start,.harbor-paths').forEach(n=>n.remove());
  intro.append(actions);

  const tabs=make('div','destination-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',section.name+' areas');
  const content=make('div','harbor-tools destination-content');
  if(source){
    content.append(source);
    // The prior cleanup nested the actual Work tools inside a second disclosure.
    source.querySelectorAll('.yvette-section-details').forEach(details=>{
      [...details.children].filter(n=>n.tagName!=='SUMMARY').forEach(n=>details.before(n));details.remove();
    });
    if(section.id==='social'){
      const hub=make('nav','destination-community-grid');hub.setAttribute('aria-label','Lighthouse World community preview');
      const communityBase='https://lighthouse-world-entrance.sreichert21.chatgpt.site/social.html';
      [['home','Your feed','See the chronological sample feed and saved stories.'],['explore','People & communities','Explore shared interests and sample communities.'],['create','Create & share','Try a post or keep a private draft.'],['messages','Messages','Try message drafts in the local preview.'],['my','My Lighthouse','Personal Spaces, Top People and saved posts.'],['memories','Memory library','Keep moments in your private preview library.']].forEach(([route,title,description])=>{
        const link=make('a','destination-community-link');link.href=communityBase+'#'+route;link.target='_top';link.append(make('strong',null,title+' ↗'),make('span',null,description));hub.append(link);
      });
      source.querySelector('.yvette-category-copy').append(hub);
    }
  }
  const labels={storage:'Storage & rentals',employment:'Work & hiring',social:'Community',marketplace:'Buying & selling',music:'Studio & channel'};
  const guideLabel=section.id==='storage'?'Lot tour & guide':'Yvette’s guide';
  const views=[{id:'tools',label:labels[section.id],node:content},{id:'guide',label:guideLabel,node:guide}];
  if(demo)views.splice(1,0,{id:'demo',label:section.id==='employment'?'Work demo':'Listing demo',node:demo});
  function select(id,focus=false){
    for(const view of views){
      const active=view.id===id;
      if(!active)view.node.querySelectorAll('video,audio').forEach(media=>media.pause());
      view.node.hidden=!active;view.button.setAttribute('aria-selected',String(active));view.button.tabIndex=active?0:-1;
      if(active&&focus)view.button.focus();
    }
    panel.dataset.destinationTab=id;
  }
  views.forEach((view,index)=>{
    const button=make('button','destination-tab',view.label);button.type='button';view.button=button;
    button.id=`destination-${section.id}-${view.id}-tab`;button.setAttribute('role','tab');
    view.node.id=`destination-${section.id}-${view.id}`;view.node.setAttribute('role','tabpanel');view.node.setAttribute('aria-labelledby',button.id);view.node.tabIndex=0;
    button.setAttribute('aria-controls',view.node.id);button.addEventListener('click',()=>select(view.id));
    button.addEventListener('keydown',event=>{
      let next;if(event.key==='ArrowRight')next=(index+1)%views.length;if(event.key==='ArrowLeft')next=(index+views.length-1)%views.length;if(event.key==='Home')next=0;if(event.key==='End')next=views.length-1;
      if(next!==undefined){event.preventDefault();select(views[next].id,true);}
    });tabs.append(button);
  });
  const lounge=make('button','destination-lounge','▶ TV & radio');lounge.type='button';
  lounge.addEventListener('click',()=>panel.querySelector('.lighthouse-shared-entrance')?.click());
  const navigation=make('div','destination-navigation');navigation.append(tabs,lounge);
  if(demo)navigation.classList.add('has-demo');
  panel.append(navigation,...views.map(view=>view.node));
  source?.querySelector('#phone-demo-replay')?.addEventListener('click',()=>{select(demo?'demo':'guide',true);navigation.scrollIntoView({block:'start'});});
  panel.addEventListener('lighthouse:reveal',event=>{
    const target=event.detail;if(!(target instanceof Element)||!panel.contains(target))return;
    select(views.find(view=>view.node.contains(target))?.id||'tools');
    for(let node=target;node&&node!==panel;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;
  });
  select('tools');
}
