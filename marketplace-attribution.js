import wixLocationFrontend from 'wix-location-frontend';
import { local, session } from 'wix-storage-frontend';
import wixWindowFrontend from 'wix-window-frontend';

const ORIGINAL_KEY = 'easyLotOriginalAttribution';
const LATEST_KEY = 'easyLotLatestAttribution';
const CAMPAIGN_KEYS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'gclid', 'fbclid', 'msclkid', 'ref', 'source'
];
const CONVERSION_EVENTS = new Set([
    'renter_space_request',
    'host_listing_request',
    'listing_inquiry',
    'operator_signup',
    'basic_plan_signup',
    'paid_plan_checkout_started',
    'paid_plan_activated',
    'support_request',
    'phone_click',
    'contact_submission',
    'delivery_section_viewed',
    'customer_waitlist_clicked',
    'restaurant_interest_clicked',
    'driver_interest_clicked',
    'delivery_interest_submitted',
    'delivery_interest_submit_failed'
]);

function clean(value, limit = 180) {
    return String(value || '').trim().slice(0, limit);
}

function read(storage, key) {
    try {
        return JSON.parse(storage.getItem(key) || 'null');
    } catch (error) {
        console.warn('Ignoring invalid stored marketplace attribution.', error);
        return null;
    }
}

function currentTouch(intent) {
    const query = wixLocationFrontend.query || {};
    const campaign = CAMPAIGN_KEYS.reduce((result, key) => {
        const value = clean(query[key]);
        if (value) result[key] = value;
        return result;
    }, {});

    return {
        ...campaign,
        landingPath: `/${(wixLocationFrontend.path || []).map(part => clean(part, 80)).filter(Boolean).join('/')}`,
        intent: clean(intent || query.intent || query.audience, 40),
        capturedAt: new Date().toISOString()
    };
}

export function captureMarketplaceAttribution(intent = '') {
    const touch = currentTouch(intent);
    const hasCampaign = CAMPAIGN_KEYS.some(key => touch[key]);
    const original = read(local, ORIGINAL_KEY);

    if (!original && hasCampaign) {
        local.setItem(ORIGINAL_KEY, JSON.stringify(touch));
    } else if (original && !original.intent && touch.intent) {
        local.setItem(ORIGINAL_KEY, JSON.stringify({ ...original, intent: touch.intent }));
    }
    if (hasCampaign || !read(session, LATEST_KEY)) session.setItem(LATEST_KEY, JSON.stringify(touch));

    return getMarketplaceAttribution();
}

export function getMarketplaceAttribution() {
    return {
        original: read(local, ORIGINAL_KEY),
        latest: read(session, LATEST_KEY)
    };
}

export function serializedMarketplaceAttribution() {
    return JSON.stringify(getMarketplaceAttribution()).slice(0, 900);
}

export function trackMarketplaceEvent(eventName, details = {}) {
    if (!CONVERSION_EVENTS.has(eventName)) {
        console.warn(`Marketplace analytics event is not registered: ${eventName}`);
        return;
    }

    const safeDetails = {
        audience: clean(details.audience, 40),
        landingPath: clean(details.landingPath || (getMarketplaceAttribution().latest || {}).landingPath, 160),
        planKey: clean(details.planKey, 40),
        listingId: clean(details.listingId, 80),
        role: clean(details.role, 40)
    };
    wixWindowFrontend.trackEvent(eventName, {
        eventCategory: 'Lighthouse Marketplace',
        eventAction: eventName,
        eventLabel: safeDetails.audience || safeDetails.planKey || safeDetails.landingPath,
        ...safeDetails
    });
}

export function connectMarketplaceForm(form, eventName, audience) {
    if (!form) return;
    const attribution = serializedMarketplaceAttribution();
    try {
        form.setFieldValues({ attribution_context: attribution });
    } catch (error) {
        console.warn('Marketplace attribution field is not available on this form.', error);
    }
    form.onSubmitSuccess(() => trackMarketplaceEvent(eventName, { audience }));
}
