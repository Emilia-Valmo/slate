import { Change } from '@gitbook/slate';

import Options from '../options';
import { getIndent } from '../utils';

/*
 * User pressed Enter in an editor:
 * Insert a new code line and start it with the indentation from previous line
 */

function onEnter(
    opts: Options,
    event: any,
    change: Change,
    editor: any
): void | Change {
    const { value } = change;

    if (!value.isCollapsed) {
        return undefined;
    }

    event.preventDefault();

    const { startBlock } = value;
    const currentLineText = startBlock.text;
    const indent = getIndent(currentLineText, '');

    return change
        .splitBlock()
        .insertText(indent)
        .focus();
}

export default onEnter;
