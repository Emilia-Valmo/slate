import direction from 'direction';
import { List, Map, OrderedSet, Record, Set } from 'immutable';
import memoize from 'immutablejs-record-memoize';

import generateKey from '../utils/generate-key';
import { DataMap } from './data';
import Range from './range';
import Stack from './stack';
import Text from './text';

// Types only
import Block from './block';
import Document from './document';
import Inline from './inline';

type ChildNode = Block | Inline | Text;
type AncestorNode = Block | Inline;

export interface NodeDefaultProps {
    key: string;
    data: DataMap;
    nodes: List<any>;
}

/*
 * Factory to create the common model for nodes.
 */
function NodeFactory<Properties extends object>(defaultProps: Properties) {
    const DEFAULT: Properties & NodeDefaultProps = {
        key: '',
        data: Map(),
        nodes: List(),
        ...defaultProps
    };

    return class NodeModel extends Record(DEFAULT) {
        // Record properties
        public readonly key: string;
        public readonly data: DataMap;
        public readonly nodes: List<ChildNode>;

        public readonly object: 'inline' | 'block' | 'document';

        public isText(): this is Text {
            return false;
        }

        public isBlock(): this is Block {
            return this.object === 'block';
        }

        public isInline(): this is Inline {
            return this.object === 'block';
        }

        public isDocument(): this is Document {
            return this.object === 'document';
        }

        /*
         * True if the node has both descendants in that order, false otherwise. The
         * order is depth-first, post-order.
         */
        public areDescendantsSorted(first: string, second: string): boolean {
            const keys = this.getKeysAsArray();
            const firstIndex = keys.indexOf(first);
            const secondIndex = keys.indexOf(second);
            if (firstIndex === -1 || secondIndex === -1) {
                return null;
            }

            return firstIndex < secondIndex;
        }

        /*
         * Assert that a node has a child by `key` and return it.
         */
        public assertChild(key: string): ChildNode {
            const child = this.getChild(key);

            if (!child) {
                throw new Error(
                    `Could not find a child node with key "${key}".`
                );
            }

            return child;
        }

        /*
         * Assert that a node has a descendant by `key` and return it.
         */
        public assertDescendant(key: string): ChildNode {
            const descendant = this.getDescendant(key);

            if (!descendant) {
                throw new Error(
                    `Could not find a descendant node with key "${key}".`
                );
            }

            return descendant;
        }

        /*
         * Assert that a node's tree has a node by `key` and return it.
         */
        public assertNode(key: string): ChildNode {
            const node = this.getNode(key);

            if (!node) {
                throw new Error(`Could not find a node with key "${key}".`);
            }

            return node;
        }

        /*
         * Assert that a node exists at `path` and return it.
         */
        public assertPath(path: string[]): ChildNode {
            const descendant = this.getDescendantAtPath(path);

            if (!descendant) {
                throw new Error(
                    `Could not find a descendant at path "${path}".`
                );
            }

            return descendant;
        }

        /*
         * Recursively filter all descendant nodes with `iterator`.
         */
        public filterDescendants(
            iterator: (
                node: ChildNode,
                index: number,
                nodes: List<ChildNode>
            ) => boolean | void
        ): List<ChildNode> {
            const matches = [];

            this.forEachDescendant((node, i, nodes) => {
                if (iterator(node, i, nodes)) {
                    matches.push(node);
                }
            });

            return List(matches);
        }

        /*
         * Recursively find a descendant node by `iterator`.
         */
        public findDescendant(
            iterator: (
                node: ChildNode,
                index: number,
                nodes: List<ChildNode>
            ) => boolean | void
        ): ChildNode | null {
            let found = null;

            this.forEachDescendant((node, i, nodes) => {
                if (iterator(node, i, nodes)) {
                    found = node;
                    return false;
                }
            });

            return found;
        }

        /*
         * Recursively iterate over all descendant nodes with `iterator`. If the
         * iterator returns false it will break the loop.
         */
        public forEachDescendant(
            iterator: (
                node: ChildNode,
                index: number,
                nodes: List<ChildNode>
            ) => boolean | void
        ): boolean | undefined {
            let ret;

            this.nodes.forEach((child, i, nodes) => {
                if (iterator(child, i, nodes) === false) {
                    ret = false;
                    return false;
                }

                if (child.object !== 'text') {
                    ret = child.forEachDescendant(iterator);
                    return ret;
                }
            });

            return ret;
        }

        /*
         * Get the path of ancestors of a descendant node by `key`.
         */
        public getAncestors(key: string): List<AncestorNode> | null {
            if (key === this.key) {
                return List();
            }
            if (this.hasChild(key)) {
                return List([this]);
            }

            let ancestors;

            this.nodes.find(node => {
                if (node.object === 'text') {
                    return false;
                }
                ancestors = node.getAncestors(key);
                return ancestors;
            });

            if (ancestors) {
                return ancestors.unshift(this);
            } else {
                return null;
            }
        }

        /*
         * Get the leaf block descendants of the node.
         */
        public getBlocks(): List<Block> {
            const array = this.getBlocksAsArray();
            return List(array);
        }

        /*
         * Get the leaf block descendants of the node.
         */
        public getBlocksAsArray(): Block[] {
            return this.nodes.reduce((array, child) => {
                if (child.object !== 'block') {
                    return array;
                }
                if (!child.isLeafBlock()) {
                    return array.concat(child.getBlocksAsArray());
                }
                array.push(child);
                return array;
            }, []);
        }

        /*
         * Get the leaf block descendants in a `range`.
         */
        public getBlocksAtRange(range: Range): List<Block> {
            const array = this.getBlocksAtRangeAsArray(range);
            // Eliminate duplicates by converting to an `OrderedSet` first.
            return List(new OrderedSet(array));
        }

        /*
         * Get the leaf block descendants in a `range` as an array.
         */
        public getBlocksAtRangeAsArray(range: Range): Block[] {
            range = range.normalize(this);
            if (range.isUnset) {
                return [];
            }

            const { startKey, endKey } = range;
            const startBlock = this.getClosestBlock(startKey);

            // PERF: the most common case is when the range is in a single block node,
            // where we can avoid a lot of iterating of the tree.
            if (startKey === endKey) {
                return [startBlock];
            }

            const endBlock = this.getClosestBlock(endKey);
            const blocks = this.getBlocksAsArray();
            const start = blocks.indexOf(startBlock);
            const end = blocks.indexOf(endBlock);
            return blocks.slice(start, end + 1);
        }

        /*
         * Get all of the leaf blocks that match a `type`.
         */
        public getBlocksByType(type: string): List<Block> {
            const array = this.getBlocksByTypeAsArray(type);
            return List(array);
        }

        /*
         * Get all of the leaf blocks that match a `type` as an array.
         */
        public getBlocksByTypeAsArray(type: string): Block[] {
            return this.nodes.reduce((array, node) => {
                if (node.object !== 'block') {
                    return array;
                } else if (node.isLeafBlock() && node.type === type) {
                    array.push(node);
                    return array;
                } else {
                    return array.concat(node.getBlocksByTypeAsArray(type));
                }
            }, []);
        }

        /*
         * Get a child node by `key`.
         */
        public getChild(key: string): ChildNode | null {
            return this.nodes.find(node => node.key === key) || null;
        }

        /*
         * Get closest parent of node by `key` that matches `iterator`.
         */
        public getClosest(
            key: string,
            iterator: (
                ancestor: ChildNode,
                index: number,
                nodes: List<ChildNode>
            ) => boolean | void
        ): ChildNode | null {
            const ancestors = this.getAncestors(key);

            if (!ancestors) {
                throw new Error(
                    `Could not find a descendant node with key "${key}".`
                );
            }

            // Exclude this node itself.
            return ancestors.rest().findLast(iterator);
        }

        /*
         * Get the closest block parent of a `node`.
         */
        public getClosestBlock(key: string): Block | null {
            return this.getClosest(key, parent => parent.object === 'block');
        }

        /*
         * Get the closest inline parent of a `node`.
         */
        public getClosestInline(key: string): ChildNode | null {
            return this.getClosest(key, parent => parent.object === 'inline');
        }

        /*
         * Get the closest void parent of a `node`.
         */
        public getClosestVoid(key: string): ChildNode | null {
            return this.getClosest(key, parent => parent.isVoid);
        }

        /*
         * Get the common ancestor of nodes `one` and `two` by keys.
         */
        public getCommonAncestor(one: string, two: string): ChildNode | null {
            if (one === this.key) {
                return this;
            }
            if (two === this.key) {
                return this;
            }

            this.assertDescendant(one);
            this.assertDescendant(two);
            let ancestors = new List();
            let oneParent = this.getParent(one);
            let twoParent = this.getParent(two);

            while (oneParent) {
                ancestors = ancestors.push(oneParent);
                oneParent = this.getParent(oneParent.key);
            }

            while (twoParent) {
                if (ancestors.includes(twoParent)) {
                    return twoParent;
                }
                twoParent = this.getParent(twoParent.key);
            }

            return null;
        }

        /*
         * Get the decorations for the node from a `stack`.
         */
        public getDecorations(stack: Stack): List<Range> {
            const decorations = stack.find('decorateNode', this);
            const list = Range.createList(decorations || []);
            return list;
        }

        /*
         * Get the depth of a child node by `key`, with optional `startAt`
         */
        public getDepth(key: string, startAt: number = 1): number {
            this.assertDescendant(key);
            if (this.hasChild(key)) {
                return startAt;
            }
            return this.getFurthestAncestor(key).getDepth(key, startAt + 1);
        }

        /*
         * Get a descendant node by `key`.
         */
        public getDescendant(key: string): ChildNode | null {
            let descendantFound = null;

            const found = this.nodes.find(node => {
                if (node.key === key) {
                    return node;
                } else if (node.object !== 'text') {
                    descendantFound = node.getDescendant(key);
                    return descendantFound;
                } else {
                    return false;
                }
            });

            return descendantFound || found;
        }

        /*
         * Get a descendant by `path`.
         */
        public getDescendantAtPath(path: string[]): ChildNode | null {
            let descendant = this;

            for (const index of path) {
                if (!descendant) {
                    return null;
                }
                if (!descendant.nodes) {
                    return null;
                }
                descendant = descendant.nodes.get(index);
            }

            return descendant;
        }

        /*
         * Get the first child text node.
         */
        public getFirstText(): Text | null {
            let descendantFound = null;

            const found = this.nodes.find(node => {
                if (node.object === 'text') {
                    return true;
                }
                descendantFound = node.getFirstText();
                return descendantFound;
            });

            return descendantFound || found;
        }

        /*
         * Get the furthest parent of a node by `key` that matches an `iterator`.
         */
        public getFurthest(
            key: string,
            iterator: (
                node: ChildNode,
                index: number,
                nodes: List<ChildNode>
            ) => boolean | void
        ): ChildNode | null {
            const ancestors = this.getAncestors(key);

            if (!ancestors) {
                throw new Error(
                    `Could not find a descendant node with key "${key}".`
                );
            }

            // Exclude this node itself
            return ancestors.rest().find(iterator);
        }

        /*
         * Get the furthest block parent of a node by `key`.
         */
        public getFurthestBlock(key: string): Block | null {
            return this.getFurthest(key, node => node.object === 'block');
        }

        /*
         * Get the furthest inline parent of a node by `key`.
         */
        public getFurthestInline(key: string): Inline | null {
            return this.getFurthest(key, node => node.object === 'inline');
        }

        /*
         * Get the furthest ancestor of a node by `key`.
         */
        public getFurthestAncestor(key: string): ChildNode | null {
            return this.nodes.find(node => {
                if (node.key === key) {
                    return true;
                }
                if (node.object === 'text') {
                    return false;
                }
                return node.hasDescendant(key);
            });
        }

        /*
         * Get the furthest ancestor of a node by `key` that has only one child.
         */
        public getFurthestOnlyChildAncestor(key: string): ChildNode | null {
            const ancestors = this.getAncestors(key);

            if (!ancestors) {
                throw new Error(
                    `Could not find a descendant node with key "${key}".`
                );
            }

            const result = ancestors
                // Skip this node...
                .shift()
                // Take parents until there are more than one child...
                .reverse()
                .takeUntil(p => p.nodes.size > 1)
                // And pick the highest.
                .last();
            if (!result) {
                return null;
            }
            return result;
        }

        /*
         * Get the closest inline nodes for each text node in the node.
         */
        public getInlines(): List<Inline> {
            const array = this.getInlinesAsArray();
            return new List(array);
        }

        /*
         * Get the closest inline nodes for each text node in the node, as an array.
         */
        public getInlinesAsArray(): Inline[] {
            let array = [];

            this.nodes.forEach(child => {
                if (child.object === 'text') {
                    return;
                }

                if (child.isLeafInline()) {
                    array.push(child);
                } else {
                    array = array.concat(child.getInlinesAsArray());
                }
            });

            return array;
        }

        /*
         * Get the closest inline nodes for each text node in a `range`.
         */
        public getInlinesAtRange(range: Range): List<Inline> {
            const array = this.getInlinesAtRangeAsArray(range);
            // Remove duplicates by converting it to an `OrderedSet` first.
            return new List(OrderedSet(array));
        }

        /*
         * Get the closest inline nodes for each text node in a `range` as an array.
         */
        public getInlinesAtRangeAsArray(range: Range): Inline[] {
            range = range.normalize(this);
            if (range.isUnset) {
                return [];
            }

            return this.getTextsAtRangeAsArray(range)
                .map(text => this.getClosestInline(text.key))
                .filter(exists => exists);
        }

        /*
         * Get all of the leaf inline nodes that match a `type`.
         */
        public getInlinesByType(type: string): List<Inline> {
            const array = this.getInlinesByTypeAsArray(type);
            return new List(array);
        }

        /*
         * Get all of the leaf inline nodes that match a `type` as an array.
         */
        public getInlinesByTypeAsArray(type: string): Inline[] {
            return this.nodes.reduce((inlines, node) => {
                if (node.object === 'text') {
                    return inlines;
                } else if (node.isLeafInline() && node.type === type) {
                    inlines.push(node);
                    return inlines;
                } else {
                    return inlines.concat(node.getInlinesByTypeAsArray(type));
                }
            }, []);
        }

        /*
         * Return a set of all keys in the node as an array.
         */
        public getKeysAsArray(): string[] {
            const keys = [];

            this.forEachDescendant(desc => {
                keys.push(desc.key);
            });

            return keys;
        }

        /*
         * Return a set of all keys in the node.
         */

        public getKeys(): Set<string> {
            const keys = this.getKeysAsArray();
            return Set(keys);
        }

        /*
         * Get the last child text node.
         */
        public getLastText(): Text | null {
            let descendantFound = null;

            const found = this.nodes.findLast(node => {
                if (node.object === 'text') {
                    return true;
                }
                descendantFound = node.getLastText();
                return descendantFound;
            });

            return descendantFound || found;
        }

        /*
         * Get all of the marks for all of the characters of every text node.
         */
        public getMarks(): Set<Mark> {
            const array = this.getMarksAsArray();
            return Set(array);
        }

        /*
         * Get all of the marks for all of the characters of every text node.
         */
        public getOrderedMarks(): OrderedSet<Mark> {
            const array = this.getMarksAsArray();
            return OrderedSet(array);
        }

        /*
         * Get all of the marks as an array.
         */
        public getMarksAsArray(): Mark[] {
            // PERF: use only one concat rather than multiple concat
            // becuase one concat is faster
            const result = [];

            this.nodes.forEach(node => {
                result.push(node.getMarksAsArray());
            });
            return Array.prototype.concat.apply([], result);
        }

        /*
         * Get a set of the marks in a `range`.
         */
        public getMarksAtRange(range: Range): Set<Mark> {
            return new Set(this.getOrderedMarksAtRange(range));
        }

        /*
         * Get a set of the marks in a `range`.
         */
        public getInsertMarksAtRange(range: Range): Set<Mark> {
            range = range.normalize(this);
            if (range.isUnset) {
                return Set();
            }

            if (range.isCollapsed) {
                // PERF: range is not cachable, use key and offset as proxies for cache
                return this.getMarksAtPosition(
                    range.startKey,
                    range.startOffset
                );
            }

            const { startKey, startOffset } = range;
            const text = this.getDescendant(startKey);
            return text.getMarksAtIndex(startOffset + 1);
        }

        /*
         * Get a set of the marks in a `range`.
         */
        public getOrderedMarksAtRange(range: Range): OrderedSet<Mark> {
            range = range.normalize(this);
            if (range.isUnset) {
                return OrderedSet();
            }

            if (range.isCollapsed) {
                // PERF: range is not cachable, use key and offset as proxies for cache
                return this.getMarksAtPosition(
                    range.startKey,
                    range.startOffset
                );
            }

            const { startKey, startOffset, endKey, endOffset } = range;
            return this.getOrderedMarksBetweenPositions(
                startKey,
                startOffset,
                endKey,
                endOffset
            );
        }

        /*
         * Get a set of the marks in a `range`.
         * PERF: arguments use key and offset for utilizing cache.
         */
        public getOrderedMarksBetweenPositions(
            startKey: string,
            startOffset: number,
            endKey: string,
            endOffset: number
        ): OrderedSet<Mark> {
            if (startKey === endKey) {
                const startText = this.getDescendant(startKey);
                return startText.getMarksBetweenOffsets(startOffset, endOffset);
            }

            const texts = this.getTextsBetweenPositionsAsArray(
                startKey,
                endKey
            );

            return OrderedSet().withMutations(result => {
                texts.forEach(text => {
                    if (text.key === startKey) {
                        result.union(
                            text.getMarksBetweenOffsets(
                                startOffset,
                                text.text.length
                            )
                        );
                    } else if (text.key === endKey) {
                        result.union(text.getMarksBetweenOffsets(0, endOffset));
                    } else {
                        result.union(text.getMarks());
                    }
                });
            });
        }

        /*
         * Get a set of the active marks in a `range`.
         */
        public getActiveMarksAtRange(range: Range): Set<Mark> {
            range = range.normalize(this);
            if (range.isUnset) {
                return Set();
            }

            if (range.isCollapsed) {
                return this.getMarksAtPosition(
                    range.startKey,
                    range.startOffset
                ).toSet();
            }

            let { startKey, endKey, startOffset, endOffset } = range;
            let startText = this.getDescendant(startKey);

            if (startKey !== endKey) {
                while (startKey !== endKey && endOffset === 0) {
                    const endPrevText = this.getPreviousText(endKey);
                    endKey = endPrevText.key;
                    endOffset = endPrevText.text.length;
                }

                while (
                    startKey !== endKey &&
                    startOffset === startText.text.length
                ) {
                    startText = this.getNextText(startKey);
                    startKey = startText.key;
                    startOffset = 0;
                }
            }

            if (startKey === endKey) {
                return startText.getActiveMarksBetweenOffsets(
                    startOffset,
                    endOffset
                );
            }

            const startMarks = startText.getActiveMarksBetweenOffsets(
                startOffset,
                startText.text.length
            );
            if (startMarks.size === 0) {
                return Set();
            }
            const endText = this.getDescendant(endKey);
            const endMarks = endText.getActiveMarksBetweenOffsets(0, endOffset);
            let marks = startMarks.intersect(endMarks);
            // If marks is already empty, the active marks is empty
            if (marks.size === 0) {
                return marks;
            }

            let text = this.getNextText(startKey);

            while (text.key !== endKey) {
                if (text.text.length !== 0) {
                    marks = marks.intersect(text.getActiveMarks());
                    if (marks.size === 0) {
                        return Set();
                    }
                }

                text = this.getNextText(text.key);
            }
            return marks;
        }

        /*
         * Get a set of marks in a `position`, the equivalent of a collapsed range.
         */
        public getMarksAtPosition(key: string, offset: number): Set<Mark> {
            const text = this.getDescendant(key);
            const currentMarks = text.getMarksAtIndex(offset);
            if (offset !== 0) {
                return currentMarks;
            }
            const closestBlock = this.getClosestBlock(key);

            if (closestBlock.text === '') {
                // insert mark for empty block; the empty block are often created by split node or add marks in a range including empty blocks
                return currentMarks;
            }

            const previous = this.getPreviousText(key);
            if (!previous) {
                return Set();
            }

            if (closestBlock.hasDescendant(previous.key)) {
                return previous.getMarksAtIndex(previous.text.length);
            }

            return currentMarks;
        }

        /*
         * Get all of the marks that match a `type`.
         */
        public getMarksByType(type: string): Set<Mark> {
            const array = this.getMarksByTypeAsArray(type);
            return Set(array);
        }

        /*
         * Get all of the marks that match a `type`.
         */

        public getOrderedMarksByType(type: string): OrderedSet<Mark> {
            const array = this.getMarksByTypeAsArray(type);
            return OrderedSet(array);
        }

        /*
         * Get all of the marks that match a `type` as an array.
         */
        public getMarksByTypeAsArray(type: string): Mark[] {
            return this.nodes.reduce((array, node) => {
                return node.object === 'text'
                    ? array.concat(
                          node.getMarksAsArray().filter(m => m.type === type)
                      )
                    : array.concat(node.getMarksByTypeAsArray(type));
            }, []);
        }

        /*
         * Get the block node before a descendant text node by `key`.
         */
        public getNextBlock(key: string): Block | null {
            const child = this.assertDescendant(key);
            let last;

            if (child.object === 'block') {
                last = child.getLastText();
            } else {
                const block = this.getClosestBlock(key);
                last = block.getLastText();
            }

            const next = this.getNextText(last.key);
            if (!next) {
                return null;
            }

            return this.getClosestBlock(next.key);
        }

        /*
         * Get the node after a descendant by `key`.
         */
        public getNextSibling(key: string): ChildNode | null {
            const parent = this.getParent(key);
            const after = parent.nodes.skipUntil(child => child.key === key);

            if (after.size === 0) {
                throw new Error(
                    `Could not find a child node with key "${key}".`
                );
            }
            return after.get(1);
        }

        /*
         * Get the text node after a descendant text node by `key`.
         */
        public getNextText(key: string): Text | null {
            return this.getTexts()
                .skipUntil(text => text.key === key)
                .get(1);
        }

        /*
         * Get a node in the tree by `key`.
         */
        public getNode(key: string): ChildNode | null {
            return this.key === key ? this : this.getDescendant(key);
        }

        /*
         * Get a node in the tree by `path`.
         */
        public getNodeAtPath(path: string[]): ChildNode | null {
            return path.length ? this.getDescendantAtPath(path) : this;
        }

        /*
         * Get the offset for a descendant text node by `key`.
         */
        public getOffset(key: string): number {
            this.assertDescendant(key);

            // Calculate the offset of the nodes before the highest child.
            const child = this.getFurthestAncestor(key);
            const offset = this.nodes
                .takeUntil(n => n === child)
                .reduce((memo, n) => memo + n.text.length, 0);

            // Recurse if need be.
            return this.hasChild(key) ? offset : offset + child.getOffset(key);
        }

        /*
         * Get the offset from a `range`.
         */
        public getOffsetAtRange(range: Range): number {
            range = range.normalize(this);

            if (range.isUnset) {
                throw new Error(
                    'The range cannot be unset to calculcate its offset.'
                );
            }

            if (range.isExpanded) {
                throw new Error(
                    'The range must be collapsed to calculcate its offset.'
                );
            }

            const { startKey, startOffset } = range;
            return this.getOffset(startKey) + startOffset;
        }

        /*
         * Get the parent of a child node by `key`.
         */
        public getParent(key: string): AncestorNode | null {
            if (this.hasChild(key)) {
                return this;
            }

            let node = null;

            this.nodes.find(child => {
                if (child.object === 'text') {
                    return false;
                } else {
                    node = child.getParent(key);
                    return node;
                }
            });

            return node;
        }

        /*
         * Get the path of a descendant node by `key`.
         */
        public getPath(key: string): string[] {
            let child = this.assertNode(key);
            const ancestors = this.getAncestors(key);
            const path = [];

            ancestors.reverse().forEach(ancestor => {
                const index = ancestor.nodes.indexOf(child);
                path.unshift(index);
                child = ancestor;
            });

            return path;
        }

        /*
         * Refind the path of node if path is changed.
         */
        public refindPath(path: string[], key: string): string[] {
            const node = this.getDescendantAtPath(path);

            if (node && node.key === key) {
                return path;
            }

            return this.getPath(key);
        }

        /*
         * Refind the node with the same node.key after change.
         */
        public refindNode(path: string[], key: string): ChildNode | null {
            const node = this.getDescendantAtPath(path);

            if (node && node.key === key) {
                return node;
            }

            return this.getDescendant(key);
        }

        /*
         * Get the block node before a descendant text node by `key`.
         */
        public getPreviousBlock(key: string): Block | null {
            const child = this.assertDescendant(key);
            let first;

            if (child.object === 'block') {
                first = child.getFirstText();
            } else {
                const block = this.getClosestBlock(key);
                first = block.getFirstText();
            }

            const previous = this.getPreviousText(first.key);
            if (!previous) {
                return null;
            }

            return this.getClosestBlock(previous.key);
        }

        /*
         * Get the node before a descendant node by `key`.
         */
        public getPreviousSibling(key: string): ChildNode | null {
            const parent = this.getParent(key);
            const before = parent.nodes.takeUntil(child => child.key === key);

            if (before.size === parent.nodes.size) {
                throw new Error(
                    `Could not find a child node with key "${key}".`
                );
            }

            return before.last();
        }

        /*
         * Get the text node before a descendant text node by `key`.
         */
        public getPreviousText(key: string): Text | null {
            return this.getTexts()
                .takeUntil(text => text.key === key)
                .last();
        }

        /*
         * Get the indexes of the selection for a `range`, given an extra flag for
         * whether the node `isSelected`, to determine whether not finding matches
         * means everything is selected or nothing is.
         */
        public getSelectionIndexes(
            range: Range,
            isSelected: boolean = true
        ): { start: number; end: number } | null {
            const { startKey, endKey } = range;

            // PERF: if we're not selected, we can exit early.
            if (!isSelected) {
                return null;
            }

            // if we've been given an invalid selection we can exit early.
            if (range.isUnset) {
                return null;
            }

            // PERF: if the start and end keys are the same, just check for the child
            // that contains that single key.
            if (startKey === endKey) {
                const child = this.getFurthestAncestor(startKey);
                const index = child ? this.nodes.indexOf(child) : null;
                return { start: index, end: index + 1 };
            }

            // Otherwise, check all of the children...
            let start = null;
            let end = null;

            this.nodes.forEach((child, i) => {
                if (child.object === 'text') {
                    if (start == null && child.key === startKey) {
                        start = i;
                    }
                    if (end == null && child.key === endKey) {
                        end = i + 1;
                    }
                } else {
                    if (start == null && child.hasDescendant(startKey)) {
                        start = i;
                    }
                    if (end == null && child.hasDescendant(endKey)) {
                        end = i + 1;
                    }
                }

                // PERF: exit early if both start and end have been found.
                return start == null || end == null;
            });

            if (isSelected && start == null) {
                start = 0;
            }
            if (isSelected && end == null) {
                end = this.nodes.size;
            }
            return start == null ? null : { start, end };
        }

        /*
         * Get the concatenated text string of all child nodes.
         */
        public getText(): string {
            return this.nodes.reduce((content, node) => {
                return content + node.text;
            }, '');
        }

        /*
         * Get the descendent text node at an `offset`.
         */
        public getTextAtOffset(offset: number): Text | null {
            // PERF: Add a few shortcuts for the obvious cases.
            if (offset === 0) {
                return this.getFirstText();
            }
            if (offset === this.text.length) {
                return this.getLastText();
            }
            if (offset < 0 || offset > this.text.length) {
                return null;
            }

            let length = 0;

            return this.getTexts().find((node, i, nodes) => {
                length += node.text.length;
                return length > offset;
            });
        }

        /*
         * Get the direction of the node's text.
         */
        public getTextDirection(): 'ltr' | 'rtl' | undefined {
            const dir = direction(this.text);
            return dir === 'neutral' ? undefined : dir;
        }

        /*
         * Recursively get all of the child text nodes in order of appearance.
         */
        public getTexts(): List<Text> {
            const array = this.getTextsAsArray();
            return new List(array);
        }

        /*
         * Recursively get all the leaf text nodes in order of appearance, as array.
         */
        public getTextsAsArray(): Text[] {
            let array = [];

            this.nodes.forEach(node => {
                if (node.object === 'text') {
                    array.push(node);
                } else {
                    array = array.concat(node.getTextsAsArray());
                }
            });

            return array;
        }

        /*
         * Get all of the text nodes in a `range`.
         */
        public getTextsAtRange(range: Range): List<Text> {
            range = range.normalize(this);
            if (range.isUnset) {
                return List();
            }
            const { startKey, endKey } = range;
            return new List(
                this.getTextsBetweenPositionsAsArray(startKey, endKey)
            );
        }

        /*
         * Get all of the text nodes in a `range` as an array.
         * PERF: use key in arguments for cache.
         */
        public getTextsBetweenPositionsAsArray(
            startKey: string,
            endKey: string
        ): Text[] {
            const startText = this.getDescendant(startKey);

            if (!startText.isText()) {
                throw new Error(`Expected "${startKey}" to be a text`);
            }

            // PERF: the most common case is when the range is in a single text node,
            // where we can avoid a lot of iterating of the tree.
            if (startKey === endKey) {
                return [startText];
            }

            const endText = this.getDescendant(endKey);
            if (!endText.isText()) {
                throw new Error(`Expected "${endKey}" to be a text`);
            }

            const texts = this.getTextsAsArray();
            const start = texts.indexOf(startText);
            const end = texts.indexOf(endText, start);
            return texts.slice(start, end + 1);
        }

        /*
         * Get all of the text nodes in a `range` as an array.
         */
        public getTextsAtRangeAsArray(range: Range): Text[] {
            range = range.normalize(this);
            if (range.isUnset) {
                return [];
            }
            const { startKey, endKey } = range;
            return this.getTextsBetweenPositionsAsArray(startKey, endKey);
        }

        /*
         * Check if a child node exists by `key`.
         */
        public hasChild(key: string): boolean {
            return !!this.getChild(key);
        }

        /*
         * Check if a node has block node children.
         */
        public hasBlocks(key: string): boolean {
            const node = this.assertNode(key);
            return !!(node.nodes && node.nodes.find(n => n.object === 'block'));
        }

        /*
         * Check if a node has inline node children.
         */
        public hasInlines(key: string): boolean {
            const node = this.assertNode(key);
            return !!(
                node.nodes && node.nodes.find(n => n.isInline || n.isText)
            );
        }

        /*
         * Recursively check if a child node exists by `key`.
         */
        public hasDescendant(key: string): boolean {
            return !!this.getDescendant(key);
        }

        /*
         * Recursively check if a node exists by `key`.
         */
        public hasNode(key: string): boolean {
            return !!this.getNode(key);
        }

        /*
         * Check if a node has a void parent by `key`.
         */
        public hasVoidParent(key: string): boolean {
            return !!this.getClosestVoid(key);
        }

        /*
         * Insert a `node` at `index`.
         */
        public insertNode(index: number, node: ChildNode) {
            const keys = this.getKeysAsArray();

            if (keys.includes(node.key)) {
                node = node.regenerateKey();
            }

            if (node.object !== 'text') {
                node = node.mapDescendants(desc => {
                    return keys.includes(desc.key)
                        ? desc.regenerateKey()
                        : desc;
                });
            }

            const nodes = this.nodes.insert(index, node);
            return this.merge({ nodes });
        }

        /*
         * Check whether the node is in a `range`.
         */
        public isInRange(range: Range): boolean {
            range = range.normalize(this);

            const node = this;
            const { startKey, endKey, isCollapsed } = range;

            // PERF: solve the most common cast where the start or end key are inside
            // the node, for collapsed selections.
            if (
                node.key === startKey ||
                node.key === endKey ||
                node.hasDescendant(startKey) ||
                node.hasDescendant(endKey)
            ) {
                return true;
            }

            // PERF: if the selection is collapsed and the previous check didn't return
            // true, then it must be false.
            if (isCollapsed) {
                return false;
            }

            // Otherwise, look through all of the leaf text nodes in the range, to see
            // if any of them are inside the node.
            const texts = node.getTextsAtRange(range);
            let memo = false;

            texts.forEach(text => {
                if (node.hasDescendant(text.key)) {
                    memo = true;
                }
                return memo;
            });

            return memo;
        }

        /*
         * Check whether the node is a leaf block.
         */
        public isLeafBlock(): boolean {
            return (
                this.object === 'block' &&
                this.nodes.every(n => n.object !== 'block')
            );
        }

        /*
         * Check whether the node is a leaf inline.
         */
        public isLeafInline(): boolean {
            return (
                this.object === 'inline' &&
                this.nodes.every(n => n.object !== 'inline')
            );
        }

        /*
         * Merge a children node `first` with another children node `second`.
         * `first` and `second` will be concatenated in that order.
         * `first` and `second` must be two Nodes or two Text.
         */
        public mergeNode(withIndex: number, index: number): this {
            const node = this;
            let one = node.nodes.get(withIndex);
            const two = node.nodes.get(index);

            if (one.object !== two.object) {
                throw new Error(
                    `Tried to merge two nodes of different objects: "${
                        one.object
                    }" and "${two.object}".`
                );
            }

            // If the nodes are text nodes, concatenate their leaves together
            if (one.object === 'text') {
                one = one.mergeText(two);
            } else {
                // Otherwise, concatenate their child nodes together.
                const nodes = one.nodes.concat(two.nodes);
                one = one.set('nodes', nodes);
            }

            return node
                .removeNode(index)
                .removeNode(withIndex)
                .insertNode(withIndex, one);
        }

        /*
         * Map all child nodes, updating them in their parents. This method is
         * optimized to not return a new node if no changes are made.
         */
        public mapChildren(
            iterator: (
                node: ChildNode,
                index: number,
                nodes: List<ChildNode>
            ) => ChildNode
        ): this {
            let { nodes } = this;

            nodes.forEach((node, i) => {
                const ret = iterator(node, i, this.nodes);
                if (ret !== node) {
                    nodes = nodes.set(ret.key, ret);
                }
            });

            return this.merge({ nodes });
        }

        /*
         * Map all descendant nodes, updating them in their parents. This method is
         * optimized to not return a new node if no changes are made.
         */
        public mapDescendants(
            iterator: (
                node: ChildNode,
                index: number,
                nodes: List<ChildNode>
            ) => ChildNode
        ): this {
            let { nodes } = this;

            nodes.forEach((node, index) => {
                let ret = node;
                if (ret.object !== 'text') {
                    ret = ret.mapDescendants(iterator);
                }
                ret = iterator(ret, index, this.nodes);
                if (ret === node) {
                    return;
                }

                nodes = nodes.set(index, ret);
            });

            return this.merge({ nodes });
        }

        /*
         * Regenerate the node's key.
         */
        public regenerateKey(): this {
            const key = generateKey();
            return this.merge({ key });
        }

        /*
         * Remove a `node` from the children node map.
         */
        public removeDescendant(key: string): this {
            let node = this;
            let parent = node.getParent(key);
            if (!parent) {
                throw new Error(
                    `Could not find a descendant node with key "${key}".`
                );
            }

            const index = parent.nodes.findIndex(n => n.key === key);
            const nodes = parent.nodes.delete(index);

            parent = parent.merge({ nodes });
            node = node.updateNode(parent);
            return node;
        }

        /*
         * Remove a node at `index`.
         */
        public removeNode(index: number): this {
            const nodes = this.nodes.delete(index);
            return this.merge({ nodes });
        }

        /*
         * Split a child node by `index` at `position`.
         */
        public splitNode(index: number, position: number): this {
            const node = this;
            const child = node.nodes.get(index);
            let one;
            let two;

            // If the child is a text node, the `position` refers to the text offset at
            // which to split it.
            if (child.object === 'text') {
                [one, two] = child.splitText(position);
            } else {
                // Otherwise, if the child is not a text node, the `position` refers to the
                // index at which to split its children.
                const befores = child.nodes.take(position);
                const afters = child.nodes.skip(position);
                one = child.set('nodes', befores);
                two = child.set('nodes', afters).regenerateKey();
            }

            // Remove the old node and insert the newly split children.
            return node
                .removeNode(index)
                .insertNode(index, two)
                .insertNode(index, one);
        }

        /*
         * Set a new value for a child node by `key`.
         */
        public updateNode(node: ChildNode): this {
            if (node.key === this.key) {
                return node;
            }

            let child = this.assertDescendant(node.key);
            const ancestors = this.getAncestors(node.key);

            ancestors.reverse().forEach(parent => {
                let { nodes } = parent;
                const index = nodes.indexOf(child);
                child = parent;
                nodes = nodes.set(index, node);
                parent = parent.set('nodes', nodes);
                node = parent;
            });

            return node;
        }
    };
}

/*
 * Memoize methods for a node model.
 */
function memoizeMethods(C: any, methods: string[] = []) {
    memoize(C.prototype, [
        'areDescendantsSorted',
        'getAncestors',
        'getBlocksAsArray',
        'getBlocksAtRangeAsArray',
        'getBlocksByTypeAsArray',
        'getChild',
        'getClosestBlock',
        'getClosestInline',
        'getClosestVoid',
        'getCommonAncestor',
        'getDecorations',
        'getDepth',
        'getDescendant',
        'getDescendantAtPath',
        'getFirstText',
        'getFurthestBlock',
        'getFurthestInline',
        'getFurthestAncestor',
        'getFurthestOnlyChildAncestor',
        'getInlinesAsArray',
        'getInlinesAtRangeAsArray',
        'getInlinesByTypeAsArray',
        'getMarksAsArray',
        'getMarksAtPosition',
        'getOrderedMarksBetweenPositions',
        'getInsertMarksAtRange',
        'getKeysAsArray',
        'getLastText',
        'getMarksByTypeAsArray',
        'getNextBlock',
        'getNextSibling',
        'getNextText',
        'getNode',
        'getNodeAtPath',
        'getOffset',
        'getOffsetAtRange',
        'getParent',
        'getPath',
        'getPreviousBlock',
        'getPreviousSibling',
        'getPreviousText',
        'getText',
        'getTextAtOffset',
        'getTextDirection',
        'getTextsAsArray',
        'getTextsBetweenPositionsAsArray',
        'isLeafBlock',
        'isLeafInline',
        ...methods
    ]);
}

export default NodeFactory;
export { memoizeMethods };
