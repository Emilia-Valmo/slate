import { Schema, Value } from '@gitbook/slate';
import hyperprint from '@gitbook/slate-hyperprint';
import fs from 'fs';
import path from 'path';

import EditBlockquote from '../src';

const plugin = EditBlockquote();

describe('slate-edit-blockquote', () => {
    const tests = fs.readdirSync(__dirname);

    tests.forEach((test, index) => {
        if (test[0] === '.' || path.extname(test).length > 0) {
            return;
        }

        it(test, () => {
            const dir = path.resolve(__dirname, test);

            const input = require(path.resolve(dir, 'input')).default.setSchema(
                plugin.schema
            );

            const expectedPath = path.resolve(dir, 'expected');
            const expected =
                fs.existsSync(expectedPath) &&
                require(expectedPath).default.setSchema(plugin.schema);

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
