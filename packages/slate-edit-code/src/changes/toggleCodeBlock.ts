import { Change } from '@gitbook/slate';

import Options from '../options';
import { isInCodeBlock } from '../utils';

import unwrapCodeBlock from './unwrapCodeBlock';
import wrapCodeBlock from './wrapCodeBlock';

/*
 * Toggle code block / paragraph.
 */

function toggleCodeBlock(
    opts: Options,
    change: Change,
    // When toggling a code block off, to convert to
    type: string
): Change {
    if (isInCodeBlock(opts, change.value)) {
        return unwrapCodeBlock(opts, change, type);
    }
    return wrapCodeBlock(opts, change);
}

export default toggleCodeBlock;
