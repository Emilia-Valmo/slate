import { Change } from '@gitbook/slate';

import { TablePosition } from '../utils';
import removeColumnByKey from './removeColumnByKey';

import Options from '../options';

/*
 * Delete current column in a table
 */

function removeColumn(
    opts: Options,
    change: Change,
    options: {
        at?: number;
        normalize?: boolean;
    } = {}
): Change {
    const { value } = change;
    const { startKey } = value;
    const { at } = options;

    const pos = TablePosition.create(opts, value.document, startKey);

    let columnKey;

    if (typeof at === 'undefined') {
        columnKey = pos.cell.key;
    } else {
        columnKey = pos.row.nodes.get(at).key;
    }

    return removeColumnByKey(opts, change, columnKey, options);
}

export default removeColumn;
