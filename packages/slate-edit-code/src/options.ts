import { Block, Change, Text, Value } from '@gitbook/slate';
import { Record } from 'immutable';

export interface OptionsFormat {
    // Type of the code containers
    containerType?: string;
    // Type of the code lines
    lineType?: string;

    // Mod+Enter will exit the code container, into the given block type.
    // Backspace at start of empty code container, will turn it into the given block type.
    exitBlockType?: string;
    // Should the plugin handle the select all inside a code container
    selectAll?: boolean;
    // Allow marks inside code blocks
    allowMarks?: boolean;
    // Returns the indent unit to use at the given selection, as a string
    getIndent?: ((value: Value) => string) | null;
    // Custom exit handler
    // exitBlockType option is useless if onExit is provided
    onExit?: ((change: Change) => Change) | null;
}

const DEFAULTS: OptionsFormat = {
    containerType: 'code_block',
    lineType: 'code_line',
    exitBlockType: 'paragraph',
    selectAll: true,
    allowMarks: false,
    getIndent: null,
    onExit: null
};

/*
 * The plugin options container
 */
class Options extends Record(DEFAULTS) {
    public containerType: string;
    public lineType: string;
    public exitBlockType: string;
    public selectAll: boolean;
    public allowMarks: boolean;
    public getIndent: ((Value) => string) | null;
    public onExit: ((Change) => Change | null) | null;

    public resolvedOnExit(change: Change): Change | null {
        if (this.onExit) {
            // Custom onExit option
            return this.onExit(change);
        }

        // Default behavior: insert an exit block
        const range = change.value.selection;

        const exitBlock = Block.create({
            type: this.exitBlockType,
            nodes: [Text.create()]
        });

        change.deleteAtRange(range, { normalize: false });

        change.insertBlockAtRange(change.value.selection, exitBlock, {
            normalize: false
        });

        // Exit the code block
        change.unwrapNodeByKey(exitBlock.key);

        return change.collapseToStartOf(exitBlock);
    }
}

export default Options;
