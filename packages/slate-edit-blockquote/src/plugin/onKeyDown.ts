import { Change } from '@gitbook/slate';

import Options from '../options';

import onBackspace from './onBackspace';
import onEnter from './onEnter';
import onModEnter from './onModEnter';

const KEY_ENTER = 'Enter';
const KEY_BACKSPACE = 'Backspace';

/*
 * User is pressing a key in the editor
 */
function onKeyDown(
    opts: Options,
    event: any,
    change: Change,
    editor: any
): void | any {
    // Build arguments list
    const args = [opts, event, change, editor];

    switch (event.key) {
        case KEY_ENTER:
            if (event.metaKey && opts.exitBlockType) {
                return onModEnter(...args);
            }
            return onEnter(...args);
        case KEY_BACKSPACE:
            return onBackspace(...args);
        default:
            return undefined;
    }
}

export default onKeyDown;
