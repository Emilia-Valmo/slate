import { Range as SlateRange } from '@gitbook/slate';
import findDOMPoint from './find-dom-point';

/*
 * Find a native DOM range Slate `range`.
 */
function findDOMRange(range: SlateRange, win: Window = window): Range | null {
    const {
        anchorKey,
        anchorOffset,
        focusKey,
        focusOffset,
        isBackward,
        isCollapsed
    } = range;
    const anchor = findDOMPoint(anchorKey, anchorOffset, win);
    const focus = isCollapsed
        ? anchor
        : findDOMPoint(focusKey, focusOffset, win);
    if (!anchor || !focus) {
        return null;
    }

    const r = win.document.createRange();
    const start = isBackward ? focus : anchor;
    const end = isBackward ? anchor : focus;
    r.setStart(start.node, start.offset);
    r.setEnd(end.node, end.offset);
    return r;
}

export default findDOMRange;
