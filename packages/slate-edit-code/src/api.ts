import {
    toggleCodeBlock,
    unwrapCodeBlock,
    unwrapCodeBlockByKey,
    wrapCodeBlock,
    wrapCodeBlockByKey
} from './changes';
import Options from './options';
import { deserializeCode, isInCodeBlock } from './utils';

/*
 * The core of the plugin, which does not relies on `slate-react`, and includes
 * everything but behavior and rendering logic.
 */
function createAPI(opts: Options): object {
    return {
        changes: {
            unwrapCodeBlockByKey: unwrapCodeBlockByKey.bind(null, opts),
            wrapCodeBlockByKey: wrapCodeBlockByKey.bind(null, opts),
            wrapCodeBlock: wrapCodeBlock.bind(null, opts),
            unwrapCodeBlock: unwrapCodeBlock.bind(null, opts),
            toggleCodeBlock: toggleCodeBlock.bind(null, opts)
        },

        utils: {
            isInCodeBlock: isInCodeBlock.bind(null, opts),
            deserializeCode: deserializeCode.bind(null, opts)
        }
    };
}

export { createAPI };
