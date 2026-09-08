(() => {
  const yvetteButton = document.getElementById('yvette-play');
  const yvetteTranscript = document.getElementById('yvette-transcript');
  let speaking = false;
  let yvetteAudio = null;
  const yvettePending = new Map();
  const yvetteClipCache = new Map();
  const yvetteParentOrigin = (() => {
    try {
      const origin = new URL(document.referrer).origin;
      return ['https://www.easylotstoragesolutions.com', 'https://easylotstoragesolutions.com'].includes(origin) || /\.editor\.wix\.com$/.test(new URL(origin).hostname) ? origin : '';
    } catch { return ''; }
  })();
  const yvetteSessionKey = (() => {
    try {
      const saved = sessionStorage.getItem('lighthouse-yvette-session');
      if (saved) return saved;
      const created = `${Date.now()}-${crypto.getRandomValues(new Uint32Array(4)).join('-')}`;
      sessionStorage.setItem('lighthouse-yvette-session', created);
      return created;
    } catch { return `${Date.now()}-yvette-voice-session`; }
  })();

  function requestYvetteClip(clipKey) {
    if (yvetteClipCache.has(clipKey)) return Promise.resolve(yvetteClipCache.get(clipKey));
    if (!yvetteParentOrigin || window.parent === window) return Promise.reject(new Error('YVETTE_VOICE_REQUIRES_LIGHTHOUSE'));
    const requestId = `yvette-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { yvettePending.delete(requestId); reject(new Error('YVETTE_VOICE_TIMEOUT')); }, 30000);
      yvettePending.set(requestId, { resolve, reject, timer, clipKey });
      window.parent.postMessage({ type: 'yvette-voice:request', requestId, input: { clipKey, sessionKey: yvetteSessionKey } }, yvetteParentOrigin);
    });
  }

  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.origin !== yvetteParentOrigin) return;
    const payload = event.data || {};
    if (!['yvette-voice:response', 'yvette-voice:error'].includes(payload.type)) return;
    const pending = yvettePending.get(payload.requestId);
    if (!pending) return;
    clearTimeout(pending.timer); yvettePending.delete(payload.requestId);
    if (payload.type === 'yvette-voice:error' || !payload.voice?.audioBase64) pending.reject(new Error('YVETTE_VOICE_UNAVAILABLE'));
    else { yvetteClipCache.set(payload.voice.clipKey || pending.clipKey, payload.voice); pending.resolve(payload.voice); }
  });

  async function playYvetteClip(clipKey, callbacks = {}) {
    if (yvetteAudio) { yvetteAudio.pause(); yvetteAudio = null; }
    callbacks.loading?.();
    const voice = await requestYvetteClip(clipKey);
    const audio = new Audio(`data:${voice.contentType || 'audio/mpeg'};base64,${voice.audioBase64}`);
    yvetteAudio = audio;
    audio.onplay = () => callbacks.playing?.();
    audio.onended = () => { if (yvetteAudio === audio) yvetteAudio = null; callbacks.ended?.(); };
    audio.onerror = () => { if (yvetteAudio === audio) yvetteAudio = null; callbacks.error?.(); };
    await audio.play();
    return audio;
  }

  function stopYvetteAudio() {
    if (yvetteAudio) { yvetteAudio.pause(); yvetteAudio.currentTime = 0; yvetteAudio = null; }
  }
  window.LighthouseYvetteVoice = { play: playYvetteClip, stop: stopYvetteAudio };

  function stopYvette() {
    stopYvetteAudio();
    speaking = false;
    if (yvetteButton) yvetteButton.textContent = 'HEAR YVETTE’S WELCOME';
  }

  if (yvetteButton) yvetteButton.addEventListener('click', async () => {
    if (speaking) return stopYvette();
    if (yvetteTranscript) yvetteTranscript.hidden = false;
    speaking = true;
    try {
      await playYvetteClip('welcome', {
        loading: () => { yvetteButton.textContent = 'PREPARING YVETTE…'; },
        playing: () => { yvetteButton.textContent = 'STOP WELCOME'; },
        ended: stopYvette,
        error: stopYvette
      });
    } catch {
      speaking = false;
      yvetteButton.textContent = 'WELCOME MESSAGE SHOWN';
    }
  });

  const frame = document.getElementById('lighthouse-film-frame');
  const filmTitle = document.getElementById('lighthouse-film-title');
  const filmCredit = document.getElementById('lighthouse-film-credit');
  const filmButtons = Array.from(document.querySelectorAll('[data-lighthouse-film]'));
  filmButtons.forEach(button => button.addEventListener('click', () => {
    const id = String(button.dataset.lighthouseFilm || '').replace(/[^A-Za-z0-9_-]/g, '');
    if (!id || !frame) return;
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
    frame.title = button.dataset.title || 'Selected lighthouse film';
    if (filmTitle) filmTitle.textContent = button.dataset.title || 'Selected lighthouse film';
    if (filmCredit) filmCredit.textContent = button.dataset.credit || '';
    filmButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));

  const quest = document.getElementById('beacon-quest');
  const questOpeners = Array.from(document.querySelectorAll('[data-open-beacon]'));
  const questClose = document.getElementById('beacon-close');
  const questChoices = Array.from(document.querySelectorAll('[data-beacon-mood]'));
  const questTitle = document.getElementById('beacon-result-title');
  const questCopy = document.getElementById('beacon-result-copy');
  const questLink = document.getElementById('beacon-result-link');
  const questScore = document.getElementById('beacon-score');
  const paths = {
    calm: { title: 'Take a two-minute coast break.', copy: 'Watch a quiet lighthouse film. Nothing to buy and nowhere else you need to be.', href: '#lighthouse-video-studio', action: 'WATCH THE COAST' },
    curious: { title: 'Open a door you have not tried.', copy: 'Let Lighthouse choose a different destination and see one working experience.', href: '#what-easy-does', action: 'EXPLORE A DOOR' },
    ready: { title: 'Turn one thought into a next step.', copy: 'Bring one real goal to Ask Lighthouse and leave with a clearer direction.', href: '#assistant', action: 'ASK LIGHTHOUSE' }
  };
  let earned = 0;
  try { earned = Number(localStorage.getItem('lighthouseBeacons') || 0); } catch (error) { earned = 0; }
  const renderScore = () => { if (questScore) questScore.textContent = `${earned} beacon${earned === 1 ? '' : 's'} found on this device.`; };
  renderScore();
  questOpeners.forEach(button => button.addEventListener('click', () => quest && quest.showModal()));
  if (questClose) questClose.addEventListener('click', () => quest.close());
  if (quest) quest.addEventListener('click', event => { if (event.target === quest) quest.close(); });
  questChoices.forEach(button => button.addEventListener('click', () => {
    const path = paths[button.dataset.beaconMood];
    if (!path) return;
    questChoices.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    questTitle.textContent = path.title;
    questCopy.textContent = path.copy;
    questLink.href = path.href;
    questLink.textContent = path.action;
    questLink.hidden = false;
    if (button.dataset.beaconEarned !== 'true') {
      earned += 1;
      try { localStorage.setItem('lighthouseBeacons', String(earned)); } catch (error) { /* Device storage is optional. */ }
      button.dataset.beaconEarned = 'true';
      renderScore();
    }
  }));
  if (questLink) questLink.addEventListener('click', () => quest && quest.close());
})();
