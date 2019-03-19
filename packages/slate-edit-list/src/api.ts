import {
    decreaseItemDepth,
    increaseItemDepth,
    splitListItem,
    unwrapList,
    wrapInList
} from './changes';
import Options, { OptionsFormat } from './options';
import {
    getCurrentItem,
    getCurrentList,
    getItemDepth,
    getItemsAtRange,
    getPreviousItem,
    isList,
    isSelectionInList
} from './utils';

/*
 * Returns the core of the plugin, limited to the validation and normalization
 * part of `slate-edit-list`, and utils.
 *
 * Import this directly: `import EditListCore from '@gitbook/slate-edit-table/lib/core'`
 * if you don't care about behavior/rendering.
 */
function createAPI(opts: Options): object {
    return {
        utils: {
            getCurrentItem: getCurrentItem.bind(null, opts),
            getCurrentList: getCurrentList.bind(null, opts),
            getItemDepth: getItemDepth.bind(null, opts),
            getItemsAtRange: getItemsAtRange.bind(null, opts),
            getPreviousItem: getPreviousItem.bind(null, opts),
            isList: isList.bind(null, opts),
            isSelectionInList: isSelectionInList.bind(null, opts)
        },

        changes: {
            decreaseItemDepth: bindAndScopeChange(opts, decreaseItemDepth),
            increaseItemDepth: bindAndScopeChange(opts, increaseItemDepth),
            splitListItem: bindAndScopeChange(opts, splitListItem),
            unwrapList: bindAndScopeChange(opts, unwrapList),
            wrapInList: wrapInList.bind(null, opts)
        }
    };
}

/*
 * Bind a change to given options, and scope it to act only inside a list
 */
function bindAndScopeChange(opts: Options, fn: any): any {
    return (change, ...args) => {
        const { value } = change;

        if (!isSelectionInList(opts, value)) {
            return change;
        }

        return fn(...[opts, change].concat(args));
    };
}

export { createAPI };
