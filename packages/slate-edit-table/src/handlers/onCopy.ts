import { Change } from '@gitbook/slate';
import { cloneFragment } from '@gitbook/slate-react';

import Options from '../options';
import { getCopiedFragment } from '../utils';

/*
 *  Handle copying content of tables
 */

function onCopy(
    // The plugin options
    opts: Options,
    event: any,
    change: Change
): object {
    const copiedFragment = getCopiedFragment(opts, change.value);

    if (!copiedFragment) {
        // Default copy behavior
        return null;
    }

    // Override default onCopy
    cloneFragment(event, change.value, copiedFragment);
    return true;
}

export default onCopy;
