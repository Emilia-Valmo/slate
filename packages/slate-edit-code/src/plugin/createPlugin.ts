import { Plugin } from '@gitbook/slate-react';
import Options from '../options';
import onKeyDown from './onKeyDown';
import onPaste from './onPaste';

/*
 * Create the slate-react plugin.
 */
function createPlugin(opts: Options): Plugin {
    return {
        onKeyDown: onKeyDown.bind(null, opts),
        onPaste: onPaste.bind(null, opts)
    };
}

export default createPlugin;
