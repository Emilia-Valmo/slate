import { JSDOM } from 'jsdom';

const UNWANTED_ATTRS = ['data-key', 'data-offset-key'];

const UNWANTED_TOP_LEVEL_ATTRS = [
    'autocorrect',
    'spellcheck',
    'style',
    'data-gramm'
];

/*
 * Clean an `element` of unwanted attributes.
 */
function stripUnwantedAttrs(element: HTMLElement): HTMLElement {
    if (typeof element.removeAttribute === 'function') {
        UNWANTED_ATTRS.forEach(attr => element.removeAttribute(attr));

        if (element.parentNode.nodeName === '#document-fragment') {
            UNWANTED_TOP_LEVEL_ATTRS.forEach(attr =>
                element.removeAttribute(attr)
            );
        }
    }

    if (element.childNodes.length) {
        element.childNodes.forEach(stripUnwantedAttrs);
    }

    if (element.nodeName === '#text') {
        element.textContent = element.textContent.trim();
    }

    return element;
}

/*
 * Clean a renderer `html` string, removing dynamic attributes.
 */
export default function clean(html: string): string {
    const $ = JSDOM.fragment(html);
    $.childNodes.forEach(stripUnwantedAttrs);
    return $.firstChild.outerHTML;
}
