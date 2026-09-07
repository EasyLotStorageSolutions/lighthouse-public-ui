(() => {
  const yvetteButton = document.getElementById('yvette-play');
  const yvetteTranscript = document.getElementById('yvette-transcript');
  const yvetteMessage = "Hi, I’m Yvette, your guide inside Lighthouse. The full AI workspace is still in development. You can explore the working experiences today, and this space will grow as each journey is completed.";
  let speaking = false;

  function stopYvette() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    speaking = false;
    if (yvetteButton) yvetteButton.textContent = 'HEAR YVETTE’S WELCOME';
  }

  if (yvetteButton) yvetteButton.addEventListener('click', () => {
    if (speaking) return stopYvette();
    if (yvetteTranscript) yvetteTranscript.hidden = false;
    if (!('speechSynthesis' in window)) {
      yvetteButton.textContent = 'WELCOME MESSAGE SHOWN';
      return;
    }
    const utterance = new SpeechSynthesisUtterance(yvetteMessage);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(item => /en-US/i.test(item.lang) && /natural|aria|jenny|samantha|zira/i.test(item.name)) || voices.find(item => /en/i.test(item.lang));
    if (voice) utterance.voice = voice;
    utterance.rate = .92;
    utterance.pitch = 1;
    utterance.onend = stopYvette;
    utterance.onerror = stopYvette;
    speaking = true;
    yvetteButton.textContent = 'STOP WELCOME';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
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
