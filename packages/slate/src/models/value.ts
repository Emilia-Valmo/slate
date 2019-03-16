import { List, Map, Record, Set } from 'immutable';
import isPlainObject from 'is-plain-object';

import MODEL_TYPES from '../constants/model-types';
import CORE_SCHEMA from '../constants/core-schema';
import Block from './block';
import Change from './change';
import Data from './data';
import Document from './document';
import History from './history';
import Inline from './inline';
import Range from './range';
import Schema from './schema';
import Text from './text';

/*
 * Immutable state representing the value of the editor.
 */
class Value extends Record({
    data: new Map(),
    decorations: null,
    document: Document.create(),
    history: History.create(),
    schema: Schema.create(),
    selection: Range.create()
}) {
    /*
     * Object.
     */

    get object(): 'value' {
        return 'value';
    }

    /*
     * Are there undoable events?
     */

    get hasUndos(): boolean {
        return this.history.undos.size > 0;
    }

    /*
     * Are there redoable events?
     */

    get hasRedos(): boolean {
        return this.history.redos.size > 0;
    }

    /*
     * Is the current selection blurred?
     */

    get isBlurred(): boolean {
        return this.selection.isBlurred;
    }

    /*
     * Is the current selection focused?
     */
    get isFocused(): boolean {
        return this.selection.isFocused;
    }

    /*
     * Is the current selection collapsed?
     */
    get isCollapsed(): boolean {
        return this.selection.isCollapsed;
    }

    /*
     * Is the current selection expanded?
     */

    get isExpanded(): boolean {
        return this.selection.isExpanded;
    }

    /*
     * Is the current selection backward?
     */
    get isBackward(): boolean {
        return this.selection.isBackward;
    }

    /*
     * Is the current selection forward?
     */
    get isForward(): boolean {
        return this.selection.isForward;
    }

    /*
     * Get the current start key.
     */
    get startKey(): string {
        return this.selection.startKey;
    }

    /*
     * Get the current end key.
     */
    get endKey(): string {
        return this.selection.endKey;
    }

    /*
     * Get the current start offset.
     */
    get startOffset(): number {
        return this.selection.startOffset;
    }

    /*
     * Get the current end offset.
     */
    get endOffset(): number {
        return this.selection.endOffset;
    }

    /*
     * Get the current anchor key.
     */
    get anchorKey(): string {
        return this.selection.anchorKey;
    }

    /*
     * Get the current focus key.
     */
    get focusKey(): string {
        return this.selection.focusKey;
    }

    /*
     * Get the current anchor offset.
     */
    get anchorOffset(): number {
        return this.selection.anchorOffset;
    }

    /*
     * Get the current focus offset.
     */
    get focusOffset(): number {
        return this.selection.focusOffset;
    }

    /*
     * Get the current start text node's closest block parent.
     */
    get startBlock(): Block | null {
        return this.startKey && this.document.getClosestBlock(this.startKey);
    }

    /*
     * Get the current end text node's closest block parent.
     */
    get endBlock(): Block | null {
        return this.endKey && this.document.getClosestBlock(this.endKey);
    }

    /*
     * Get the current anchor text node's closest block parent.
     */
    get anchorBlock(): Block | null {
        return this.anchorKey && this.document.getClosestBlock(this.anchorKey);
    }

    /*
     * Get the current focus text node's closest block parent.
     */
    get focusBlock(): Block | null {
        return this.focusKey && this.document.getClosestBlock(this.focusKey);
    }

    /*
     * Get the current start text node's closest inline parent.
     */
    get startInline(): Inline | null {
        return this.startKey && this.document.getClosestInline(this.startKey);
    }

    /*
     * Get the current end text node's closest inline parent.
     */
    get endInline(): Inline | null {
        return this.endKey && this.document.getClosestInline(this.endKey);
    }

    /*
     * Get the current anchor text node's closest inline parent.
     */

    get anchorInline(): Inline | null {
        return this.anchorKey && this.document.getClosestInline(this.anchorKey);
    }

    /*
     * Get the current focus text node's closest inline parent.
     */
    get focusInline(): Inline | null {
        return this.focusKey && this.document.getClosestInline(this.focusKey);
    }

    /*
     * Get the current start text node.
     */
    get startText(): Text | null {
        return this.startKey && this.document.getDescendant(this.startKey);
    }

    /*
     * Get the current end node.
     */
    get endText(): Text | null {
        return this.endKey && this.document.getDescendant(this.endKey);
    }

    /*
     * Get the current anchor node.
     */
    get anchorText(): Text | null {
        return this.anchorKey && this.document.getDescendant(this.anchorKey);
    }

    /*
     * Get the current focus node.
     */
    get focusText(): Text | null {
        return this.focusKey && this.document.getDescendant(this.focusKey);
    }

    /*
     * Get the next block node.
     */
    get nextBlock(): Text | null {
        return this.endKey && this.document.getNextBlock(this.endKey);
    }

    /*
     * Get the previous block node.
     */
    get previousBlock(): Text | null {
        return this.startKey && this.document.getPreviousBlock(this.startKey);
    }

    /*
     * Get the next inline node.
     */
    get nextInline(): Inline | null {
        return this.endKey && this.document.getNextInline(this.endKey);
    }

    /*
     * Get the previous inline node.
     */
    get previousInline(): Inline | null {
        return this.startKey && this.document.getPreviousInline(this.startKey);
    }

    /*
     * Get the next text node.
     */

    get nextText(): Text | null {
        return this.endKey && this.document.getNextText(this.endKey);
    }

    /*
     * Get the previous text node.
     */
    get previousText(): Text | null {
        return this.startKey && this.document.getPreviousText(this.startKey);
    }

    /*
     * Get the marks of the current selection.
     */
    get marks(): Set<Mark> {
        return this.selection.isUnset
            ? new Set()
            : this.selection.marks ||
                  this.document.getMarksAtRange(this.selection);
    }

    /*
     * Get the active marks of the current selection.
     */
    get activeMarks(): Set<Mark> {
        return this.selection.isUnset
            ? new Set()
            : this.selection.marks ||
                  this.document.getActiveMarksAtRange(this.selection);
    }

    /*
     * Get the block nodes in the current selection.
     */
    get blocks(): List<Block> {
        return this.selection.isUnset
            ? new List()
            : this.document.getBlocksAtRange(this.selection);
    }

    /*
     * Get the fragment of the current selection.
     */
    get fragment(): Document {
        return this.selection.isUnset
            ? Document.create()
            : this.document.getFragmentAtRange(this.selection);
    }

    /*
     * Get the inline nodes in the current selection.
     */
    get inlines(): List<Inline> {
        return this.selection.isUnset
            ? new List()
            : this.document.getInlinesAtRange(this.selection);
    }

    /*
     * Get the text nodes in the current selection.
     */
    get texts(): List<Text> {
        return this.selection.isUnset
            ? new List()
            : this.document.getTextsAtRange(this.selection);
    }

    /*
     * Check whether the selection is empty.
     */
    get isEmpty(): boolean {
        if (this.isCollapsed) {
            return true;
        }
        if (this.endOffset !== 0 && this.startOffset !== 0) {
            return false;
        }
        return this.fragment.isEmpty;
    }

    /*
     * Check whether the selection is collapsed in a void node.
     */
    get isInVoid(): boolean {
        if (this.isExpanded) {
            return false;
        }
        return this.document.hasVoidParent(this.startKey);
    }

    /*
     * Create a new `Value` with `attrs`.
     */
    public static create(attrs = {}, options = {}): Value {
        if (Value.isValue(attrs)) {
            return attrs;
        }

        if (isPlainObject(attrs)) {
            return Value.fromJS(attrs, options);
        }

        throw new Error(
            `\`Value.create\` only accepts objects or values, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a dictionary of settable value properties from `attrs`.
     *
     * @param {Object|Value} attrs
     * @return {Object}
     */

    public static createProperties(attrs = {}) {
        if (Value.isValue(attrs)) {
            return {
                data: attrs.data,
                decorations: attrs.decorations,
                schema: attrs.schema
            };
        }

        if (isPlainObject(attrs)) {
            const props = {};
            if ('data' in attrs) {
                props.data = Data.create(attrs.data);
            }
            if ('decorations' in attrs) {
                props.decorations = Range.createList(attrs.decorations);
            }
            if ('schema' in attrs) {
                props.schema = CORE_SCHEMA.combineWith(Schema.create(attrs.schema));
            }
            return props;
        }

        throw new Error(
            `\`Value.createProperties\` only accepts objects or values, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a `Value` from a JSON `object`.
     *
     * @param {Object} object
     * @param {Object} options
     *   @property {Boolean} normalize
     *   @property {Array} plugins
     * @return {Value}
     */

    public static fromJS(object, options = {}): Value {
        let {
            document = {},
            selection = {},
            schema = {},
            history = {}
        } = object;

        let data = new Map();

        document = Document.fromJS(document);

        // rebuild selection from anchorPath and focusPath if keys were dropped
        const { anchorPath, focusPath, anchorKey, focusKey } = selection;

        if (anchorPath !== undefined && anchorKey === undefined) {
            selection.anchorKey = document.assertPath(anchorPath).key;
        }

        if (focusPath !== undefined && focusKey === undefined) {
            selection.focusKey = document.assertPath(focusPath).key;
        }

        selection = Range.fromJS(selection);
        schema = Schema.create(schema);
        history = History.fromJS(history);

        // Then merge in the `data` provided.
        if ('data' in object) {
            data = data.merge(object.data);
        }

        if (selection.isUnset) {
            const text = document.getFirstText();
            if (text) {
                selection = selection.collapseToStartOf(text);
            }
        }

        let value = new Value({
            data,
            document,
            selection,
            // Combine the core schema with the custom one
            schema: CORE_SCHEMA.combineWith(schema),
            history
        });

        if (options.normalize !== false) {
            value = value.change({ save: false }).normalize().value;
        }

        return value;
    }

    /*
     * Check if a `value` is a `Value`.
     */
    public static isValue(value: any): value is Value {
        return !!(value && value[MODEL_TYPES.VALUE]);
    }

    // Record properties
    public readonly data: Map;
    public readonly schema: Schema;
    public readonly selection: Range;
    public readonly history: History;
    public readonly document: Document;

    /*
     * Create a new `Change` with the current value as a starting point.
     */
    public change(attrs = {}): Change {
        return new Change({ ...attrs, value: this });
    }

    /*
     * Set the schema for this value.
     */
    public setSchema(schema: Schema | Schema[]): Value {
        return this.merge({
            schema: CORE_SCHEMA.combineWith(schema)
        });
    }

    /*
     * Return a JSON representation of the value.
     *
     * @param {Object} options
     * @return {Object}
     */

    public toJS(options = {}) {
        const object = {
            object: this.object,
            document: this.document.toJS(options)
        };

        if (options.preserveData) {
            object.data = this.data.toJS();
        }

        if (options.preserveDecorations) {
            object.decorations = this.decorations
                ? this.decorations.toArray().map(d => d.toJS())
                : null;
        }

        if (options.preserveHistory) {
            object.history = this.history.toJS();
        }

        if (options.preserveSelection) {
            object.selection = this.selection.toJS();
        }

        if (options.preserveSchema) {
            object.schema = this.schema.toJS();
        }

        if (options.preserveSelection && !options.preserveKeys) {
            const { document, selection } = this;

            object.selection.anchorPath = selection.isSet
                ? document.getPath(selection.anchorKey)
                : null;

            object.selection.focusPath = selection.isSet
                ? document.getPath(selection.focusKey)
                : null;

            delete object.selection.anchorKey;
            delete object.selection.focusKey;
        }

        if (
            options.preserveDecorations &&
            object.decorations &&
            !options.preserveKeys
        ) {
            const { document } = this;

            object.decorations = object.decorations.map(decoration => {
                const withPath = {
                    ...decoration,
                    anchorPath: document.getPath(decoration.anchorKey),
                    focusPath: document.getPath(decoration.focusKey)
                };
                delete withPath.anchorKey;
                delete withPath.focusKey;
                return withPath;
            });
        }

        return object;
    }
}

/*
 * Attach a pseudo-symbol for type checking.
 */

Value.prototype[MODEL_TYPES.VALUE] = true;

export default Value;
