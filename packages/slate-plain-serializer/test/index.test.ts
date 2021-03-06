import { resetKeyGenerator, Value } from '@gitbook/slate';
import Plain from '@gitbook/slate-plain-serializer';
import assert from 'assert';
import fs from 'fs';
import { basename, extname, resolve } from 'path';

/*
 * Reset Slate's internal key generator state before each text.
 */

beforeEach(() => {
    resetKeyGenerator();
});

/*
 * Tests.
 */

describe('slate-plain-serializer', () => {
    describe('deserialize()', () => {
        const dir = resolve(__dirname, './deserialize');
        const tests = fs
            .readdirSync(dir)
            .filter(t => t[0] !== '.')
            .map(t => basename(t, extname(t)));

        for (const test of tests) {
            it(test, async () => {
                const module = require(resolve(dir, test));
                const { input, output, options } = module;
                const value = Plain.deserialize(input, options);
                const actual = Value.isValue(value) ? value.toJS() : value;
                const expected = Value.isValue(output) ? output.toJS() : output;
                assert.deepEqual(actual, expected);
            });
        }
    });

    describe('serialize()', () => {
        const dir = resolve(__dirname, './serialize');
        const tests = fs
            .readdirSync(dir)
            .filter(t => t[0] !== '.')
            .map(t => basename(t, extname(t)));

        for (const test of tests) {
            it(test, async () => {
                const module = require(resolve(dir, test));
                const { input, output, options } = module;
                const actual = Plain.serialize(input, options);
                const expected = output;
                assert.deepEqual(actual, expected);
            });
        }
    });
});
