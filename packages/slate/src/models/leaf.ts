import logger from '@gitbook/slate-dev-logger';
import { List, Record, Set } from 'immutable';
import isPlainObject from 'is-plain-object';

import MODEL_TYPES, { isType } from '../constants/model-types';
import Mark, { MarkJSON } from './mark';

interface LeafProperties {
    marks: Set<Mark>;
    text: string;
}

// JSON representation of a leaf
export interface LeafJSON {
    object: 'leaf';
    text: string;
    marks: MarkJSON[];
}

// Type from what a mark can be created
type MaybeLeaf = Leaf | string | Partial<LeafJSON>;

/*
 * Leaf of text annotated with marks.
 */
class Leaf extends Record<LeafProperties>({
    marks: Set(),
    text: ''
}) {
    /*
     * Object.
     */

    get object(): 'leaf' {
        return 'leaf';
    }

    /*
     * Check if `input` is a `Leaf`.
     */
    public static isLeaf(input: any): input is Leaf {
        return isType('LEAF', input);
    }

    /*
     * Create a new `Leaf` with `attrs`.
     */
    public static create(attrs: MaybeLeaf = {}): Leaf {
        if (Leaf.isLeaf(attrs)) {
            return attrs;
        }

        if (typeof attrs === 'string') {
            attrs = { text: attrs };
        }

        if (isPlainObject(attrs)) {
            return Leaf.fromJS(attrs);
        }

        throw new Error(
            `\`Leaf.create\` only accepts objects, strings or leaves, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a valid List of `Leaf` from `leaves`.
     */
    public static createLeaves(leaves: List<Leaf>): List<Leaf> {
        if (leaves.size <= 1) {
            return leaves;
        }

        let invalid = false;

        // TODO: we can make this faster with [List] and then flatten
        const result = List().withMutations(cache => {
            // Search from the leaves left end to find invalid node;
            leaves.findLast((leaf, index) => {
                const firstLeaf = cache.first();

                // If the first leaf of cache exist, check whether the first leaf is connectable with the current leaf
                if (firstLeaf) {
                    // If marks equals, then the two leaves can be connected
                    if (firstLeaf.marks.equals(leaf.marks)) {
                        invalid = true;
                        cache.set(
                            0,
                            firstLeaf.set(
                                'text',
                                `${leaf.text}${firstLeaf.text}`
                            )
                        );
                        return;
                    }

                    // If the cached leaf is empty, drop the empty leaf with the upcoming leaf
                    if (firstLeaf.text === '') {
                        invalid = true;
                        cache.set(0, leaf);
                        return;
                    }

                    // If the current leaf is empty, drop the leaf
                    if (leaf.text === '') {
                        invalid = true;
                        return;
                    }
                }

                cache.unshift(leaf);
            });
        });

        if (!invalid) {
            return leaves;
        }
        return result;
    }

    /*
     * Split a list of leaves to two lists; if the leaves are valid leaves, the returned leaves are also valid
     * Corner Cases:
     *   1. if offset is smaller than 0, then return [List(), leaves]
     *   2. if offset is bigger than the text length, then return [leaves, List()]
     */
    public static splitLeaves(
        leaves: List<Leaf>,
        offset: number
    ): Array<List<Leaf>> {
        if (offset < 0) {
            return [List(), leaves];
        }

        if (leaves.size === 0) {
            return [List(), List()];
        }

        let endOffset = 0;
        let index = -1;
        let left;
        let right;

        leaves.find(leaf => {
            index++;
            const startOffset = endOffset;
            const { text } = leaf;
            endOffset += text.length;

            if (endOffset < offset) {
                return false;
            }
            if (startOffset > offset) {
                return false;
            }

            const length = offset - startOffset;
            left = leaf.set('text', text.slice(0, length));
            right = leaf.set('text', text.slice(length));
            return true;
        });

        if (!left) {
            return [leaves, List()];
        }

        if (left.text === '') {
            if (index === 0) {
                return [List.of(left), leaves];
            }

            return [leaves.take(index), leaves.skip(index)];
        }

        if (right.text === '') {
            if (index === leaves.size - 1) {
                return [leaves, List.of(right)];
            }

            return [leaves.take(index + 1), leaves.skip(index + 1)];
        }

        return [
            leaves.take(index).push(left),
            leaves.skip(index + 1).unshift(right)
        ];
    }

    /*
     * Create a `Leaf` list from `attrs`.
     */
    public static createList(
        attrs: List<MaybeLeaf> | MaybeLeaf[] = []
    ): List<Leaf> {
        if (List.isList(attrs) || Array.isArray(attrs)) {
            const list = new List(attrs.map(Leaf.create));
            return list;
        }

        throw new Error(
            `\`Leaf.createList\` only accepts arrays or lists, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a `Leaf` from a JSON `object`.
     */

    public static fromJS(object: Partial<LeafJSON>): Leaf {
        const { text = '', marks = [] } = object;

        return new Leaf({
            text,
            marks: Set(marks.map(Mark.fromJS))
        });
    }

    /*
     * Check if `input` is a list of leaves.
     */
    public static isLeafList(input: any): input is List<Leaf> {
        return List.isList(input) && input.every(item => Leaf.isLeaf(item));
    }

    /*
     * Update a `mark` at leaf, replace with newMark
     */
    public updateMark(mark: Mark, newMark: Mark): Leaf {
        const { marks } = this;
        if (newMark.equals(mark)) {
            return this;
        }
        if (!marks.has(mark)) {
            return this;
        }
        const newMarks = marks.withMutations(collection => {
            collection.remove(mark).add(newMark);
        });
        return this.set('marks', newMarks);
    }

    /*
     * Add a `set` of marks at `index` and `length`.
     */
    public addMarks(set: Set<Mark>): Text {
        const { marks } = this;
        return this.set('marks', marks.union(set));
    }

    /*
     * Remove a `mark` at `index` and `length`.
     */
    public removeMark(mark: Mark): Text {
        const { marks } = this;
        return this.set('marks', marks.remove(mark));
    }

    /*
     * Return a JSON representation of the leaf.
     */
    public toJS(): LeafJSON {
        return {
            object: this.object,
            text: this.text,
            marks: this.marks.toArray().map(m => m.toJS())
        };
    }
}

/*
 * Attach a pseudo-symbol for type checking.
 */

Leaf.prototype[MODEL_TYPES.LEAF] = true;

export default Leaf;
