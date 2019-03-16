import logger from '@gitbook/slate-dev-logger';
import { List, Map, Record } from 'immutable';
import isPlainObject from 'is-plain-object';

import MODEL_TYPES, { isType } from '../constants/model-types';
import generateKey from '../utils/generate-key';
import { DataJSON, DataMap } from './data';
import { TextJSON } from './text';

interface InlineProperties {
    data: DataMap;
    isVoid: boolean;
    key: string;
    type: string;
    nodes: List<Node>;
}

interface InlineJSON {
    key?: string;
    object: 'inline';
    type: string;
    isVoid: boolean;
    data: DataJSON;
    nodes: Array<InlineJSON | TextJSON>;
}

/*
 * Model for an inline node.
 */
class Inline extends Record<InlineProperties>({
    data: new Map(),
    isVoid: false,
    key: '',
    nodes: new List(),
    type: ''
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
     *
     * @param {Object|String|Inline} attrs
     * @return {Inline}
     */
    public static create(attrs = {}): Inline {
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
     *
     * @param {Array<Inline|Object>|List<Inline|Object>} elements
     * @return {List<Inline>}
     */

    public static createList(elements = []): List<Inline> {
        if (List.isList(elements) || Array.isArray(elements)) {
            const list = new List(elements.map(Inline.create));
            return list;
        }

        throw new Error(
            `\`Inline.createList\` only accepts arrays or lists, but you passed it: ${elements}`
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
}

/*
 * Attach a pseudo-symbol for type checking.
 */

Inline.prototype[MODEL_TYPES.INLINE] = true;

export default Inline;
