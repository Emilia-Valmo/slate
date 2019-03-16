import { Change } from '@gitbook/slate';

import Options from '../options';
import { getCurrentCode } from '../utils';

/*
 * User is Cmd+A to select all text
 */

function onSelectAll(
    opts: Options,
    event: any,
    change: Change,
    editor: any
): void | Change {
    const { value } = change;
    event.preventDefault();

    const currentCode = getCurrentCode(opts, value);
    return change
        .collapseToStartOf(currentCode.getFirstText())
        .extendToEndOf(currentCode.getLastText());
}

export default onSelectAll;
