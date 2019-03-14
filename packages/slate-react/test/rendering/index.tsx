import assert from 'assert';
import fs from 'fs-promise';
import { JSDOM } from 'jsdom';
import { basename, extname, resolve } from 'path';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { Editor } from '../..';
import clean from '../helpers/clean';

/*
 * Tests.
 */

describe('rendering', () => {
    const dir = resolve(__dirname, './fixtures');
    const tests = fs
        .readdirSync(dir)
        .filter(t => t[0] !== '.' && !!~t.indexOf('.tsx'))
        .map(t => basename(t, extname(t)));

    for (const test of tests) {
        it(test, async () => {
            const module = require(resolve(dir, test));
            const { value, output, props } = module;
            const p = {
                value,
                onChange() {},
                ...(props || {})
            };

            const content = ReactDOM.renderToStaticMarkup(<Editor {...p} />);
            const dom = JSDOM.fragment(output);
            const expected = dom.firstChild.outerHTML
                .trim()
                .replace(/\n/gm, '')
                .replace(/>\s*</g, '><');

            assert.equal(clean(content), expected);
        });
    }
});
