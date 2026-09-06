import {
    getMyEasyLotWorkspace,
    requestMyEasyLotMoveOut,
    submitMyEasyLotIssue
} from 'backend/easy-lot-renter';

const message = error => error instanceof Error ? error.message : String(error || 'My Easy Lot request failed.');

export function wireMyEasyLot($w, componentId) {
    const element = $w(`#${componentId}`);
    if (!element || typeof element.onMessage !== 'function') return;
    if ('scrolling' in element) element.scrolling = 'no';
    if (typeof element.expand === 'function') element.expand();
    if (typeof element.show === 'function') element.show();
    const hydrate = async () => element.postMessage({ type: 'my-easy-lot:data', workspace: await getMyEasyLotWorkspace() });
    element.onMessage(async event => {
        const request = event.data || {};
        try {
            if (request.type === 'my-easy-lot:ready' || request.type === 'my-easy-lot:refresh') await hydrate();
            if (request.type === 'my-easy-lot:issue') {
                const result = await submitMyEasyLotIssue(request.data || {});
                element.postMessage({ type: 'my-easy-lot:changed', result, message: result.duplicate ? 'This open report is already being tracked.' : 'Your private report was saved for review.' });
            }
            if (request.type === 'my-easy-lot:move-out') {
                const result = await requestMyEasyLotMoveOut(request.data || {});
                element.postMessage({ type: 'my-easy-lot:changed', result, message: result.duplicate ? 'Your open move-out request is already being tracked.' : 'Your move-out request was saved for review. Your rental has not been changed.' });
            }
        } catch (error) {
            element.postMessage({ type: 'my-easy-lot:error', error: message(error) });
        }
    });
    hydrate().catch(error => element.postMessage({ type: 'my-easy-lot:error', error: message(error) }));
}
