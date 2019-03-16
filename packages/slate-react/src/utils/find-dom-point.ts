import findSlateDOMNode from './find-dom-node';

/*
 * Find a native DOM selection point from a Slate `key` and `offset`.
 */
function findDOMPoint(
    key: string,
    offset: number,
    win: Window = window
): { node: HTMLElement; offset: number } | null {
    const el = findSlateDOMNode(key, win);

    if (!el) {
        return null;
    }

    let start = 0;

    // COMPAT: In IE, this method's arguments are not optional, so we have to
    // pass in all four even though the last two are defaults. (2017/10/25)
    const iterator = win.document.createNodeIterator(
        el,
        NodeFilter.SHOW_TEXT,
        () => NodeFilter.FILTER_ACCEPT
    );

    while (1) {
        const n = iterator.nextNode();
        if (!n) {
            break;
        }

        const { length } = n.textContent;
        const end = start + length;

        if (offset <= end) {
            const o = offset - start;
            return { node: n, offset: o >= 0 ? o : 0 };
        }

        start = end;
    }

    return null;
}

export default findDOMPoint;
