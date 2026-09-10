import {departments, searchDepartments} from './lighthouse-concierge-registry.mjs';

if (new URLSearchParams(location.search).get('embedded') === '1') document.body.classList.add('embedded');

const form = document.querySelector('#concierge-form');
const input = document.querySelector('#concierge-input');
const conversation = document.querySelector('#conversation');
const results = document.querySelector('#results');
const directory = document.querySelector('#directory');
const status = document.querySelector('#status');
const embedded = document.body.classList.contains('embedded') && window.parent !== window;
const pending = new Map();

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

function departmentCard(department, result = false) {
  const className = result ? 'result-card' : '';
  return `<a class="${className}" href="${escapeHtml(department.browse)}" target="_top" data-department="${escapeHtml(department.id)}"><strong>${escapeHtml(department.name)}</strong><p>${escapeHtml(department.summary)}</p><span>${result ? 'Open this path →' : 'Browse →'}</span></a>`;
}

function addMessage(role, text) {
  const article = document.createElement('article');
  article.className = `message ${role}`;
  article.innerHTML = `<strong>${role === 'user' ? 'You' : 'Concierge'}</strong><p>${escapeHtml(text)}</p>`;
  conversation.append(article);
}

function simulate(request) {
  const matches = searchDepartments(request);
  if (!matches.length) {
    addMessage('concierge','I do not have a confident match yet. Here are all Lighthouse destinations, or you can tell me the outcome you want in another way.');
    results.innerHTML = departments.slice(0,6).map(department => departmentCard(department,true)).join('');
    return;
  }
  addMessage('concierge',matches.length === 1 ? `The best match is ${matches[0].name}. I can bring its live choices into this workspace once its secure adapter is connected.` : 'These Lighthouse destinations best match what you asked for.');
  results.innerHTML = matches.map(department => departmentCard(department,true)).join('');
}

window.addEventListener('message', event => {
  if (!embedded || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== 'lighthouse-concierge:reply') return;
  const request = pending.get(event.data.requestId);
  if (!request) return;
  pending.delete(event.data.requestId);
  clearTimeout(request.timer);
  if (event.data.error) request.reject(new Error(event.data.error));
  else request.resolve(event.data.result);
});

function wixRequest(action, input = {}) {
  if (!embedded) return Promise.reject(new Error('Wix bridge unavailable.'));
  const requestId = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error('Wix did not respond.')); }, 12000);
    pending.set(requestId, {resolve, reject, timer});
    window.parent.postMessage({type:'lighthouse-concierge:rpc', requestId, action, input}, location.origin);
  });
}

async function showRequest(request) {
  try {
    const response = await wixRequest('answer', {query: request});
    const matches = Array.isArray(response?.items) ? response.items : [];
    if (response?.answer) addMessage('concierge', response.answer);
    if (!matches.length) {
      addMessage('concierge','I do not have a confident match yet. You can browse every Lighthouse destination or describe the outcome another way.');
      results.innerHTML = departments.slice(0,6).map(department => departmentCard(department,true)).join('');
    } else {
      if (!response?.answer) addMessage('concierge',matches.length === 1 ? `The best match is ${matches[0].name}.` : 'These Lighthouse destinations best match what you asked for.');
      results.innerHTML = matches.map(department => departmentCard(department,true)).join('');
    }
    status.textContent = 'The Concierge is guiding you through the secure Wix bridge. Purchases and account changes remain disabled.';
  } catch (error) {
    simulate(request);
    status.textContent = 'The Wix bridge is unavailable, so this is a directory-only fallback result. No action was taken.';
  }
}

directory.innerHTML = departments.map(department => departmentCard(department)).join('');

form.addEventListener('submit', async event => {
  event.preventDefault();
  const request = input.value.trim();
  if (!request) return;
  addMessage('user',request);
  await showRequest(request);
  input.value = '';
  status.textContent = 'Simulator result only. Live data and actions remain disabled until their secure adapters pass testing.';
  results.scrollIntoView({block:'nearest'});
});

document.querySelectorAll('[data-prompt]').forEach(button => {
  button.addEventListener('click', async () => {
    const request = button.dataset.prompt;
    input.value = request;
    addMessage('user', request);
    await showRequest(request);
    input.value = '';
    results.scrollIntoView({block:'nearest'});
  });
});

document.querySelector('#voice').addEventListener('click', () => {
  status.textContent = 'Voice uses the same permanent action contract and will be activated after the secure text workflow is verified.';
  input.focus();
});
