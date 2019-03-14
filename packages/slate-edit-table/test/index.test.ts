import { resetKeyGenerator, Schema, Value } from '@gitbook/slate';
import hyperprint from '@gitbook/slate-hyperprint';
import fs from 'fs';
import path from 'path';
import EditTable from '../src';

const PLUGIN = EditTable();
const SCHEMA = Schema.create({
    plugins: [PLUGIN]
});

function deserializeValue(value) {
    return Value.fromJS(
        {
            document: value.document,
            schema: SCHEMA,
            selection: value.selection
        },
        { normalize: false }
    );
}

describe('slate-edit-table', () => {
    const tests = fs.readdirSync(__dirname);

    tests.forEach(test => {
        if (test[0] === '.' || path.extname(test).length > 0) {
            return;
        }

        it(test, () => {
            resetKeyGenerator();
            const dir = path.resolve(__dirname, test);
            const input = require(path.resolve(dir, 'input')).default;
            const expectedPath = path.resolve(dir, 'expected');
            const expected =
                fs.existsSync(expectedPath) && require(expectedPath).default;

            const runChange = require(path.resolve(dir, 'change')).default;

            const valueInput = deserializeValue(input);

            const newChange = runChange(PLUGIN, valueInput.change());

            if (expected) {
                const newDoc = hyperprint(newChange.value.document, {
                    strict: true
                });
                expect(newDoc).toEqual(
                    hyperprint(expected.document, { strict: true })
                );

                // Check that the selection is still valid
                if (!newChange.value.document.nodes.isEmpty()) {
                    expect(newChange.value.startBlock).toBeDefined();
                }
            }
        });
    });
});
