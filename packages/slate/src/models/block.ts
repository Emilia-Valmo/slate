import { deprecate } from '@gitbook/slate-debug';
import { List, Map } from 'immutable';
import isPlainObject from 'is-plain-object';

import MODEL_TYPES, { isType } from '../constants/model-types';
import generateKey from '../utils/generate-key';
import { DataJSON } from './data';
import Inline, { InlineCreateProps, InlineJSON } from './inline';
import NodeFactory, {
    ChildNode,
    memoizeMethods,
    NodeDefaultProps
} from './node-factory';
import Text, { TextCreateProps } from './text';

interface BlockProperties {
    isVoid: boolean;
    type: string;
}

// JSON representation of a block node
export interface BlockJSON {
    object: 'block';
    key?: string;
    data: DataJSON;
    isVoid: boolean;
    nodes: Array<BlockJSON | InlineJSON>;
    type: string;
}

// Argument to create a block
export type BlockCreateProps =
    | string
    | Block
    | Partial<BlockProperties & NodeDefaultProps>;

/*
 * Model to represent a block node.
 */
class Block extends NodeFactory<BlockProperties>({
    isVoid: false,
    type: ''
}) {
    get object(): 'block' {
        return 'block';
    }

    /*
     * Check if the block is empty.
     * Returns true if block is not void and all it's children nodes are empty.
     * Void node is never empty, regardless of it's content.
     */
    get isEmpty(): boolean {
        return !this.isVoid && !this.nodes.some(child => !child.isEmpty);
    }

    /*
     * Get the concatenated text of all the block's children.
     */
    get text(): string {
        return this.getText();
    }

    /*
     * Check if `input` is a `Block`.
     */
    public static isBlock(input: any): input is Block {
        return isType('BLOCK', input);
    }

    /*
     * Create a new `Block` from `attrs`.
     */
    public static create(attrs: BlockCreateProps = {}): Block {
        if (Block.isBlock(attrs)) {
            return attrs;
        }

        if (typeof attrs === 'string') {
            attrs = { type: attrs };
        }

        if (isPlainObject(attrs)) {
            return Block.fromJS(attrs);
        }

        throw new Error(
            `\`Block.create\` only accepts objects, strings or blocks, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a list of `Blocks` from `attrs`.
     */
    public static createList(
        attrs: BlockCreateProps[] | List<BlockCreateProps> = []
    ): List<Block> {
        return List(attrs.map(Block.create));
    }

    /*
     * Create a set of children nodes for a block.
     */
    public static createChildren(
        elements:
            | Array<BlockCreateProps | InlineCreateProps | TextCreateProps>
            | List<BlockCreateProps | InlineCreateProps | TextCreateProps>
    ): List<Block | Inline | Text> | List<Block> {
        const items = elements.map(element => {
            if (element.object === 'block') {
                return Block.create(element);
            } else if (element.object === 'inline') {
                return Inline.create(element);
            } else {
                return Text.create(element);
            }
        });

        const shouldOnlyHaveBlocks = items.some(n => n.object === 'block');

        if (shouldOnlyHaveBlocks) {
            deprecate(
                '3.1.0',
                'Blocks should no longer contain blocks, use containers instead'
            );
        }

        return List(
            items.filter(n =>
                shouldOnlyHaveBlocks
                    ? n.object === 'block'
                    : n.object === 'inline' || n.object === 'text'
            )
        );
    }

    /*
     * Create a `Block` from a JSON `object`.
     */
    public static fromJS(input: BlockJSON | Block): Block {
        if (Block.isBlock(input)) {
            return input;
        }

        const {
            data = {},
            isVoid = false,
            key = generateKey(),
            nodes = [],
            type
        } = input;

        if (typeof type !== 'string') {
            throw new Error('`Block.fromJS` requires a `type` string.');
        }

        const block = new Block({
            key,
            type,
            isVoid: !!isVoid,
            data: Map(data),
            nodes: Block.createChildren(nodes)
        });

        return block;
    }

    /*
     * Check if `input` is a block list.
     */
    public static isBlockList(input: any): boolean {
        return List.isList(input) && input.every(item => Block.isBlock(item));
    }

    // Record properties
    public readonly isVoid: boolean;
    public readonly type: string;

    /*
     * Block can contain everything except documents.
     */
    public validateChild(child: ChildNode): boolean {
        if (this.nodes.size === 0) {
            return true;
        }

        const hasBlockChildren = this.nodes.some(n => n.object === 'block');

        return hasBlockChildren
            ? child.object === 'block'
            : child.object === 'inline' || child.object === 'text';
    }

    /*
     * Return a JSON representation of the block.
     */
    public toJS(
        options: {
            preserveKeys?: boolean;
        } = {}
    ): BlockJSON {
        const object = {
            object: this.object,
            type: this.type,
            isVoid: this.isVoid,
            data: this.data.toJS(),
            nodes: this.nodes.toArray().map(n => n.toJS(options))
        };

        if (options.preserveKeys) {
            object.key = this.key;
        }

        return object;
    }
}

/*
 * Attach a pseudo-symbol for type checking.
 */
Block.prototype[MODEL_TYPES.BLOCK] = true;

memoizeMethods(Block);

export default Block;
