import { Change } from '@gitbook/slate';

import { unwrapBlockquote } from '../changes/';
import Options from '../options';
import { getCurrentBlockquote } from '../utils';

/*
 * User pressed Enter in an editor
 *
 * Enter on an empty block inside a blockquote exit the blockquote.
 */

function onEnter(opts: Options, event: any, change: Change, editor: any) {
    const { value } = change;
    const { startBlock } = value;

    if (!getCurrentBlockquote(opts, value)) {
        return undefined;
    }

    if (startBlock.text.length !== 0) {
        return undefined;
    }

    // Block is empty, we exit the blockquote
    event.preventDefault();
    return unwrapBlockquote(opts, change);
}

export default onEnter;
