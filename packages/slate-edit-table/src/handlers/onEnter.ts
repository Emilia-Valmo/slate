import { Change } from '@gitbook/slate';

import { insertRow } from '../changes';
import Options from '../options';
import { TablePosition } from '../utils';

/*
 * Insert a new row when pressing "Enter"
 */

function onEnter(
    event: any,
    change: Change,
    editor: any,
    opts: Options
): void | Change {
    event.preventDefault();
    const { selection, document } = change.value;
    const pos = TablePosition.create(opts, document, selection.startKey);

    if (
        !selection.hasFocusAtStartOf(pos.cell) &&
        !selection.hasFocusAtEndOf(pos.cell)
    ) {
        return undefined;
    }

    if (event.shiftKey) {
        return change
            .splitBlock()
            .setBlocks({ type: opts.typeContent, data: {} });
    }

    return insertRow(opts, change);
}

export default onEnter;
