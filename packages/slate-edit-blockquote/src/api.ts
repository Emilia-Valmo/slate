import { unwrapBlockquote, wrapInBlockquote } from './changes';
import Options from './options';
import { isSelectionInBlockquote } from './utils';

/*
 * Helpful API to manipulate blockquotes.
 */
function createAPI(opts: Options): object {
    return {
        utils: {
            isSelectionInBlockquote: isSelectionInBlockquote.bind(null, opts)
        },

        changes: {
            wrapInBlockquote: wrapInBlockquote.bind(null, opts),
            unwrapBlockquote: bindAndScopeChange(opts, unwrapBlockquote)
        }
    };
}

/*
 * Bind a change to given options, and scope it to act only inside a blockquote
 */
function bindAndScopeChange(opts: Options, fn: any): any {
    return (change, ...args) => {
        const { value } = change;

        if (!isSelectionInBlockquote(opts, value)) {
            return change;
        }

        // $FlowFixMe
        return fn(...[opts, change].concat(args));
    };
}

export { createAPI };
