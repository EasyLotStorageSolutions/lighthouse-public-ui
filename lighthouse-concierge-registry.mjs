const SITE = 'https://www.easylotstoragesolutions.com';
const PUBLIC = 'https://easylotstoragesolutions.github.io/lighthouse-public-ui';

export const CONFIRMATION = Object.freeze({
  NONE: 'none',
  REVIEW: 'review',
  EXPLICIT: 'explicit'
});

export const departments = Object.freeze([
  {id:'marketplace',name:'Marketplace',summary:'Buy, sell, trade and discover goods, vehicles and equipment.',keywords:['buy','sell','shopping','vehicle','car','truck','tools','goods','auction'],browse:`${SITE}/customer-portal?view=marketplace`,capabilities:['catalog.search','listing.view','listing.draft','vehicle.draft','seller.message']},
  {id:'storage',name:'Storage & Space',summary:'Find storage for belongings, vehicles, equipment or business use.',keywords:['storage','space','parking','vehicle storage','camper','rv','boat','lot'],browse:`${SITE}/customer-portal?view=storage`,capabilities:['storage.search','storage.quote','storage.request']},
  {id:'employment',name:'Jobs & Hiring',summary:'Find work, share skills or describe a hiring need.',keywords:['job','work','hire','hiring','employment','worker','contractor'],browse:`${PUBLIC}/marketplace-home.html#lighthouse-work`,capabilities:['work.profile','work.need','work.match']},
  {id:'social',name:'Community & Social',summary:'Explore communities, personal spaces, interests and connections.',keywords:['community','social','people','group','friends','post'],browse:`${PUBLIC}/lighthouse-community-directory.html`,capabilities:['community.search','community.browse']},
  {id:'makers',name:'Makers Market & Community',summary:'Discover handmade goods, custom work and maker connections.',keywords:['handmade','custom','maker','craft','nails','art'],browse:`${PUBLIC}/marketplace-maker-space.html`,capabilities:['catalog.search','maker.search','custom.request']},
  {id:'creative',name:'Creative Studio',summary:'Create and explore music, video, audio and stories.',keywords:['music','video','audio','studio','creative','recording'],browse:`${SITE}/customer-portal?view=studio`,capabilities:['studio.open','media.project']},
  {id:'locksmith',name:'Locksmith Services',summary:'Find locksmith help or explore opportunities for providers.',keywords:['lock','locked out','key','keys','locksmith','rekey'],browse:`${SITE}/customer-portal?view=locksmith`,capabilities:['service.search','service.request','provider.apply']},
  {id:'towing',name:'Towing & Roadside Assistance',summary:'Find towing, roadside help or vehicle transport.',keywords:['tow','towing','roadside','flat tire','jump start','transport'],browse:`${PUBLIC}/towing-roadside.html`,capabilities:['service.search','service.request','provider.apply']},
  {id:'contractors',name:'Contractors & Home Services',summary:'Find contractors and home-service professionals.',keywords:['contractor','repair','home','plumber','electrician','construction'],browse:`${PUBLIC}/contractors-home-services.html`,capabilities:['service.search','service.request','provider.apply']},
  {id:'landscaping',name:'Landscaping & Lawn Care',summary:'Find lawn care or grow a landscaping business.',keywords:['landscape','landscaping','lawn','grass','yard','tree'],browse:`${PUBLIC}/landscaping-lawn-care.html`,capabilities:['service.search','service.request','provider.apply']},
  {id:'account',name:'My Lighthouse',summary:'Access saved tasks, messages, orders, projects and account controls.',keywords:['account','order','message','saved','profile','sign in','login'],browse:`${SITE}/customer-portal`,capabilities:['account.session','account.workspace']}
]);

export const actions = Object.freeze([
  {id:'directory.search',access:'public',confirmation:CONFIRMATION.NONE,mode:'read'},
  {id:'catalog.search',access:'public',confirmation:CONFIRMATION.NONE,mode:'read'},
  {id:'storage.search',access:'public',confirmation:CONFIRMATION.NONE,mode:'read'},
  {id:'service.search',access:'public',confirmation:CONFIRMATION.NONE,mode:'read'},
  {id:'listing.draft',access:'member',confirmation:CONFIRMATION.REVIEW,mode:'draft'},
  {id:'vehicle.draft',access:'member',confirmation:CONFIRMATION.REVIEW,mode:'draft'},
  {id:'storage.quote',access:'member',confirmation:CONFIRMATION.REVIEW,mode:'draft'},
  {id:'service.request',access:'member',confirmation:CONFIRMATION.REVIEW,mode:'draft'},
  {id:'checkout.prepare',access:'member',confirmation:CONFIRMATION.REVIEW,mode:'draft'},
  {id:'listing.publish',access:'member',confirmation:CONFIRMATION.EXPLICIT,mode:'consequential'},
  {id:'checkout.submit',access:'member',confirmation:CONFIRMATION.EXPLICIT,mode:'consequential'},
  {id:'reservation.submit',access:'member',confirmation:CONFIRMATION.EXPLICIT,mode:'consequential'}
]);

export function validateRegistry(items = departments) {
  const ids = new Set();
  for (const item of items) {
    if (!/^[a-z][a-z0-9-]*$/.test(item.id)) throw new Error(`Invalid department id: ${item.id}`);
    if (ids.has(item.id)) throw new Error(`Duplicate department id: ${item.id}`);
    ids.add(item.id);
    if (!item.name || !item.summary || !Array.isArray(item.capabilities)) throw new Error(`Incomplete department: ${item.id}`);
    const url = new URL(item.browse);
    if (url.protocol !== 'https:') throw new Error(`Unsafe browse URL: ${item.id}`);
  }
  return true;
}

export function searchDepartments(query, limit = 6) {
  const terms = String(query || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return departments.slice(0, limit);
  return departments
    .map(department => {
      const searchable = `${department.name} ${department.summary} ${department.keywords.join(' ')}`.toLowerCase();
      const score = terms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);
      return {department, score};
    })
    .filter(result => result.score > 0)
    .sort((a,b) => b.score - a.score || a.department.name.localeCompare(b.department.name))
    .slice(0, limit)
    .map(result => result.department);
}

export function actionPolicy(actionId) {
  return actions.find(action => action.id === actionId) || null;
}

validateRegistry();
