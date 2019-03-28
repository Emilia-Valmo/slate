import { List, Map } from 'immutable';
import isPlainObject from 'is-plain-object';

import MODEL_TYPES, { isType } from '../constants/model-types';
import generateKey from '../utils/generate-key';
import { DataJSON } from './data';
import Block, { BlockCreateProps, BlockJSON } from './inline';
import NodeFactory, {
    ChildNode,
    memoizeMethods,
    NodeDefaultProps
} from './node-factory';

interface ContainerProperties {
    isVoid: boolean;
    type: string;
}

// JSON representation of a container node
export interface ContainerJSON {
    object: 'container';
    key?: string;
    data: DataJSON;
    isVoid: boolean;
    nodes: Array<ContainerJSON | BlockJSON>;
    type: string;
}

// Argument to create a container
export type ContainerCreateProps =
    | string
    | Container
    | Partial<ContainerProperties & NodeDefaultProps>;

/*
 * Model to represent a container node.
 */
class Container extends NodeFactory<ContainerProperties>({
    type: ''
}) {
    get object(): 'container' {
        return 'container';
    }

    /*
     * Check if the container is empty.
     * Returns true if block is not void and all it's children nodes are empty.
     * Void node is never empty, regardless of it's content.
     */
    get isEmpty(): boolean {
        return !this.nodes.some(child => !child.isEmpty);
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
    public static isContainer(input: any): input is Container {
        return isType('CONTAINER', input);
    }

    /*
     * Create a new `Block` from `attrs`.
     */
    public static create(attrs: ContainerCreateProps = {}): Container {
        if (Container.isContainer(attrs)) {
            return attrs;
        }

        if (typeof attrs === 'string') {
            attrs = { type: attrs };
        }

        if (isPlainObject(attrs)) {
            return Container.fromJS(attrs);
        }

        throw new Error(
            `\`Container.create\` only accepts objects, strings or blocks, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a list of `Blocks` from `attrs`.
     */
    public static createList(
        attrs: ContainerCreateProps[] | List<ContainerCreateProps> = []
    ): List<Container> {
        return List(attrs.map(Block.create));
    }

    /*
     * Create a set of children nodes for a block.
     */
    public static createChildren(
        elements:
            | Array<BlockCreateProps | ContainerCreateProps>
            | List<BlockCreateProps | ContainerCreateProps>
    ): List<Block | Container> {
        return List(
            elements.map(element => {
                if (element.object === 'container') {
                    return Container.create(element);
                } else {
                    return Block.create(element);
                }
            })
        );
    }

    /*
     * Create a `Container` from a JSON `object`.
     */
    public static fromJS(input: ContainerJSON | Container): Container {
        if (Container.isContainer(input)) {
            return input;
        }

        const { data = {}, key = generateKey(), nodes = [], type } = input;

        if (typeof type !== 'string') {
            throw new Error('`Container.fromJS` requires a `type` string.');
        }

        const block = new Container({
            key,
            type,
            data: Map(data),
            nodes: Container.createChildren(nodes)
        });

        return block;
    }

    /*
     * Check if `input` is a block list.
     */
    public static isContainerList(input: any): boolean {
        return (
            List.isList(input) &&
            input.every(item => Container.isContainer(item))
        );
    }

    // Record properties
    public readonly type: string;

    /*
     * Validate that a child is valid in this node.
     */
    public validateChild(child: ChildNode): boolean {
        return child.object === 'container' || child.object === 'block';
    }

    /*
     * Return a JSON representation of the container.
     */
    public toJS(
        options: {
            preserveKeys?: boolean;
        } = {}
    ): ContainerJSON {
        const object = {
            object: this.object,
            type: this.type,
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
Container.prototype[MODEL_TYPES.CONTAINER] = true;

memoizeMethods(Container);

export default Container;
