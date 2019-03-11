import { Change, Range } from '@gitbook/slate';
import { getEventTransfer } from '@gitbook/slate-react';

import { insertTableFragmentAtRange } from '../changes';
import Options from '../options';
import { isRangeInTable, isSelectionInTable } from '../utils';

/*
 *  Handle pasting inside tables
 */

function onPaste(opts: Options, event: any, change: Change): Object {
    // Outside of tables, do not alter paste behavior
    if (!isSelectionInTable(opts, change.value)) {
        return undefined;
    }

    const transfer = getEventTransfer(event);
    const { type, fragment } = transfer;

    if (type != 'fragment' || fragment.nodes.isEmpty()) {
        return null;
    }

    if (
        !isRangeInTable(
            opts,
            fragment,
            Range.create({
                anchorKey: fragment.getFirstText().key,
                focusKey: fragment.getLastText().key
            })
        )
    ) {
        return null;
    }

    return insertTableFragmentAtRange(
        opts,
        change,
        change.value.selection,
        fragment
    );
}

export default onPaste;
