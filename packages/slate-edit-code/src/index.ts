import { Schema } from '@gitbook/slate';
import { Plugin } from '@gitbook/slate-react';

import { createAPI } from './api';
import Options, { OptionsFormat } from './options';
import { createPlugin } from './plugin';
import { createSchema } from './schema';

/*
 * A Slate plugin to handle keyboard events in code blocks.
 */
function EditCode(
    optsParam: OptionsFormat = {}
): {
    plugin: Plugin;
    schema: Schema;
} {
    const opts = new Options(optsParam);
    const api = createAPI(opts);

    return {
        ...api,
        schema: createSchema(opts),
        plugin: createPlugin(opts)
    };
}

export default EditCode;
