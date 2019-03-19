import {
    clearCell,
    insertColumn,
    insertRow,
    insertTable,
    insertTableFragmentAtRange,
    moveSelection,
    moveSelectionBy,
    removeColumn,
    removeColumnByKey,
    removeRow,
    removeRowByKey,
    removeTable,
    removeTableByKey
} from './changes';
import {
    createCell,
    createRow,
    createTable,
    forEachCells,
    getCellsAtColumn,
    getCellsAtRow,
    getCopiedFragment,
    getPosition,
    getPositionByKey,
    isSelectionInTable,
    isSelectionOutOfTable
} from './utils';

import Options from './options';

/*
 * Returns the core of the plugin, limited to the validation and normalization
 * part of `slate-edit-table`, and utils.
 *
 * Import this directly: `import EditTable from '@gitbook/slate-edit-table/lib/core'`
 * if you don't care about behavior/rendering and you
 * are only manipulating `Slate.Values` without rendering them.
 * That way you do not depend on `slate-react`.
 */
function core(opts: Options): object {
    return {
        utils: {
            isSelectionInTable: isSelectionInTable.bind(null, opts),
            isSelectionOutOfTable: isSelectionOutOfTable.bind(null, opts),
            getPosition: getPosition.bind(null, opts),
            getPositionByKey: getPositionByKey.bind(null, opts),
            createCell: createCell.bind(null, opts),
            createRow: createRow.bind(null, opts),
            createTable: createTable.bind(null, opts),
            forEachCells: forEachCells.bind(null, opts),
            getCellsAtRow: getCellsAtRow.bind(null, opts),
            getCellsAtColumn: getCellsAtColumn.bind(null, opts),
            getCopiedFragment: getCopiedFragment.bind(null, opts)
        },

        changes: {
            insertTable: insertTable.bind(null, opts),
            insertTableFragmentAtRange: insertTableFragmentAtRange.bind(
                null,
                opts
            ),
            clearCell: clearCell.bind(null, opts),
            removeRowByKey: removeRowByKey.bind(null, opts),
            removeColumnByKey: removeColumnByKey.bind(null, opts),
            removeTableByKey: removeTableByKey.bind(null, opts),
            insertRow: bindAndScopeChange(opts, insertRow),
            removeRow: bindAndScopeChange(opts, removeRow),
            insertColumn: bindAndScopeChange(opts, insertColumn),
            removeColumn: bindAndScopeChange(opts, removeColumn),
            removeTable: bindAndScopeChange(opts, removeTable),
            moveSelection: bindAndScopeChange(opts, moveSelection),
            moveSelectionBy: bindAndScopeChange(opts, moveSelectionBy)
        }
    };
}

/*
 * Bind a change to given options, and scope it to act only inside a table
 */
function bindAndScopeChange(opts: Options, fn: any): any {
    return (change, ...args) => {
        const { value } = change;

        if (!isSelectionInTable(opts, value)) {
            return change;
        }

        // $FlowFixMe
        return fn(...[opts, change].concat(args));
    };
}

export default core;
