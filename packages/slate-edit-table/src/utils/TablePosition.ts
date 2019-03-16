import { Block, Node } from '@gitbook/slate';
import { Record } from 'immutable';

import Options from '../options';

class TablePosition extends Record({
    tableBlock: null,
    rowBlock: null,
    cellBlock: null,
    contentBlock: null
}) {
    get table(): Block {
        if (!this.tableBlock) {
            throw new Error('Not in a table');
        }
        return this.tableBlock;
    }

    get row(): Block {
        if (!this.rowBlock) {
            throw new Error('Not in a row');
        }
        return this.rowBlock;
    }

    get cell(): Block {
        if (!this.cellBlock) {
            throw new Error('Not in a cell');
        }
        return this.cellBlock;
    }

    /*
     * Create a new instance of a TablePosition from a Slate document
     * and a node key.
     */

    public static create(
        opts: Options,
        containerNode: Node,
        key: string
    ): TablePosition {
        const node = containerNode.getDescendant(key);
        const ancestors = containerNode.getAncestors(key).push(node);
        const tableBlock = ancestors.findLast(p => p.type === opts.typeTable);
        const rowBlock = ancestors.findLast(p => p.type === opts.typeRow);

        const cellBlock = ancestors.findLast(p => p.type === opts.typeCell);
        const contentBlock = ancestors
            .skipUntil(ancestor => ancestor === cellBlock)
            .skip(1)
            .first();

        return new TablePosition({
            tableBlock,
            rowBlock,
            cellBlock,
            contentBlock
        });
    }
    // Block container for the table
    public tableBlock: Block | null;

    // Block for current row
    public rowBlock: Block | null;

    // Block for current cell
    public cellBlock: Block | null;

    // Current content block in the cell
    public contentBlock: Block | null;

    /*
     * Check to see if this position is within a cell
     */

    public isInCell(): boolean {
        return Boolean(this.cellBlock);
    }

    /*
     * Check to see if this position is within a row
     */

    public isInRow(): boolean {
        return Boolean(this.rowBlock);
    }

    /*
     * Check to see if this position is within a table
     */

    public isInTable(): boolean {
        return Boolean(this.tableBlock);
    }

    /*
     * Check to see if this position is at the top of the cell.
     */

    public isTopOfCell(): boolean {
        const { contentBlock, cellBlock } = this;

        if (!contentBlock || !cellBlock) {
            return false;
        }

        const { nodes } = cellBlock;
        const index = nodes.findIndex(block => block.key === contentBlock.key);

        return index === 0;
    }

    /*
     * Check to see if this position is at the bottom of the cell.
     */

    public isBottomOfCell(): boolean {
        const { contentBlock, cellBlock } = this;

        if (!contentBlock || !cellBlock) {
            return false;
        }

        const { nodes } = cellBlock;
        const index = nodes.findIndex(block => block.key === contentBlock.key);

        return index === nodes.size - 1;
    }

    /*
     * Get count of columns
     */

    public getWidth(): number {
        const { table } = this;
        const rows = table.nodes;
        const cells = rows.first().nodes;

        return cells.size;
    }

    /*
     * Get count of rows
     */

    public getHeight(): number {
        const { table } = this;
        const rows = table.nodes;

        return rows.size;
    }

    /*
     * Get index of current row in the table.
     */

    public getRowIndex(): number {
        const { table, row } = this;
        const rows = table.nodes;

        return rows.findIndex(x => x === row);
    }

    /*
     * Get index of current column in the row.
     */

    public getColumnIndex(): number {
        const { row, cell } = this;
        const cells = row.nodes;

        return cells.findIndex(x => x === cell);
    }

    /*
     * True if on first cell of the table
     */

    public isFirstCell(): boolean {
        return this.isFirstRow() && this.isFirstColumn();
    }

    /*
     * True if on last cell of the table
     */

    public isLastCell(): boolean {
        return this.isLastRow() && this.isLastColumn();
    }

    /*
     * True if on first row
     */

    public isFirstRow(): boolean {
        return this.getRowIndex() === 0;
    }

    /*
     * True if on last row
     */

    public isLastRow(): boolean {
        return this.getRowIndex() === this.getHeight() - 1;
    }

    /*
     * True if on first column
     */

    public isFirstColumn(): boolean {
        return this.getColumnIndex() === 0;
    }

    /*
     * True if on last column
     */

    public isLastColumn(): boolean {
        return this.getColumnIndex() === this.getWidth() - 1;
    }
}

export default TablePosition;
