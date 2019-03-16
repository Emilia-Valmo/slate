import { Record } from 'immutable';

const DEFAULTS = {
    type: 'blockquote',
    typeDefault: 'paragraph',
    exitBlockType: 'paragraph'
};

/*
 * The plugin options container
 */

class Options extends Record(DEFAULTS) {
    public type: string;
    public typeDefault: string;
    public exitBlockType: string;
}

export interface OptionsFormat {
    type?: string; // for blockquotes
    typeDefault?: string; // for default block in blockquote.
    exitBlockType?: string; // of block inserted when exiting
}

export default Options;
