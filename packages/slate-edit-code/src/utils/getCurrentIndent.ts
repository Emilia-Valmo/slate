import { Value } from '@gitbook/slate';

import Options from '../options';
import getCurrentCode from './getCurrentCode';
import getIndent from './getIndent';

/*
 * Detect indentation in the current code block
 */

function getCurrentIndent(opts: Options, value: Value): string {
    if (opts.getIndent) {
        return opts.getIndent(value);
    }

    const currentCode = getCurrentCode(opts, value);

    if (!currentCode) {
        return '';
    }

    const text = currentCode
        .getTexts()
        .map(t => t.text)
        .join('\n');
    return getIndent(text);
}

export default getCurrentIndent;
