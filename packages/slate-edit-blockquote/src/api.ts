import { unwrapBlockquote, wrapInBlockquote } from './changes';
import Options, { OptionsFormat } from './options';
import { isSelectionInBlockquote } from './utils';

/*
 * The core of the plugin, which does not relies on `slate-react`, and includes
 * everything but behavior and rendering logic.
 */
function createAPI(opts: OptionsFormat): Object {
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
