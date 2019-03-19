import { Schema } from '@gitbook/slate';
import { Plugin } from '@gitbook/slate-react';

import Options, { OptionsFormat } from './options';
import TablePosition from './utils/TablePosition';

import createCoreAPI from './core';
import { onCopy, onKeyDown, onPaste } from './handlers';
import { createSchema } from './schema';

/*
 * Returns the full plugin object (behavior + rendering + schema)
 */
function EditTable(
    // The plugin options
    optionsParam?: OptionsFormat
): { schema: Schema; plugin: Plugin } {
    const opts = new Options(optionsParam || {});
    const corePlugin = createCoreAPI(opts);

    return {
        ...corePlugin,

        schema: createSchema(opts),

        plugin: {
            onKeyDown: onKeyDown.bind(null, opts),
            onCopy: onCopy.bind(null, opts),
            onPaste: onPaste.bind(null, opts)
        }
    };
}

export default EditTable;
export { TablePosition };
