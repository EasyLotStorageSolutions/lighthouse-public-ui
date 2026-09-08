import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const home = await readFile(new URL('./marketplace-home.html', import.meta.url), 'utf8');
const behavior = await readFile(new URL('./lighthouse-2040.js', import.meta.url), 'utf8');
const harbor = await readFile(new URL('./lighthouse-harbor.mjs', import.meta.url), 'utf8');
const styles = await readFile(new URL('./lighthouse-2040.css', import.meta.url), 'utf8');
const live = await readFile(new URL('./lighthouse-live.mjs', import.meta.url), 'utf8');
const phones = await readFile(new URL('./lighthouse-category-phones.mjs', import.meta.url), 'utf8');
const mallMap = await readFile(new URL('./lighthouse-mall-map.mjs', import.meta.url), 'utf8');
const header = await readFile(new URL('./marketplace-header.html', import.meta.url), 'utf8');
const makerStore = await readFile(new URL('./marketplace-maker-space.html', import.meta.url), 'utf8');
const marketplace = await readFile(new URL('./marketplace-explore.html', import.meta.url), 'utf8');
const towingStore = await readFile(new URL('./towing-roadside.html', import.meta.url), 'utf8');
const contractorStore = await readFile(new URL('./contractors-home-services.html', import.meta.url), 'utf8');
const lounge = await readFile(new URL('./lighthouse-lounge-catalog-ui.mjs', import.meta.url), 'utf8');

test('Lighthouse 2040 behavior parses and keeps video IDs constrained', () => {
  assert.doesNotThrow(() => new Function(behavior));
  assert.match(behavior, /replace\(\/\[\^A-Za-z0-9_-\]\//);
  assert.match(behavior, /youtube-nocookie\.com\/embed\/\$\{id\}/);
  assert.doesNotMatch(behavior, /\beval\s*\(/);
});

test('category and feature videos are framed as Lighthouse lanterns', () => {
  assert.match(styles, /\.lighthouse-screen/);
  assert.match(styles, /\.harbor-app \.lighthouse-viewer/);
  assert.match(styles, /lighthouse-media-console-2040\.webp/);
  assert.match(harbor, /video inside a Lighthouse lantern/);
  assert.doesNotMatch(harbor, /cinema\.append\(filmCollection\)/, 'the film collection must remain inside Creative Studio');
  assert.match(home, /class="channel-2040" aria-label="Watch the Lighthouse film collection"/);
  assert.match(home, /Selected film playing inside a Lighthouse lantern/);
});

test('the repeat-visit Beacon stores only a local score', () => {
  assert.match(behavior, /localStorage\.getItem\('lighthouseBeacons'\)/);
  assert.match(behavior, /localStorage\.setItem\('lighthouseBeacons'/);
  assert.doesNotMatch(behavior, /fetch\s*\(|XMLHttpRequest|sendBeacon/);
});

test('all five main-page Lighthouses have independent guide, television, and radio controls', () => {
  for (const category of ['storage', 'employment', 'social', 'marketplace', 'music']) assert.match(live, new RegExp(`${category}:\\{name:`));
  for (const control of ['Property TV', 'Local Radio', 'Work TV', 'News Radio', 'Community TV', 'Talk Radio', 'Market TV', 'Business Radio', 'Music TV', 'Music Radio']) assert.match(live, new RegExp(control));
  assert.match(live, /harbor-mini-lighthouse/);
  assert.match(live, /audio\.pause\(\)/);
  assert.match(live, /frame\.src='about:blank'/);
  assert.match(styles, /\.harbor-app\[data-view=home\] \.harbor-brand\{display:none\}/);
  assert.match(styles, /\.harbor-app:not\(\[data-view=home\]\) \.harbor-nav\{display:none!important\}/);
  assert.match(styles, /\.harbor-panel-home\{display:none!important\}/);
  assert.match(harbor, /button\('Lighthouse Home','harbor-brand'/);
  assert.match(harbor, /aria-label','Return to Lighthouse Home'/);
  assert.match(styles, /scroll-snap-type:x mandatory/);
});

test('radio search is user-started, HTTPS-only, and keeps each Lighthouse choice separate', () => {
  assert.match(live, /hidebroken:'true',is_https:'true'/);
  assert.match(live, /stations\/search/);
  assert.match(live, /station\.url_resolved/);
  assert.match(live, /lighthouse-radio-\$\{activeCategory\}/);
  assert.doesNotMatch(live, /autoplay=1/);
  assert.match(live, /\?embed=true&theme=dark/);
  assert.match(live, /Official iHeartRadio station widget/);
  assert.match(live, /function toIHeartEmbed\(value\)/);
  assert.match(live, /\['iheart\.com','www\.iheart\.com'\]/);
  assert.match(live, /lighthouse-iheart-\$\{activeCategory\}/);
  assert.match(live, /Use any iHeart station/);
  assert.match(live, /EXPAND TV/);
  assert.match(live, /function youtubeVideoId\(value\)/);
  assert.match(live, /youtube-nocookie\.com\/embed/);
  assert.match(styles, /\.harbor-live\[data-mode=visual\]/);
  assert.match(live, /Browse more stations on iHeart/);
  for (const channel of ['ABC News Live', 'NBC News NOW', 'CBS News 24\/7', 'Bloomberg TV', 'NASA TV']) assert.match(live, new RegExp(channel));
  assert.match(live, /FIND STATIONS NEAR ME/);
  assert.match(live, /navigator\.geolocation\.getCurrentPosition/);
  assert.match(live, /reverse-geocode-client/);
  assert.match(live, /lighthouse-radio-region/);
  assert.match(live, /countrycode:'US',state:/);
  assert.match(live, /Exact coordinates go to the location lookup service once and are not saved by Lighthouse/);
});

test('the approved hero retains a dependable Home link and visible corner navigation', () => {
  assert.match(header, /class="brand" href="\/" aria-label="The Lighthouse by Easy Lot Storage Solutions home"/);
  assert.match(header, /href="\/#how-easy-works">How It Works/);
  assert.match(header, /href="\/customer-portal">Sign In/);
  assert.match(header, /object-fit:contain/);
});

test('Yvette never falls through to an arbitrary male browser voice', () => {
  assert.match(behavior, /async function chooseYvetteVoice/);
  assert.match(behavior, /Microsoft Aria/);
  assert.doesNotMatch(behavior, /voices\.find\(item => \/en\/i\.test\(item\.lang\)\)/);
  assert.match(phones, /video\.muted=true;video\.volume=0/);
  assert.match(phones, /A suitable feminine narrator is not available/);
  assert.match(home, /synthetic feminine narrator/);
});

test('the homepage explains its categories, goal, and future honestly', () => {
  assert.match(harbor, /One place for the many parts of life/);
  assert.match(harbor, /What Lighthouse offers/);
  assert.match(harbor, /Our goal/);
  assert.match(harbor, /Where we are heading/);
  assert.match(harbor, /Lighthouse AI is being developed/);
  assert.match(harbor, /not hidden transaction fees/);
  assert.match(styles, /\.harbor-story-columns/);
  assert.match(styles, /Phone Lighthouse Harbor: only the lighthouse rail moves/);
  assert.match(styles, /overflow-x:clip!important/);
  assert.match(styles, /scroll-snap-type:x mandatory/);
  assert.match(styles, /scrollbar-width:none/);
  assert.match(harbor, /harbor-carousel-controls/);
  assert.match(harbor, /facing you/);
  assert.match(styles, /\.harbor-mini-lighthouse:after/);
  assert.match(styles, /\.harbor-destination\.is-centered \.harbor-mini-lighthouse:after/);
  assert.match(styles, /left:16%;top:25\.2%;width:68%;height:23%/);
  assert.match(harbor, /Previous Lighthouse/);
  assert.match(harbor, /Next Lighthouse/);
});

test('public category buttons use plain-language names', () => {
  for (const label of ['Marketplace', 'Jobs & Hiring', 'Storage & Space', 'Community & Social', 'Makers Market & Community', 'Creative Studio', 'Locksmith Services', 'Towing & Roadside Assistance', 'Contractors & Home Services']) {
    assert.match(mallMap, new RegExp(label.replace('&', '\\&')));
  }
  for (const oldLabel of ['Market Harbor', 'Work Pier', 'Storage Cove', 'Lighthouse World', 'Sound Harbor', 'Locksmith Point', 'Mall Map']) {
    assert.doesNotMatch(mallMap, new RegExp(oldLabel));
  }
  assert.match(harbor, /Quick Help & Inspiration/);
  assert.match(home, /What do you need right now\?/);
  assert.doesNotMatch(home, /Close the Beacon|Choose your Beacon path|beacons found/);
});

test('every new focused store has a playing Lighthouse screen and full media lounge', () => {
  for (const [source, category, video] of [[makerStore,'makers','makers-welcome.mp4'],[towingStore,'towing','towing-welcome.mp4'],[contractorStore,'contractors','contractors-welcome.mp4']]) {
    assert.match(source, /class="site-lighthouse"/);
    assert.match(source, new RegExp(`data-category="${category}"`));
    assert.match(source, new RegExp(video.replace('.', '\\.')));
    assert.match(source, /<video autoplay muted loop playsinline controls/);
    assert.match(source, /lighthouse-live\.mjs/);
  }
  for (const category of ['makers','towing','contractors']) assert.match(live, new RegExp(`${category}:\\{name:`));
  assert.match(lounge, /regionalTV/);
  assert.match(lounge, /radioServices/);
  assert.match(lounge, /Saved stations/);
  assert.match(lounge, /Show more live stations/);
});

test('new service stores keep honest, focused boundaries', () => {
  assert.match(towingStore, /does not dispatch a truck/);
  assert.match(towingStore, /A Lighthouse inquiry is not a confirmed dispatch/);
  assert.doesNotMatch(towingStore, /handmade|contractor membership|locksmith directory/i);
  assert.match(contractorStore, /No contractor is currently represented as approved/);
  assert.match(contractorStore, /Confirm licensing requirements, insurance, written scope/);
  assert.doesNotMatch(contractorStore, /towing company|handmade|locksmith directory/i);
});

test('Makers Market and Community is its own honest Lighthouse destination', () => {
  assert.match(mallMap, /marketplace-maker-space\.html/);
  assert.match(makerStore, /Shop handmade and custom work/);
  assert.match(makerStore, /Custom work or repair/);
  assert.match(makerStore, /Join as a maker/);
  assert.match(makerStore, /Maker Community/);
  assert.match(makerStore, /discussion forum is being prepared and is not live yet/);
  assert.match(makerStore, /_functions\/marketplaceMaker/);
  assert.doesNotMatch(makerStore, /native lane inside Lighthouse Marketplace/);
  assert.match(marketplace, /Eight distinct districts/);
  assert.doesNotMatch(marketplace, /<b>Maker Space<\/b>|>MAKER SPACE<\/a>/);
  assert.match(marketplace, /Visit Makers Market &amp; Community/);
});
