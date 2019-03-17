import { Plugin } from '@gitbook/slate-react';

import Options from '../options';
import onBackspace from './onBackspace';
import onEnter from './onEnter';
import onTab from './onTab';

const KEY_ENTER = 'Enter';
const KEY_TAB = 'Tab';
const KEY_BACKSPACE = 'Backspace';

/*
 * Create the slate-react plugin.
 */
function createPlugin(opts: Options): Plugin {
    return {
        onKeyDown: onKeyDown.bind(null, opts)
    };
}

/*
 * User is pressing a key in the editor
 */
function onKeyDown(opts: Options, event, change, editor: any): void | any {
    const args = [event, change, editor, opts];

    switch (event.key) {
        case KEY_ENTER:
            return onEnter(...args);
        case KEY_TAB:
            return onTab(...args);
        case KEY_BACKSPACE:
            return onBackspace(...args);
        default:
            return undefined;
    }
}

export default createPlugin;
