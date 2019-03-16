import { Node } from '@gitbook/slate';
import { Record } from 'immutable';

export interface OptionsFormat {
    typeTable?: string;
    typeRow?: string;
    typeCell?: string;
    typeContent?: string;
    exitBlockType?: string;
}

/*
 * The plugin options
 */

class Options extends Record({
    typeTable: 'table',
    typeRow: 'table_row',
    typeCell: 'table_cell',
    typeContent: 'paragraph',
    exitBlockType: 'paragraph'
}) {
    // The type of table blocks
    public typeTable: string;
    // The type of row blocks
    public typeRow: string;
    // The type of cell blocks
    public typeCell: string;
    // The default type for blocks in cells
    public typeContent: string;
    // The type of block inserted when exiting
    public exitBlockType: string;

    /*
     * Return a node filter to find a cell.
     */

    public isCell = (node: Node): boolean =>
        node.object === 'block' && node.type === this.typeCell;
}

export default Options;
