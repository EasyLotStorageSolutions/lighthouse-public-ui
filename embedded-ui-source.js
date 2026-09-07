const EMBED_BASE = 'https://easylotstoragesolutions.github.io/lighthouse-public-ui';
const EMBED_RELEASE = '20260907-selected-phones-maker-recovery-v1';

export function useEmbeddedUi(element, fileName) {
    if (!element || !fileName) return element;
    if ('src' in element) element.src = `${EMBED_BASE}/${fileName}?v=${EMBED_RELEASE}`;
    if ('scrolling' in element) element.scrolling = 'no';
    return element;
}

