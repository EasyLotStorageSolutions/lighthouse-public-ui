// Homepage-only layout bridge. Restore original Wix styles on other routes.
(() => {
  if(window.__lighthouseHomeLayout)return;
  window.__lighthouseHomeLayout=true;
  const origin='https://easylotstoragesolutions.github.io';
  const paths=new Set(['marketplace-home.html','marketplace-header.html','marketplace-footer.html'].map(f=>'/lighthouse-public-ui/'+f));
  const changed=new Map();const heights=new WeakMap();let lastPath=location.pathname;
  function set(node,key,value){if(!node)return;if(!changed.has(node))changed.set(node,new Map());const saved=changed.get(node);if(!saved.has(key))saved.set(key,[node.style.getPropertyValue(key),node.style.getPropertyPriority(key)]);if(node.style.getPropertyValue(key)!==value)node.style.setProperty(key,value,'important');}
  function restore(){for(const [node,props]of changed)for(const [key,[value,priority]]of props){if(value)node.style.setProperty(key,value,priority);else node.style.removeProperty(key);}changed.clear();}
  function frames(){return [...document.querySelectorAll('iframe')].filter(f=>{try{const u=new URL(f.src);return u.origin===origin&&paths.has(u.pathname)&&(location.pathname==='/'||!u.pathname.endsWith('/marketplace-home.html'))}catch{return false}});}
  function layout(frame,height){
    const component=frame.closest('[id^="comp-"]');if(!component)return;
    set(frame,'width','100%');set(frame,'height',height+'px');
    set(component,'width','100%');set(component,'max-width','1120px');set(component,'min-width','0px');set(component,'margin','0px auto');set(component,'left','auto');set(component,'height',height+'px');set(component,'min-height','0px');
    for(let n=component.parentElement;n&&n.id!=='masterPage';n=n.parentElement){set(n,'width','100%');set(n,'min-width','0px');set(n,'height','auto');set(n,'min-height','0px');if(getComputedStyle(n).display==='grid'){set(n,'grid-template-rows','auto');set(n,'grid-template-columns','minmax(0,1fr)');}}
    if(location.pathname==='/'){for(const id of ['site-root','masterPage','SITE_CONTAINER']){const n=document.getElementById(id);set(n,'min-width','0px');set(n,'width','100%');}set(document.body,'background','#071827');set(document.getElementById('SITE_CONTAINER'),'background','#071827');}
  }
  window.addEventListener('message',event=>{
    if(event.origin!==origin||!['lighthouse:content-height','lighthouse:chrome-height'].includes(event.data?.type))return;
    const frame=frames().find(f=>f.contentWindow===event.source),height=Math.ceil(event.data.height);
    if(!frame||!Number.isFinite(height)||height<80||height>40000)return;
    heights.set(frame,height);layout(frame,height);
  });
  function refresh(){if(lastPath!==location.pathname){restore();lastPath=location.pathname;}const current=frames();if(!current.length){if(changed.size)restore();return;}for(const f of current){const height=heights.get(f)||f.clientHeight;layout(f,height);f.contentWindow?.postMessage({type:'lighthouse:request-height'},origin);}}
  window.addEventListener('resize',refresh);setInterval(refresh,1200);refresh();
})();
