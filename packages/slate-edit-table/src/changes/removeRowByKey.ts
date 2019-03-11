import { Change } from '@gitbook/slate';

import Options from '../options';
import { TablePosition } from '../utils';
import clearCell from './clearCell';

/*
 * Remove the row associated to a given key in a table.
 * Clear thw row if last remaining row
 */

function removeRowByKey(
    opts: Options,
    change: Change,
    key: string,
    options: {
        normalize?: boolean;
    } = {}
): Change {
    const { value } = change;

    const pos = TablePosition.create(opts, value.document, key);

    // Update table by removing the row
    if (pos.getHeight() > 1) {
        change.removeNodeByKey(key, options);
    } else {
        // If last remaining row, clear it instead
        pos.row.nodes.forEach(cell => {
            cell.nodes.forEach(node => clearCell(opts, change, cell, options));
        });
    }

    return change;
}

export default removeRowByKey;
