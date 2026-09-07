// Installed through Wix Custom Code. Only the verified homepage frame can resize it.
(() => {
  if (window.__lighthouseAdaptiveHeight) return;
  window.__lighthouseAdaptiveHeight = true;
  const origin = 'https://easylotstoragesolutions.github.io';
  const framePath = '/lighthouse-public-ui/marketplace-home.html';
  const changed = new Map();
  let currentFrame = null;
  function restore() {
    for (const [element, properties] of changed) {
      for (const [name, old] of properties) {
        if (old.value) element.style.setProperty(name, old.value, old.priority);
        else element.style.removeProperty(name);
      }
    }
    changed.clear(); currentFrame = null;
  }
  function set(element, name, value) {
    if (!changed.has(element)) changed.set(element, new Map());
    const properties = changed.get(element);
    if (!properties.has(name)) properties.set(name, {value:element.style.getPropertyValue(name),priority:element.style.getPropertyPriority(name)});
    element.style.setProperty(name, value, 'important');
  }
  function findFrame() {
    if (location.pathname !== '/') return null;
    return [...document.querySelectorAll('#comp-mtinzncg iframe')].find(frame => {
      try { const url = new URL(frame.src); return url.origin === origin && url.pathname === framePath; } catch { return false; }
    });
  }
  window.addEventListener('message', event => {
    if (event.origin !== origin || event.data?.type !== 'lighthouse:content-height') return;
    const frame = findFrame();
    const height = event.data.height;
    if (!frame || event.source !== frame.contentWindow || !Number.isFinite(height) || height < 400 || height > 30000) return;
    if (currentFrame && currentFrame !== frame) restore();
    currentFrame = frame;
    set(frame, 'height', Math.ceil(height) + 'px');
    let element = document.getElementById('comp-mtinzncg');
    set(element, 'height', Math.ceil(height) + 'px');
    set(element, 'min-height', '0px');
    for (element = element.parentElement; element && element.id !== 'masterPage'; element = element.parentElement) {
      set(element, 'height', 'auto');
      set(element, 'min-height', '0px');
      if (getComputedStyle(element).display === 'grid') set(element, 'grid-template-rows', 'auto');
    }
  });
  // Reconnect after Wix client-side page navigation; restore other pages untouched.
  setInterval(() => {
    const frame = findFrame();
    if (currentFrame && currentFrame !== frame) restore();
    frame?.contentWindow?.postMessage({type:'lighthouse:request-height'}, origin);
  }, 1200);
})();
