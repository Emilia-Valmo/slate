import Simulator from '@gitbook/slate-simulator';
import assert from 'assert';
import fs from 'fs';
import { basename, extname, resolve } from 'path';
import toCamel from 'to-camel-case';
import AfterPlugin from '../../src/plugins/after';
import BeforePlugin from '../../src/plugins/before';

/*
 * Tests.
 */

describe('plugins', () => {
    describe.skip('core', () => {
        const dir = resolve(__dirname, 'core');
        const events = fs
            .readdirSync(dir)
            .filter(e => e[0] !== '.' && e !== 'index.tsx');

        for (const event of events) {
            describe(`${toCamel(event)}`, () => {
                const testDir = resolve(dir, event);
                const tests = fs
                    .readdirSync(testDir)
                    .filter(t => t[0] !== '.' && !!~t.indexOf('.tsx'))
                    .map(t => basename(t, extname(t)));

                for (const test of tests) {
                    it(test, async () => {
                        const module = require(resolve(testDir, test));
                        const { input, output } = module;
                        const fn = module.default;
                        const plugins = [BeforePlugin(), AfterPlugin()];
                        const simulator = new Simulator({
                            plugins,
                            value: input
                        });
                        fn(simulator);

                        const actual = simulator.value.toJS({
                            preserveSelection: true
                        });
                        const expected = output.toJS({
                            preserveSelection: true
                        });
                        assert.deepEqual(actual, expected);
                    });
                }
            });
        }
    });
});
