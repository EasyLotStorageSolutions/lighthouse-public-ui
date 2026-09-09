(() => {
  'use strict';
  if (!['/pricing-plans', '/pricing-plans.html'].includes(location.pathname.replace(/\/$/, ''))) return;

  const providerPlans = new Map([
    ['storage-provider', 'Lighthouse Storage Provider'],
    ['employer', 'Lighthouse Employer Provider'],
    ['maker', 'Lighthouse Maker Provider'],
    ['creative', 'Lighthouse Creative Provider'],
    ['locksmith', 'Lighthouse Locksmith Provider'],
    ['towing', 'Lighthouse Towing Provider'],
    ['contractor', 'Lighthouse Contractor Provider'],
    ['landscaping', 'Lighthouse Landscaping Provider']
  ]);
  const legacyLighthousePlans = new Set(['The Lighthouse Membership', 'Lighthouse Business', 'Lighthouse Employer']);
  const storagePlans = new Set([
    'Car/Truck Storage', "Small & Medium RV's and Box Trucks", "Large Size RV's and Box Trucks",
    'Small and Medium Boats', 'Large Boats', 'Single Lot Access', 'Rose Street Car and Truck Storage',
    'Contractor Yard 36x36', 'Contractor Yard 36x72', 'Storage Facility Advertising'
  ]);
  const labels = {
    provider: {
      eyebrow: 'PROVIDER SUBSCRIPTIONS',
      title: 'Choose only the store your business needs.',
      copy: 'Customers are free. Service providers subscribe separately to each paid store they use, keep their customer relationships, and collect customer payments directly.',
      note: 'Every provider plan includes a 30-day free trial and then renews monthly until canceled. Marketplace and Community & Social require no subscription. Review the final checkout before starting.'
    },
    storage: {
      eyebrow: 'STORAGE & FACILITY PLANS',
      title: 'Choose a space or facility service.',
      copy: 'These plans are for Easy Lot vehicle or contractor storage and storage-facility advertising. They do not include a Lighthouse personal, business, or employer membership unless a plan explicitly says so.',
      note: 'Space is location- and availability-dependent. Confirm the facility, dimensions, access, agreement, start date, and final price before relying on a storage selection.'
    },
    all: {
      eyebrow: 'ALL CURRENT PLANS',
      title: 'Compare everything, with the difference kept clear.',
      copy: 'Provider subscriptions pay for access to one business category. Storage plans pay for a physical Easy Lot space.',
      note: 'Customers remain free. Lighthouse does not collect or take a percentage of customer-to-provider transactions. Review the plan name and final checkout carefully.'
    }
  };
  const style = document.createElement('style');
  style.id = 'lighthouse-pricing-guide-style';
  style.textContent = `
    #lighthouse-pricing-guide{box-sizing:border-box;width:calc(100% - 32px);max-width:1160px;margin:28px auto 36px;padding:clamp(24px,4vw,46px);border:1px solid rgba(17,61,106,.22);border-radius:24px;background:linear-gradient(140deg,#08243d,#104c77);color:#fff;box-shadow:0 28px 70px -42px rgba(3,22,39,.8);font-family:Arial,sans-serif}
    #lighthouse-pricing-guide .lpg-eyebrow{margin:0 0 8px;color:#f4cf83;font-size:12px;font-weight:800;letter-spacing:.18em}
    #lighthouse-pricing-guide h1{margin:0;font:400 clamp(38px,5vw,62px)/1.05 Georgia,serif;color:#fff}
    #lighthouse-pricing-guide .lpg-copy{max-width:850px;margin:14px 0 22px;font-size:17px;line-height:1.65}
    #lighthouse-pricing-guide .lpg-tabs{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 20px}
    #lighthouse-pricing-guide button{min-height:46px;padding:11px 18px;border:1px solid rgba(255,255,255,.5);border-radius:999px;background:transparent;color:#fff;font:700 14px Arial,sans-serif;cursor:pointer}
    #lighthouse-pricing-guide button[aria-pressed=true]{background:#f4cf83;border-color:#f4cf83;color:#08243d}
    #lighthouse-pricing-guide button:focus-visible{outline:3px solid #fff;outline-offset:3px}
    #lighthouse-pricing-guide .lpg-note{margin:0;padding:14px 16px;border-left:4px solid #f4cf83;background:rgba(255,255,255,.1);font-size:14px;line-height:1.55}
    #lighthouse-pricing-guide .lpg-quick{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
    #lighthouse-pricing-guide .lpg-quick a{color:#fff;text-underline-offset:4px;font-weight:700}
    [data-lighthouse-plan-focus=true]{outline:4px solid #d9ac56!important;outline-offset:5px!important}
    @media(max-width:600px){#lighthouse-pricing-guide{margin:16px 12px 28px;padding:24px 18px;border-radius:18px}#lighthouse-pricing-guide .lpg-tabs{display:grid}#lighthouse-pricing-guide button{width:100%}}
  `;
  document.head.append(style);

  let current = (() => {
    const requested = new URLSearchParams(location.search).get('for');
    return requested === 'storage' || requested === 'all' ? requested : providerPlans.has(requested) ? requested : 'provider';
  })();
  const focusName = providerPlans.get(new URLSearchParams(location.search).get('for')) || '';

  function classify(title) {
    if ([...providerPlans.values()].includes(title)) return 'provider';
    if (legacyLighthousePlans.has(title)) return 'legacy';
    if (storagePlans.has(title)) return 'storage';
    return 'other';
  }
  function updateUrl(value) {
    const url = new URL(location.href);
    url.searchParams.set('for', value);
    history.replaceState(null, '', url);
  }
  function render() {
    const list = document.querySelector('[data-hook="PackagePicker-wrapper"]');
    const plans = [...document.querySelectorAll('[data-hook="plan"]')];
    if (!list) return false;
    let guide = document.getElementById('lighthouse-pricing-guide');
    if (!guide) {
      guide = document.createElement('section');
      guide.id = 'lighthouse-pricing-guide';
      guide.setAttribute('aria-labelledby', 'lpg-title');
      guide.innerHTML = `<p class="lpg-eyebrow"></p><h1 id="lpg-title"></h1><p class="lpg-copy"></p><div class="lpg-tabs" role="group" aria-label="Choose which plans to see"><button type="button" data-view="provider">Provider subscriptions</button><button type="button" data-view="storage">Easy Lot storage plans</button><button type="button" data-view="all">Compare all active plans</button></div><p class="lpg-note"></p><div class="lpg-quick"><a href="/">Return to Lighthouse</a><a href="https://easylotstoragesolutions.github.io/lighthouse-public-ui/provider-subscriptions.html">Compare provider stores</a><a href="/find-storage">Explore storage first</a></div>`;
      // Keep the site's own header first, then introduce the choices immediately
      // before Wix's plan app. The bounded startup retry restores this placement
      // if Wix replaces the app shell while it finishes hydrating.
      const mount = list.closest('[id^="TPASection_"]') || list;
      mount.insertAdjacentElement('beforebegin', guide);
      guide.style.gridRow = '1';
      mount.style.gridRow = '2';
      guide.addEventListener('click', event => {
        const button = event.target.closest('[data-view]');
        if (!button) return;
        current = button.dataset.view;
        updateUrl(current);
        apply();
        guide.scrollIntoView({block:'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
      });
    }
    apply();
    return plans.length >= 3;
  }
  function apply() {
    const guide = document.getElementById('lighthouse-pricing-guide');
    if (!guide) return;
    const words = labels[current] || labels.provider;
    guide.querySelector('.lpg-eyebrow').textContent = words.eyebrow;
    guide.querySelector('h1').textContent = words.title;
    guide.querySelector('.lpg-copy').textContent = words.copy;
    guide.querySelector('.lpg-note').textContent = words.note;
    guide.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === current)));
    document.querySelectorAll('[data-hook="plan"]').forEach(plan => {
      const title = plan.querySelector('[data-hook="plan-title"]')?.textContent.trim() || '';
      const group = classify(title);
      const visible = current === 'all' ? group !== 'legacy' : focusName ? title === focusName : group === current;
      plan.hidden = !visible;
      plan.style.display = visible ? '' : 'none';
      plan.setAttribute('aria-hidden', String(!visible));
      const focused = Boolean(focusName && title === focusName && visible);
      plan.dataset.lighthousePlanFocus = String(focused);
    });
    const originalTitle = document.querySelector('[data-hook="app-title"]');
    if (originalTitle) originalTitle.textContent = focusName || (current === 'provider' ? 'Provider subscriptions' : current === 'storage' ? 'Easy Lot storage plans' : 'All active plans');
  }
  // Wix hydrates this app after the page shell. A short bounded retry is more
  // dependable here than tying behavior to Wix's internal mutation sequence.
  let attempts = 0;
  const retry = setInterval(() => {
    attempts += 1;
    try {
      render();
      // Keep applying through Wix's initial React reconciliation, which can
      // replace otherwise-ready plan cards a moment after first paint.
      if (attempts >= 80) clearInterval(retry);
    } catch (error) {
      document.documentElement.dataset.lighthousePricingError = String(error?.message || error).slice(0, 240);
      if (attempts >= 80) clearInterval(retry);
    }
  }, 250);
  try { render(); } catch (error) {
    document.documentElement.dataset.lighthousePricingError = String(error?.message || error).slice(0, 240);
  }
})();
