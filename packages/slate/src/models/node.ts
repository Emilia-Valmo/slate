import { List} from 'immutable';
import isPlainObject from 'is-plain-object';

import { isType } from '../constants/model-types';
import Block, { BlockJSON } from './block';
import Document, { DocumentJSON } from './document';
import Inline, { InlineJSON } from './inline';
import Text, { TextJSON } from './text';

type NodeType = Block | Document | Inline | Text;
type NodeJSON = BlockJSON | DocumentJSON | InlineJSON | TextJSON

/*
 * Static interface to create nodes.
 */
const Node = {
    /*
     * Check if `any` is a `Node`.
     */
    isNode(input: any): input is NodeType {
        return !!['BLOCK', 'DOCUMENT', 'INLINE', 'TEXT'].find(type =>
            isType(type, input)
        );
    },

    /*
     * Check if `any` is a list of nodes.
     */
    isNodeList(input: any): input is List<NodeType> {
        return List.isList(input) && input.every(item => Node.isNode(item));
    },

    /*
     * Create a new `Node` with `attrs`.
     */
    create(attrs = {}): NodeType {
        if (Node.isNode(attrs)) {
            return attrs;
        }

        if (isPlainObject(attrs)) {
            switch (attrs.object) {
                case 'block':
                    return Block.create(attrs);
                case 'document':
                    return Document.create(attrs);
                case 'inline':
                    return Inline.create(attrs);
                case 'text':
                    return Text.create(attrs);

                default: {
                    throw new Error(
                        '`Node.create` requires a `object` string.'
                    );
                }
            }
        }

        throw new Error(
            `\`Node.create\` only accepts objects or nodes but you passed it: ${attrs}`
        );
    },

    /*
     * Create a list of `Nodes` from an array.
     */
    createList(elements = []): List<Block | Document | Inline | Text> {
        return List(elements.map(Node.create));
    },

    /*
     * Create a `Node` from a JSON `value`
     */

    fromJSON(value: NodeJSON): Block | Document | Inline | Text {
        switch (value.object) {
            case 'block':
                return Block.fromJS(value);
            case 'document':
                return Document.fromJS(value);
            case 'inline':
                return Inline.fromJS(value);
            case 'text':
                return Text.fromJS(value);

            default: {
                throw new Error(
                    `\`Node.fromJS\` requires an \`object\` of either 'block', 'document', 'inline' or 'text', but you passed: ${value}`
                );
            }
        }
    }
}

export default Node;