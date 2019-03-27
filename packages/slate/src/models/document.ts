import { List, Map, Record } from 'immutable';
import isPlainObject from 'is-plain-object';

import MODEL_TYPES, { isType } from '../constants/model-types';
import generateKey from '../utils/generate-key';
import Block, { BlockJSON } from './block';
import { DataJSON } from './data';
import NodeFactory, {
    ChildNode,
    memoizeMethods,
    NodeDefaultProps
} from './node-factory';

// JSON representation of a document node
export interface DocumentJSON {
    key?: string;
    object: 'document';
    data: DataJSON;
    nodes: BlockJSON[];
}

// Argument to create an Inline
export type DocumentCreateProps = Document | Partial<NodeDefaultProps>;

/*
 * Main node in an editor value.
 */
class Document extends NodeFactory<{}>({}) {
    get object(): 'document' {
        return 'document';
    }

    /*
     * Check if the document is empty.
     * Returns true if all it's children nodes are empty.
     */
    get isEmpty(): boolean {
        return !this.nodes.some(child => !child.isEmpty);
    }

    /*
     * Get the concatenated text of all the document's children.
     */
    get text(): string {
        return this.getText();
    }

    /*
     * Create a set of children nodes for a document.

     * TODO: It should not allow text/inline, but only block as children.
     * But it's not easily feasible because of "slate-hyperscript"
     */
    public static createChildren = Block.createChildren;

    /*
     * Check if `input` is a `Document`.
     */
    public static isDocument(input: any): input is Document {
        return isType('DOCUMENT', input);
    }

    /*
     * Create a new `Document` with `attrs`.
     */
    public static create(attrs: DocumentCreateProps = {}): Document {
        if (Document.isDocument(attrs)) {
            return attrs;
        }

        if (List.isList(attrs) || Array.isArray(attrs)) {
            attrs = { nodes: attrs };
        }

        if (isPlainObject(attrs)) {
            return Document.fromJS(attrs);
        }

        throw new Error(
            `\`Document.create\` only accepts objects, arrays, lists or documents, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a `Document` from a JSON `object`.
     */
    public static fromJS(object: Partial<DocumentJSON>): Document {
        if (Document.isDocument(object)) {
            return object;
        }

        const { data = {}, key = generateKey(), nodes = [] } = object;

        return new Document({
            key,
            data: Map(data),
            nodes: Document.createChildren(nodes)
        });
    }

    /*
     * Return a JSON representation of the document.
     */
    public toJS(
        options: {
            preserveKeys?: boolean;
        } = {}
    ): DocumentJSON {
        const object = {
            object: this.object,
            data: this.data.toJS(),
            nodes: this.nodes.toArray().map(n => n.toJS(options))
        };

        if (options.preserveKeys) {
            object.key = this.key;
        }

        return object;
    }

    /*
     * Get a fragment of the node at a `range`.
     */
    public getFragmentAtRange(range: Range): Document {
        range = range.normalize(this);
        if (range.isUnset) {
            return Document.create();
        }

        let node = this;

        // Make sure the children exist.
        const { startKey, startOffset, endKey, endOffset } = range;
        const startText = node.assertDescendant(startKey);
        const endText = node.assertDescendant(endKey);

        // Split at the start and end.
        let child = startText;
        let previous;
        let parent;

        while (1) {
            parent = node.getParent(child.key);
            if (!parent) {
                break;
            }

            const index = parent.nodes.indexOf(child);
            const position =
                child.object === 'text'
                    ? startOffset
                    : child.nodes.indexOf(previous);

            parent = parent.splitNode(index, position);
            node = node.updateNode(parent);
            previous = parent.nodes.get(index + 1);
            child = parent;
        }

        child = startKey === endKey ? node.getNextText(startKey) : endText;

        while (1) {
            parent = node.getParent(child.key);
            if (!parent) {
                break;
            }
            const index = parent.nodes.indexOf(child);
            const position =
                child.object === 'text'
                    ? startKey === endKey
                        ? endOffset - startOffset
                        : endOffset
                    : child.nodes.indexOf(previous);

            parent = parent.splitNode(index, position);
            node = node.updateNode(parent);
            previous = parent.nodes.get(index + 1);
            child = parent;
        }

        // Get the start and end nodes.
        const startNode = node.getNextSibling(
            node.getFurthestAncestor(startKey).key
        );
        const endNode =
            startKey === endKey
                ? node.getNextSibling(
                      node.getNextSibling(node.getFurthestAncestor(endKey).key)
                          .key
                  )
                : node.getNextSibling(node.getFurthestAncestor(endKey).key);

        // Get children range of nodes from start to end nodes
        const startIndex = node.nodes.indexOf(startNode);
        const endIndex = node.nodes.indexOf(endNode);
        const nodes = node.nodes.slice(startIndex, endIndex);

        // Return a new document fragment.
        return Document.create({ nodes });
    }

    /*
     * Block can contain everything except documents.
     */
    public validateChild(child: ChildNode): boolean {
        return child.object === 'block';
    }
}

/*
 * Attach a pseudo-symbol for type checking.
 */

Document.prototype[MODEL_TYPES.DOCUMENT] = true;

memoizeMethods(Document);

export default Document;
