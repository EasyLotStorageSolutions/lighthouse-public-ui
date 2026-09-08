(() => {
  if(window.parent===window)return;
  let origin;try{origin=new URL(document.referrer).origin}catch{return;}
  if(!['https://www.easylotstoragesolutions.com','https://easylotstoragesolutions.com','http://localhost:8765'].includes(origin))return;
  const shell=document.querySelector('.shell');if(!shell)return;
  let last=0;function report(){const height=Math.ceil(shell.getBoundingClientRect().height);if(height===last)return;last=height;window.parent.postMessage({type:'lighthouse:chrome-height',height},origin);}
  new ResizeObserver(report).observe(shell);window.addEventListener('message',e=>{if(e.source===window.parent&&e.origin===origin&&e.data?.type==='lighthouse:request-height'){last=0;report();}});report();
})();
