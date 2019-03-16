import { List, OrderedSet, Record, Set } from 'immutable';
import memoize from 'immutablejs-record-memoize';
import isPlainObject from 'is-plain-object';

import MODEL_TYPES, { isType } from '../constants/model-types';
import generateKey from '../utils/generate-key';
import Leaf, { LeafJSON } from './leaf';
import Mark, { MarkProperties } from './mark';
import Schema, { SchemaNormalizeFn } from './schema';

interface TextProperties {
    key: string;
    leaves: List<Leaf>;
}

// JSON representation of a text node
export interface TextJSON {
    key?: string;
    object: 'text';
    leaves: Array<Partial<LeafJSON>>;
}

// Type of parameter to create a Text
export type TextCreateProps =
    | Text
    | Partial<TextJSON & Partial<LeafJSON>>
    | string;

/*
 * Model for a text node.
 */
class Text extends Record({
    leaves: List(),
    key: ''
}) {
    get object(): 'text' {
        return 'text';
    }

    /*
     * Is the node empty?
     */
    get isEmpty(): boolean {
        return this.text === '';
    }

    /*
     * Get the concatenated text of the node.
     */
    get text(): string {
        return this.getString();
    }

    /*
     * Check if `input` is a `Text`.
     */
    public static isText(input: any): input is Text {
        return isType('TEXT', input);
    }

    /*
     * Check if `input` is a list of texts.
     */
    public static isTextList(input: any): input is List<Text> {
        return List.isList(input) && input.every(item => Text.isText(item));
    }

    /*
     * Create a new `Text` with `attrs`.
     */
    public static create(attrs: TextCreateProps = ''): Text {
        if (Text.isText(attrs)) {
            return attrs;
        }

        if (typeof attrs === 'string') {
            attrs = { leaves: [{ text: attrs }] };
        }

        if (isPlainObject(attrs)) {
            if (attrs.text) {
                const { text, marks, key } = attrs;
                attrs = { key, leaves: [{ text, marks }] };
            }

            return Text.fromJS(attrs);
        }

        throw new Error(
            `\`Text.create\` only accepts objects, arrays, strings or texts, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a list of `Texts` from `elements`.
     */
    public static createList(
        elements: List<MaybeText> | MaybeText[] = []
    ): List<Text> {
        if (List.isList(elements) || Array.isArray(elements)) {
            const list = List(
                elements.map((element: MaybeText) => Text.create(element))
            );
            return list;
        }

        throw new Error(
            `\`Text.createList\` only accepts arrays or lists, but you passed it: ${elements}`
        );
    }

    /*
     * Create a `Text` from a JSON `object`.
     */
    public static fromJS(object: Partial<TextJSON>): Text {
        if (Text.isText(object)) {
            return object;
        }

        const { key = generateKey() } = object;
        let { leaves = List() } = object;

        if (Array.isArray(leaves)) {
            leaves = List(leaves.map(x => Leaf.create(x)));
        } else if (List.isList(leaves)) {
            leaves = leaves.map(x => Leaf.create(x));
        } else {
            throw new Error('leaves must be either Array or Immutable.List');
        }

        return new Text({
            leaves: Leaf.createLeaves(leaves),
            key
        });
    }

    public isText(): this is Text {
        return true;
    }

    /*
     * Get the concatenated text of the node, cached for text getter
     */
    public getString(): string {
        return this.leaves.reduce((content, leaf) => content + leaf.text, '');
    }

    /*
     * Find the 'first' leaf at offset; By 'first' the alorighthm prefers `endOffset === offset` than `startOffset === offset`
     * Corner Cases:
     *   1. if offset is negative, return the first leaf;
     *   2. if offset is larger than text length, the leaf is null, startOffset, endOffset and index is of the last leaf
     */
    public searchLeafAtOffset(
        offset: number
    ): {
        startOffset: number;
        endOffset: number;
        index: number;
        leaf: Leaf;
    } {
        let endOffset = 0;
        let startOffset = 0;
        let index = -1;

        const leaf = this.leaves.find(l => {
            index++;
            startOffset = endOffset;
            endOffset = startOffset + l.text.length;
            return endOffset >= offset;
        });

        return {
            leaf,
            endOffset,
            index,
            startOffset
        };
    }

    /*
     * Add a `mark` at `index` and `length`.
     */
    public addMark(index: number, length: number, mark: Mark): Text {
        const marks = Set.of(mark);
        return this.addMarks(index, length, marks);
    }

    /*
     * Add a `set` of marks at `index` and `length`.
     * Corner Cases:
     *   1. If empty text, and if length === 0 and index === 0, will make sure the text contain an empty leaf with the given mark.
     */
    public addMarks(index: number, length: number, set: Set<Mark>): Text {
        if (this.text === '' && length === 0 && index === 0) {
            const { leaves } = this;
            const first = leaves.first();

            if (!first) {
                return this.set(
                    'leaves',
                    List.of(Leaf.fromJS({ text: '', marks: set }))
                );
            }

            const newFirst = first.addMarks(set);
            if (newFirst === first) {
                return this;
            }
            return this.set('leaves', List.of(newFirst));
        }

        if (this.text === '') {
            return this;
        }
        if (length === 0) {
            return this;
        }
        if (index >= this.text.length) {
            return this;
        }

        const [before, bundle] = Leaf.splitLeaves(this.leaves, index);
        const [middle, after] = Leaf.splitLeaves(bundle, length);
        return this.setLeaves(
            before.concat(middle.map(x => x.addMarks(set)), after)
        );
    }

    /*
     * Get the decorations for the node from a `schema`.
     *
     * @param {Schema} schema
     * @return {Array}
     */

    public getDecorations(schema) {
        return schema.__getDecorations(this);
    }

    /*
     * Derive the leaves for a list of `decorations`.
     */

    public getLeaves(decorations: Range[] | null = []): List<Leaf> {
        let { leaves } = this;
        if (leaves.size === 0) {
            return List.of(Leaf.create({}));
        }
        if (!decorations || decorations.length === 0) {
            return leaves;
        }
        if (this.text.length === 0) {
            return leaves;
        }
        const { key } = this;

        decorations.forEach(range => {
            const { startKey, endKey, startOffset, endOffset, marks } = range;
            const hasStart = startKey === key;
            const hasEnd = endKey === key;

            if (hasStart && hasEnd) {
                const index = hasStart ? startOffset : 0;
                const length = hasEnd
                    ? endOffset - index
                    : this.text.length - index;

                if (length < 1) {
                    return;
                }
                if (index >= this.text.length) {
                    return;
                }

                if (index !== 0 || length < this.text.length) {
                    const [before, bundle] = Leaf.splitLeaves(leaves, index);
                    const [middle, after] = Leaf.splitLeaves(bundle, length);
                    leaves = before.concat(
                        middle.map(x => x.addMarks(marks)),
                        after
                    );
                    return;
                }
            }

            leaves = leaves.map(x => x.addMarks(marks));
        });

        if (leaves === this.leaves) {
            return leaves;
        }
        return Leaf.createLeaves(leaves);
    }

    /*
     * Get all of the active marks on between two offsets
     * Corner Cases:
     *   1. if startOffset is equal or bigger than endOffset, then return Set();
     *   2. If no text is selected between start and end, then return Set()
     */
    public getActiveMarksBetweenOffsets(
        startOffset: number,
        endOffset: number
    ): Set<Mark> {
        if (startOffset <= 0 && endOffset >= this.text.length) {
            return this.getActiveMarks();
        }

        if (startOffset >= endOffset) {
            return Set();
        }
        // For empty text in a paragraph, use getActiveMarks;
        if (this.text === '') {
            return this.getActiveMarks();
        }

        let result = null;
        let leafEnd = 0;

        this.leaves.forEach(leaf => {
            const leafStart = leafEnd;
            leafEnd = leafStart + leaf.text.length;

            if (leafEnd <= startOffset) {
                return;
            }
            if (leafStart >= endOffset) {
                return false;
            }

            if (!result) {
                result = leaf.marks;
                return;
            }

            result = result.intersect(leaf.marks);
            if (result && result.size === 0) {
                return false;
            }
            return false;
        });

        return result || Set();
    }

    /*
     * Get all of the active marks on the text.
     */
    public getActiveMarks(): Set<Mark> {
        if (this.leaves.size === 0) {
            return Set();
        }

        const result = this.leaves.first().marks;
        if (result.size === 0) {
            return result;
        }

        return result.withMutations(x => {
            this.leaves.forEach(c => {
                x.intersect(c.marks);
                if (x.size === 0) {
                    return false;
                }
            });
        });
    }

    /*
     * Get all of the marks on between two offsets
     * Corner Cases:
     *   1. if startOffset is equal or bigger than endOffset, then return Set();
     *   2. If no text is selected between start and end, then return Set()
     */
    public getMarksBetweenOffsets(
        startOffset: number,
        endOffset: number
    ): Set<Mark> {
        if (startOffset <= 0 && endOffset >= this.text.length) {
            return this.getMarks();
        }

        if (startOffset >= endOffset) {
            return Set();
        }
        // For empty text in a paragraph, use getActiveMarks;
        if (this.text === '') {
            return this.getActiveMarks();
        }

        let result = null;
        let leafEnd = 0;

        this.leaves.forEach(leaf => {
            const leafStart = leafEnd;
            leafEnd = leafStart + leaf.text.length;

            if (leafEnd <= startOffset) {
                return;
            }
            if (leafStart >= endOffset) {
                return false;
            }

            if (!result) {
                result = leaf.marks;
                return;
            }

            result = result.union(leaf.marks);
        });

        return result || Set();
    }

    /*
     * Get all of the marks on the text.
     */
    public getMarks(): OrderedSet<Mark> {
        const array = this.getMarksAsArray();
        return new OrderedSet(array);
    }

    /*
     * Get all of the marks on the text as an array.
     */
    public getMarksAsArray(): Mark[] {
        if (this.leaves.size === 0) {
            return [];
        }
        const first = this.leaves.first().marks;
        if (this.leaves.size === 1) {
            return first.toArray();
        }

        const result = [];

        this.leaves.forEach(leaf => {
            result.push(leaf.marks.toArray());
        });

        return Array.prototype.concat.apply(first.toArray(), result);
    }

    /*
     * Get the marks on the text at `index`.
     * Corner Cases:
     *   1. if no text is before the index, and index !== 0, then return Set()
     *   2. (for insert after split node or mark at range) if index === 0, and text === '', then return the leaf.marks
     *   3. if index === 0, text !== '', return Set()
     */
    public getMarksAtIndex(index: number): Set<Mark> {
        const { leaf } = this.searchLeafAtOffset(index);
        if (!leaf) {
            return Set();
        }
        return leaf.marks;
    }

    /*
     * Get a node by `key`, to parallel other nodes.
     */
    public getNode(key: string): Mark | null {
        return this.key === key ? this : null;
    }

    /*
     * Check if the node has a node by `key`, to parallel other nodes.
     */
    public hasNode(key: string): boolean {
        return !!this.getNode(key);
    }

    /*
     * Insert `text` at `index`.
     */
    public insertText(offset: number, text: string, marks?: Set<Mark>): Text {
        if (this.text === '') {
            return this.set('leaves', List.of(Leaf.create({ text, marks })));
        }

        if (text.length === 0) {
            return this;
        }
        if (!marks) {
            marks = Set();
        }

        const { startOffset, leaf, index } = this.searchLeafAtOffset(offset);
        const delta = offset - startOffset;
        const beforeText = leaf.text.slice(0, delta);
        const afterText = leaf.text.slice(delta);
        const { leaves } = this;

        if (leaf.marks.equals(marks)) {
            return this.set(
                'leaves',
                leaves.set(
                    index,
                    leaf.set('text', beforeText + text + afterText)
                )
            );
        }

        const nextLeaves = leaves.splice(
            index,
            1,
            leaf.set('text', beforeText),
            Leaf.create({ text, marks }),
            leaf.set('text', afterText)
        );

        return this.setLeaves(nextLeaves);
    }

    /*
     * Regenerate the node's key.
     */
    public regenerateKey(): Text {
        const key = generateKey();
        return this.merge({ key });
    }

    /*
     * Remove a `mark` at `index` and `length`.
     */
    public removeMark(index: number, length: number, mark: Mark): Text {
        if (this.text === '' && index === 0 && length === 0) {
            const first = this.leaves.first();
            if (!first) {
                return this;
            }
            const newFirst = first.removeMark(mark);
            if (newFirst === first) {
                return this;
            }
            return this.set('leaves', List.of(newFirst));
        }

        if (length <= 0) {
            return this;
        }
        if (index >= this.text.length) {
            return this;
        }
        const [before, bundle] = Leaf.splitLeaves(this.leaves, index);
        const [middle, after] = Leaf.splitLeaves(bundle, length);
        const leaves = before.concat(
            middle.map(x => x.removeMark(mark)),
            after
        );
        return this.setLeaves(leaves);
    }

    /*
     * Remove text from the text node at `start` for `length`.
     */
    public removeText(start: number, length: number): Text {
        if (length <= 0) {
            return this;
        }
        if (start >= this.text.length) {
            return this;
        }

        // PERF: For simple backspace, we can operate directly on the leaf
        if (length === 1) {
            const { leaf, index, startOffset } = this.searchLeafAtOffset(
                start + 1
            );
            const offset = start - startOffset;

            if (leaf) {
                if (leaf.text.length === 1) {
                    return this.setLeaves(this.leaves.remove(index));
                }

                const beforeText = leaf.text.slice(0, offset);
                const afterText = leaf.text.slice(offset + length);
                const text = beforeText + afterText;

                if (text.length > 0) {
                    return this.set(
                        'leaves',
                        this.leaves.set(index, leaf.set('text', text))
                    );
                }
            }
        }

        const [before, bundle] = Leaf.splitLeaves(this.leaves, start);
        const after = Leaf.splitLeaves(bundle, length)[1];
        const leaves = Leaf.createLeaves(before.concat(after));

        if (leaves.size === 1) {
            const first = leaves.first();

            if (first.text === '') {
                return this.set(
                    'leaves',
                    List.of(first.set('marks', this.getActiveMarks()))
                );
            }
        }

        return this.merge({ leaves });
    }

    /*
     * Return a JSON representation of the text.
     */
    public toJS(
        options: {
            preserveKeys?: boolean;
        } = {}
    ): TextJSON {
        const object = {
            object: this.object,
            leaves: this.getLeaves()
                .toArray()
                .map(r => r.toJS())
        };

        if (options.preserveKeys) {
            object.key = this.key;
        }

        return object;
    }

    /*
     * Update a `mark` at `index` and `length` with `properties`.
     */
    public updateMark(
        index: number,
        length: number,
        mark: Mark,
        properties: Partial<MarkProperties>
    ): Text {
        const newMark = mark.merge(properties);

        if (this.text === '' && length === 0 && index === 0) {
            const first = this.leaves.first();
            if (!first) {
                return this;
            }
            const newFirst = first.updateMark(mark, newMark);
            if (newFirst === first) {
                return this;
            }
            return this.set('leaves', List.of(newFirst));
        }

        if (length <= 0) {
            return this;
        }
        if (index >= this.text.length) {
            return this;
        }

        const [before, bundle] = Leaf.splitLeaves(this.leaves, index);
        const [middle, after] = Leaf.splitLeaves(bundle, length);

        const leaves = before.concat(
            middle.map(x => x.updateMark(mark, newMark)),
            after
        );

        return this.setLeaves(leaves);
    }

    /*
     * Split this text and return two different texts
     */
    public splitText(offset: number): [Text, Text] {
        const splitted = Leaf.splitLeaves(this.leaves, offset);
        const one = this.set('leaves', splitted[0]);
        const two = this.set('leaves', splitted[1]).regenerateKey();
        return [one, two];
    }

    /*
     * merge this text and another text at the end
     */
    public mergeText(text: Text): Text {
        const leaves = this.leaves.concat(text.leaves);
        return this.setLeaves(leaves);
    }

    /*
     * Validate the text node against a `schema`.
     */

    public validate(schema: Schema): SchemaNormalizeFn | null {
        return schema.validateNode(this);
    }

    /*
     * Get the first invalid descendant
     * PERF: Do not cache this method; because it can cause cycle reference
     */

    public getFirstInvalidDescendant(schema: Schema): Text | null {
        return this.validate(schema) ? this : null;
    }

    /*
     * Set leaves with normalized `leaves`.
     */
    public setLeaves(leaves: List<Leaf>): Text {
        const result = Leaf.createLeaves(leaves);

        if (result.size === 1) {
            const first = result.first();

            if (!first.marks || first.marks.size === 0) {
                if (first.text === '') {
                    return this.set('leaves', List());
                }
            }
        }

        return this.set('leaves', Leaf.createLeaves(leaves));
    }
}

/*
 * Attach a pseudo-symbol for type checking.
 */

Text.prototype[MODEL_TYPES.TEXT] = true;

/*
 * Memoize read methods.
 */

memoize(Text.prototype, [
    'getDecorations',
    'getActiveMarks',
    'getMarks',
    'getMarksAsArray',
    'validate',
    'getString'
]);

export default Text;
