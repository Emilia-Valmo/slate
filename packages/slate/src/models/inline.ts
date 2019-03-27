import { List, Map, Record } from 'immutable';
import isPlainObject from 'is-plain-object';

import MODEL_TYPES, { isType } from '../constants/model-types';
import generateKey from '../utils/generate-key';
import { DataJSON } from './data';
import NodeFactory, {
    ChildNode,
    memoizeMethods,
    NodeDefaultProps
} from './node-factory';
import Text, { TextCreateProps, TextJSON } from './text';

interface InlineProperties {
    isVoid: boolean;
    type: string;
}

// JSON representation of an inline node
export interface InlineJSON {
    object: 'inline';
    key?: string;
    type: string;
    isVoid: boolean;
    data: DataJSON;
    nodes: Array<InlineJSON | TextJSON>;
}

// Argument to create an Inline
export type InlineCreateProps =
    | string
    | Inline
    | Partial<InlineProperties & NodeDefaultProps>;

/*
 * Model for an inline node.
 */
class Inline extends NodeFactory<InlineProperties>({
    type: '',
    isVoid: false
}) {
    /*
     * Object.
     */

    get object(): 'inline' {
        return 'inline';
    }

    /*
     * Check if the inline is empty.
     * Returns true if inline is not void and all it's children nodes are empty.
     * Void node is never empty, regardless of it's content.
     */
    get isEmpty(): boolean {
        return !this.isVoid && !this.nodes.some(child => !child.isEmpty);
    }

    /*
     * Get the concatenated text of all the inline's children.
     */

    get text(): string {
        return this.getText();
    }

    /*
     * Check if `input` is a `Inline`.
     */
    public static isInline(input: any): input is Inline {
        return isType('INLINE', input);
    }

    /*
     * Check if `any` is a list of inlines.
     */
    public static isInlineList(input: any): input is List<Inline> {
        return List.isList(input) && input.every(item => Inline.isInline(item));
    }

    /*
     * Create a new `Inline` with `attrs`.
     */
    public static create(attrs: InlineCreateProps = {}): Inline {
        if (Inline.isInline(attrs)) {
            return attrs;
        }

        if (typeof attrs === 'string') {
            attrs = { type: attrs };
        }

        if (isPlainObject(attrs)) {
            return Inline.fromJS(attrs);
        }

        throw new Error(
            `\`Inline.create\` only accepts objects, strings or inlines, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a list of `Inlines` from an array.
     */
    public static createList(
        elements: InlineCreateProps[] | List<InlineCreateProps> = []
    ): List<Inline> {
        return List(elements.map(Inline.create));
    }

    /*
     * Create a set of children nodes for a block.
     */
    public static createChildren(
        elements:
            | Array<TextCreateProps | InlineCreateProps>
            | List<TextCreateProps | InlineCreateProps>
    ): List<Text | Inline> {
        return List(
            elements.map(element => {
                if (Inline.isInline(element)) {
                    return element;
                }
                if (Text.isText(element)) {
                    return element;
                }

                if (element.object === 'inline') {
                    return Inline.create(element);
                } else {
                    return Text.create(element);
                }
            })
        );
    }

    /*
     * Create a `Inline` from a JSON `object`.
     */
    public static fromJS(object: Partial<InlineJSON>): Inline {
        if (Inline.isInline(object)) {
            return object;
        }

        const {
            data = {},
            isVoid = false,
            key = generateKey(),
            nodes = [],
            type
        } = object;

        if (typeof type !== 'string') {
            throw new Error('`Inline.fromJS` requires a `type` string.');
        }

        return new Inline({
            key,
            type,
            isVoid: !!isVoid,
            data: new Map(data),
            nodes: Inline.createChildren(nodes)
        });
    }
    // Record properties
    public readonly type: string;
    public readonly isVoid: boolean;

    /*
     * Return a JSON representation of the inline.
     */
    public toJS(
        options: {
            preserveKeys?: boolean;
        } = {}
    ): InlineJSON {
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

    /*
     * Validate that a child is valid in this node.
     */
    public validateChild(child: ChildNode): boolean {
        return child.object === 'text' || child.object === 'inline';
    }
}

/*
 * Attach a pseudo-symbol for type checking.
 */

Inline.prototype[MODEL_TYPES.INLINE] = true;

memoizeMethods(Inline);

export default Inline;
