import assert from 'assert';
import fs from 'fs';
import { resolve } from 'path';

describe('texts', () => {
    const dir = resolve(__dirname);

    const categories = fs
        .readdirSync(dir)
        .filter(c => c[0] !== '.' && c !== 'index.tsx');

    for (const category of categories) {
        describe(category, () => {
            const categoryDir = resolve(dir, category);
            const methods = fs
                .readdirSync(categoryDir)
                .filter(c => c[0] !== '.' && !c.includes('.tsx'));

            for (const method of methods) {
                describe(method, () => {
                    const testDir = resolve(categoryDir, method);
                    const tests = fs
                        .readdirSync(testDir)
                        .filter(t => t[0] !== '.' && t.includes('.tsx'));

                    for (const test of tests) {
                        const module = require(resolve(testDir, test));
                        const { input, output, skip } = module;
                        const fn = module.default;
                        const t = skip ? it.skip : it;

                        t(test.replace('.tsx', ''), () => {
                            const actual = fn(input);
                            const expected = output.toJS();
                            assert.deepEqual(actual.toJS(), expected);
                        });
                    }
                });
            }
        });
    }
});
