import { List, Map, Record } from 'immutable';
import isPlainObject from 'is-plain-object';

import MODEL_TYPES, { isType } from '../constants/model-types';
import generateKey from '../utils/generate-key';
import { DataJSON, DataMap } from './data';
import Node from './node';

interface BlockProperties {
    data: DataMap;
    isVoid: boolean;
    key: string;
    nodes: List<Node>;
    type: string;
}

type BlockPartialProps = Partial<BlockProperties>;

interface BlockJSON {
    key?: string;
    data: DataJSON;
    isVoid: boolean;
    nodes: BlockJSON[];
    type: string;
}

/*
 * Model to represent a block node.
 */
class Block
    extends Record<BlockProperties>({
        data: Map(),
        isVoid: false,
        key: '',
        nodes: new List(),
        type: ''
    })
    implements Node {
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
    public static create(
        attrs: string | Block | BlockPartialProps = {}
    ): Block {
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
        attrs:
            | Array<Block | BlockPartialProps | string>
            | List<Block | BlockPartialProps | string> = []
    ): List<Block> {
        if (List.isList(attrs) || Array.isArray(attrs)) {
            const list = new List(attrs.map(Block.create));
            return list;
        }

        throw new Error(
            `\`Block.createList\` only accepts arrays or lists, but you passed it: ${attrs}`
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

export default Block;
