(() => {
  const current = document.title.split(/[—|\-]/)[0].trim() || 'Lighthouse';
  document.documentElement.classList.add('lighthouse-interior');
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    const rel = new Set((link.rel || '').split(/\s+/).filter(Boolean));
    rel.add('noopener'); rel.add('noreferrer'); link.rel = [...rel].join(' ');
  });
  if (window.self !== window.top || document.querySelector('.lh-interior-nav')) return;
  const nav = document.createElement('nav');
  nav.className = 'lh-interior-nav'; nav.setAttribute('aria-label', 'Lighthouse page navigation');
  const home = document.createElement('a');
  home.className = 'lh-interior-home'; home.href = 'https://www.easylotstoragesolutions.com/'; home.textContent = 'Lighthouse Home';
  const place = document.createElement('div');
  place.className = 'lh-interior-place';
  const name = document.createElement('strong'); name.textContent = current;
  const status = document.createElement('span'); status.textContent = 'You are inside Lighthouse';
  place.append(name, status); nav.append(home, place);
  document.body.prepend(nav);
})();
