import { Change } from '@gitbook/slate';

import Options from '../options';
import { isSelectionInTable } from '../utils';

import onBackspace from './onBackspace';
import onEnter from './onEnter';
import onModEnter from './onModEnter';
import onTab from './onTab';
import onUpDown from './onUpDown';

const KEY_ENTER = 'Enter';
const KEY_TAB = 'Tab';
const KEY_BACKSPACE = 'Backspace';
const KEY_DOWN = 'ArrowDown';
const KEY_UP = 'ArrowUp';

/*
 * User is pressing a key in the editor
 */

function onKeyDown(
    opts: Options,
    event: any,
    change: Change,
    editor: any
): void | any {
    // Only handle events in cells
    if (!isSelectionInTable(opts, change.value)) {
        return undefined;
    }

    // Build arguments list
    const args = [event, change, editor, opts];

    switch (event.key) {
        case KEY_ENTER:
            if (event.metaKey && opts.exitBlockType) {
                return onModEnter(event, change, editor, opts);
            }
            return onEnter(event, change, editor, opts);

        case KEY_TAB:
            return onTab(event, change, editor, opts);
        case KEY_BACKSPACE:
            return onBackspace(event, change, editor, opts);
        case KEY_DOWN:
        case KEY_UP:
            return onUpDown(event, change, editor, opts);
        default:
            return undefined;
    }
}

export default onKeyDown;
