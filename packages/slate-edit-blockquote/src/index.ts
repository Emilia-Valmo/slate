import { Schema } from '@gitbook/slate';
import { Plugin } from '@gitbook/slate-react';

import Options, { OptionsFormat } from './options';

import { createAPI } from './api';
import { createPlugin } from './plugin';
import { createSchema } from './schema';

/*
 * A Slate plugin to handle keyboard events in lists.
 */
function EditBlockquote(
    opts: OptionsFormat = {}
): {
    schema: Schema;
    plugin: Plugin;
} {
    opts = new Options(opts);

    const api = createAPI(opts);

    return {
        ...api,
        schema: createSchema(opts),
        plugin: createPlugin(opts)
    };
}

export default EditBlockquote;
