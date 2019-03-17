import { Schema } from '@gitbook/slate';
import { Plugin } from '@gitbook/slate-react';

import { createAPI } from './api';
import Options, { OptionsFormat } from './options';
import { createPlugin } from './plugin';
import { createSchema } from './schema';

/*
 * A Slate plugin to handle keyboard events in lists.
 */
function EditList(
    optsInput: OptionsFormat = {}
): {
    schema: Schema;
    plugin: Plugin;
} {
    const opts = new Options(optsInput);

    return {
        ...createAPI(opts),
        schema: createSchema(opts),
        plugin: createPlugin(opts)
    };
}

export default EditList;
