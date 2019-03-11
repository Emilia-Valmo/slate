import logger from '@gitbook/slate-dev-logger';
import { List, Record, Set } from 'immutable';
import isPlainObject from 'is-plain-object';

import MODEL_TYPES, { isType } from '../constants/model-types';
import Character from './character';
import Mark from './mark';

/*
 * Default properties.
 *
 * @type {Object}
 */

const DEFAULTS = {
    marks: Set(),
    text: ''
};

/*
 * Leaf.
 *
 * @type {Leaf}
 */

class Leaf extends Record(DEFAULTS) {
    /*
     * Object.
     *
     * @return {String}
     */

    get object() {
        return 'leaf';
    }

    get kind() {
        logger.deprecate(
            'slate@0.32.0',
            'The `kind` property of Slate objects has been renamed to `object`.'
        );
        return this.object;
    }

    /*
     * Check if `any` is a `Leaf`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    public static isLeaf = isType.bind(null, 'LEAF');
    /*
     * Create a new `Leaf` with `attrs`.
     *
     * @param {Object|Leaf} attrs
     * @return {Leaf}
     */

    public static create(attrs = {}) {
        if (Leaf.isLeaf(attrs)) {
            return attrs;
        }

        if (typeof attrs == 'string') {
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
     * Create a valid List of `Leaf` from `leaves`
     *
     * @param {List<Leaf>} leaves
     * @return {List<Leaf>}
     */

    public static createLeaves(leaves) {
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
     *
     * @param {List<Leaf> leaves
     * @return {Array<List<Leaf>>}
     */

    public static splitLeaves(leaves, offset) {
        if (offset < 0) {
            return [List(), leaves];
        }

        if (leaves.size === 0) {
            return [List(), List()];
        }

        let endOffset = 0;
        let index = -1;
        let left, right;

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
     *
     * @param {Array<Leaf|Object>|List<Leaf|Object>} attrs
     * @return {List<Leaf>}
     */

    public static createList(attrs = []) {
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
     *
     * @param {Object} object
     * @return {Leaf}
     */

    public static fromJS(object) {
        const { text = '', marks = [] } = object;

        const leaf = new Leaf({
            text,
            marks: Set(marks.map(Mark.fromJS))
        });

        return leaf;
    }

    /*
     * Alias `fromJS`.
     */

    public static fromJSON(object) {
        logger.deprecate(
            'slate@0.35.0',
            'fromJSON methods are deprecated, use fromJS instead'
        );
        return Leaf.fromJS(object);
    }

    /*
     * Check if `any` is a list of leaves.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    public static isLeafList(any) {
        return List.isList(any) && any.every(item => Leaf.isLeaf(item));
    }

    /*
     * Return leaf as a list of characters
     *
     * @return {List<Character>}
     */

    public getCharacters() {
        logger.deprecate(
            'slate@0.34.0',
            'The `characters` property of Slate objects is deprecated'
        );

        const { marks } = this;
        const characters = Character.createList(
            this.text.split('').map(char => {
                return Character.create({
                    text: char,
                    marks
                });
            })
        );

        return characters;
    }

    /*
     * Update a `mark` at leaf, replace with newMark
     *
     * @param {Mark} mark
     * @param {Mark} newMark
     * @returns {Leaf}
     */

    public updateMark(mark, newMark) {
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
     *
     * @param {Set<Mark>} set
     * @returns {Text}
     */

    public addMarks(set) {
        const { marks } = this;
        return this.set('marks', marks.union(set));
    }

    /*
     * Remove a `mark` at `index` and `length`.
     *
     * @param {Mark} mark
     * @returns {Text}
     */

    public removeMark(mark) {
        const { marks } = this;
        return this.set('marks', marks.remove(mark));
    }

    /*
     * Return a JSON representation of the leaf.
     *
     * @return {Object}
     */

    public toJS() {
        const object = {
            object: this.object,
            text: this.text,
            marks: this.marks.toArray().map(m => m.toJS())
        };

        return object;
    }

    /*
     * Alias `toJSON`.
     */

    public toJSON() {
        logger.deprecate(
            'slate@0.35.0',
            'toJSON methods are deprecated, use toJS instead'
        );
        return this.toJS();
    }
}

/*
 * Attach a pseudo-symbol for type checking.
 */

Leaf.prototype[MODEL_TYPES.LEAF] = true;

/*
 * Export.
 *
 * @type {Leaf}
 */

export default Leaf;
