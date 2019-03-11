import { Change } from '@gitbook/slate';
import { dedentLines } from '../changes';
import Options from '../options';
import { getCurrentIndent } from '../utils';

/*
 * User pressed Shift+Tab in an editor:
 * Reduce indentation in the selected lines.
 */

function onShiftTab(
    opts: Options,
    event: any,
    change: Change,
    editor: any
): void | Change {
    const { value } = change;
    event.preventDefault();
    event.stopPropagation();

    const indent = getCurrentIndent(opts, value);

    // We dedent all selected lines
    return dedentLines(opts, change, indent);
}

export default onShiftTab;
