import Slate from '@gitbook/slate';
import hyperprint from '@gitbook/slate-hyperprint';
import fs from 'fs';
import path from 'path';

import EditBlockquote from '../src';

// Provide the value with
function deserializeValue(plugin, value) {
    const SCHEMA = Slate.Schema.create({
        plugins: [plugin]
    });

    return Slate.Value.fromJS(
        {
            selection: value.selection,
            document: value.document,
            schema: SCHEMA
        },
        { normalize: false }
    );
}

describe('slate-edit-blockquote', () => {
    const tests = fs.readdirSync(__dirname);

    tests.forEach((test, index) => {
        if (test[0] === '.' || path.extname(test).length > 0) {
            return;
        }

        it(test, () => {
            const dir = path.resolve(__dirname, test);
            const plugin = EditBlockquote();

            const input = deserializeValue(
                plugin,
                require(path.resolve(dir, 'input')).default
            );

            const expectedPath = path.resolve(dir, 'expected');
            const expected =
                fs.existsSync(expectedPath) &&
                deserializeValue(plugin, require(expectedPath).default);

            const runChange = require(path.resolve(dir, 'change')).default;

            const newChange = runChange(plugin, input.change());

            if (expected) {
                const actual = newChange.value;

                expect(hyperprint(actual, { strict: true })).toEqual(
                    hyperprint(expected, { strict: true })
                );
            }
        });
    });
});
