import {
    getSolutionsCatalog,
    getProviderSignupCatalog,
    submitProviderApplication,
    submitSolutionRequest,
    getProviderDashboard,
    updateProviderAvailability,
    updateProviderServiceArea,
    respondToDispatchOffer,
    getAdminProviderApplications,
    reviewProviderApplication,
    getAdminProviderOperations,
    updateProviderAdminState,
    getAdminRoutingQueue,
    getAdminDemandRadar,
    sendManualDispatchOffer,
    saveProviderResource,
    confirmProviderResourceAvailability,
    createProviderNetworkAssist
} from 'backend/solutions-network';
import {
    getOwnerMarketplaceAuctions,
    reviewMarketplaceAuction,
    closeMarketplaceAuction
} from 'backend/marketplace';

function errorMessage(error) {
    return error instanceof Error ? error.message : String(error || 'Something went wrong.');
}

function panel($w, componentId) {
    const element = $w(`#${componentId}`);
    if (element && typeof element.expand === 'function') element.expand();
    if (element && typeof element.show === 'function') element.show();
    return element;
}

export function wireSolutionsPage($w, componentId = 'html1') {
    const element = panel($w, componentId);
    if (!element || typeof element.onMessage !== 'function') return;
    element.onMessage(async event => {
        const message = event.data || {};
        if (message.type === 'solutions:ready') {
            try { element.postMessage({ type: 'solutions:catalog', catalog: await getSolutionsCatalog() }); }
            catch (error) { element.postMessage({ type: 'solutions:catalog', catalog: [], error: errorMessage(error) }); }
        }
        if (message.type === 'solutions:submitRequest') {
            try { element.postMessage({ type: 'solutions:result', result: await submitSolutionRequest(message.data || {}) }); }
            catch (error) { element.postMessage({ type: 'solutions:result', error: errorMessage(error) }); }
        }
    });
}

export function wireProviderApplicationPage($w, componentId = 'html1') {
    const element = panel($w, componentId);
    if (!element || typeof element.onMessage !== 'function') return;
    element.onMessage(async event => {
        const message = event.data || {};
        if (message.type === 'provider:ready') {
            try { element.postMessage({ type: 'provider:catalog', catalog: await getProviderSignupCatalog() }); }
            catch (error) { element.postMessage({ type: 'provider:catalog', catalog: { categories: [], questions: [] }, error: errorMessage(error) }); }
        }
        if (message.type === 'provider:submitApplication') {
            try { element.postMessage({ type: 'provider:applicationResult', result: await submitProviderApplication(message.data || {}) }); }
            catch (error) { element.postMessage({ type: 'provider:applicationResult', error: errorMessage(error) }); }
        }
    });
}

export function wireProviderDashboardPage($w, componentId = 'html1') {
    const element = panel($w, componentId);
    if (!element || typeof element.onMessage !== 'function') return;
    element.onMessage(async event => {
        const message = event.data || {};
        try {
            if (message.type === 'providerDashboard:ready') element.postMessage({ type: 'providerDashboard:data', dashboard: await getProviderDashboard() });
            if (message.type === 'providerDashboard:updateArea') {
                await updateProviderServiceArea(message.data || {});
                element.postMessage({ type: 'providerDashboard:updated' });
            }
            if (message.type === 'providerDashboard:updateAvailability') {
                await updateProviderAvailability(message.data || {});
                element.postMessage({ type: 'providerDashboard:updated' });
            }
            if (message.type === 'providerDashboard:respond') {
                await respondToDispatchOffer(message.offerId, message.response, message.reason);
                element.postMessage({ type: 'providerDashboard:updated' });
            }
            if (message.type === 'providerDashboard:saveResource') {
                await saveProviderResource(message.data || {});
                element.postMessage({ type: 'providerDashboard:updated' });
            }
            if (message.type === 'providerDashboard:resourceAvailability') {
                await confirmProviderResourceAvailability(message.data || {});
                element.postMessage({ type: 'providerDashboard:updated' });
            }
            if (message.type === 'providerDashboard:networkAssist') {
                await createProviderNetworkAssist(message.data || {});
                element.postMessage({ type: 'providerDashboard:updated' });
            }
        } catch (error) {
            const type = message.type === 'providerDashboard:ready' ? 'providerDashboard:data' : 'providerDashboard:updated';
            element.postMessage({ type, error: errorMessage(error) });
        }
    });
}

export function wireProviderAdminPage($w, componentId = 'html1') {
    const element = panel($w, componentId);
    if (!element || typeof element.onMessage !== 'function') return;
    element.onMessage(async event => {
        const message = event.data || {};
        if (message.type === 'providerAdmin:load') {
            try { element.postMessage({ type: 'providerAdmin:data', applications: await getAdminProviderApplications(message.status) }); }
            catch (error) { element.postMessage({ type: 'providerAdmin:data', error: errorMessage(error) }); }
        }
        if (message.type === 'providerAdmin:review') {
            try { element.postMessage({ type: 'providerAdmin:reviewed', result: await reviewProviderApplication(message.applicationId, message.action, message.notes) }); }
            catch (error) { element.postMessage({ type: 'providerAdmin:reviewed', error: errorMessage(error) }); }
        }
        if (message.type === 'providerAdmin:loadOperations') {
            try { element.postMessage({ type: 'providerAdmin:operations', operations: await getAdminProviderOperations(message.providerId) }); }
            catch (error) { element.postMessage({ type: 'providerAdmin:operations', error: errorMessage(error) }); }
        }
        if (message.type === 'providerAdmin:updateProvider') {
            try { element.postMessage({ type: 'providerAdmin:providerUpdated', result: await updateProviderAdminState(message.providerId, message.action, message.data || {}) }); }
            catch (error) { element.postMessage({ type: 'providerAdmin:providerUpdated', error: errorMessage(error) }); }
        }
        if (message.type === 'providerAdmin:loadRouting') {
            try { element.postMessage({ type: 'providerAdmin:routing', requests: await getAdminRoutingQueue() }); }
            catch (error) { element.postMessage({ type: 'providerAdmin:routing', error: errorMessage(error) }); }
        }
        if (message.type === 'providerAdmin:loadDemandRadar') {
            try { element.postMessage({ type: 'providerAdmin:demandRadar', radar: await getAdminDemandRadar() }); }
            catch (error) { element.postMessage({ type: 'providerAdmin:demandRadar', error: errorMessage(error) }); }
        }
        if (message.type === 'providerAdmin:sendOffer') {
            try { element.postMessage({ type: 'providerAdmin:offerSent', result: await sendManualDispatchOffer(message.requestId, message.providerId) }); }
            catch (error) { element.postMessage({ type: 'providerAdmin:offerSent', error: errorMessage(error) }); }
        }
        if (message.type === 'providerAdmin:loadAuctions') {
            try { element.postMessage({ type: 'providerAdmin:auctions', auctions: await getOwnerMarketplaceAuctions(message.status) }); }
            catch (error) { element.postMessage({ type: 'providerAdmin:auctions', error: errorMessage(error) }); }
        }
        if (message.type === 'providerAdmin:reviewAuction') {
            try { element.postMessage({ type: 'providerAdmin:auctionReviewed', result: await reviewMarketplaceAuction(message.auctionId, message.review || {}) }); }
            catch (error) { element.postMessage({ type: 'providerAdmin:auctionReviewed', error: errorMessage(error) }); }
        }
        if (message.type === 'providerAdmin:closeAuction') {
            try { element.postMessage({ type: 'providerAdmin:auctionClosed', result: await closeMarketplaceAuction(message.auctionId) }); }
            catch (error) { element.postMessage({ type: 'providerAdmin:auctionClosed', error: errorMessage(error) }); }
        }
    });
}
