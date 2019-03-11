import { Change } from '@gitbook/slate';

import { indentLines } from '../changes';
import { getCurrentIndent } from '../utils';

import Options from '../options';

/*
 * User pressed Tab in an editor:
 * Insert a tab after detecting it from code block content.
 */

function onTab(
    opts: Options,
    event: any,
    change: Change,
    editor: any
): void | Change {
    const { value } = change;
    event.preventDefault();
    event.stopPropagation();

    const { isCollapsed } = value;
    const indent = getCurrentIndent(opts, value);

    // Selection is collapsed, we just insert an indent at cursor
    if (isCollapsed) {
        return change.insertText(indent).focus();
    }

    // We indent all selected lines
    return indentLines(opts, change, indent);
}

export default onTab;
