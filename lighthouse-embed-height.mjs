// Measure visible content, not the Wix frame's legacy 9,950px viewport.
const harbor = document.querySelector('.harbor-app');
const origins = new Set(['https://www.easylotstoragesolutions.com', 'https://easylotstoragesolutions.com']);
let parentOrigin;
try { parentOrigin = new URL(document.referrer).origin; } catch {}
if (harbor && window.parent !== window && origins.has(parentOrigin)) {
  let last = 0;
  const report = () => {
    const height = Math.ceil(harbor.getBoundingClientRect().height) + 2;
    if (height === last) return;
    last = height;
    window.parent.postMessage({type: 'lighthouse:content-height', height}, parentOrigin);
  };
  new ResizeObserver(report).observe(harbor);
  window.addEventListener('message', event => {
    if (event.source === window.parent && event.origin === parentOrigin && event.data?.type === 'lighthouse:request-height') {
      last = 0;
      report();
    }
  });
  report();
}
