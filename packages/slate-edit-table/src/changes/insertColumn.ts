import { Block, Change } from '@gitbook/slate';

import { createCell, TablePosition } from '../utils';
import moveSelection from './moveSelection';

import Options from '../options';

/*
 * Insert a new column in current table
 */
function insertColumn(
    opts: Options,
    change: Change,
    options: {
        at?: number; // Column index
        getCell?: (column: number, row: number) => Block;
        normalize?: boolean;
    } = {}
): Change {
    const normalize = change.getFlag('normalize', options);
    const { value } = change;
    const { startKey } = value;

    const pos = TablePosition.create(opts, value.document, startKey);
    const { table } = pos;

    const {
        at = pos.getColumnIndex() + 1,
        getCell = () => createCell(opts)
    } = options;

    // Insert the new cell
    table.nodes.forEach((row, rowIndex) => {
        const newCell = getCell(at, rowIndex);

        change.insertNodeByKey(row.key, at, newCell, {
            normalize: false
        });
    });

    // Update the selection (not doing can break the undo)
    moveSelection(opts, change, pos.getColumnIndex() + 1, pos.getRowIndex());

    if (normalize) {
        change.normalizeNodeByKey(table.key);
    }

    return change;
}

export default insertColumn;
