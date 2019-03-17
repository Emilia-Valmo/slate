import logger from '@gitbook/slate-dev-logger';
import { List, Record, Set } from 'immutable';
import isPlainObject from 'is-plain-object';

import MODEL_TYPES from '../constants/model-types';
import Mark, { MarkJSON } from './mark';

// Types only
import Text from './block';
import Block from './block';
import Document from './document';
import Inline from './inline';

type AnyNode = Block | Inline | Document | Text;

// JSON representation of a range
export interface RangeJSON {
    anchorKey: string | null;
    anchorOffset: number;
    focusKey: string | null;
    focusOffset: number;
    isBackward: boolean | null;
    isFocused: boolean;
    marks: MarkJSON[] | null;
    isAtomic: boolean;
}

// Argument to create a Range
export type RangeCreateProps = Range | Partial<{}>;

/*
 * Range in the document (used for selection, decoration with marks, etc)
 */
class Range extends Record({
    anchorKey: null,
    anchorOffset: 0,
    focusKey: null,
    focusOffset: 0,
    isBackward: null,
    isFocused: false,
    marks: null,
    isAtomic: false
}) {
    /*
     * Object.
     */

    get object(): 'range' {
        return 'range';
    }

    /*
     * Check whether the range is blurred.
     */
    get isBlurred(): boolean {
        return !this.isFocused;
    }

    /*
     * Check whether the range is collapsed.
     */
    get isCollapsed(): boolean {
        return (
            this.anchorKey === this.focusKey &&
            this.anchorOffset === this.focusOffset
        );
    }

    /*
     * Check whether the range is expanded.
     */
    get isExpanded(): boolean {
        return !this.isCollapsed;
    }

    /*
     * Check whether the range is forward.
     */
    get isForward(): boolean {
        return this.isBackward == null ? null : !this.isBackward;
    }

    /*
     * Check whether the range's keys are set.
     */
    get isSet(): boolean {
        return this.anchorKey != null && this.focusKey != null;
    }

    /*
     * Check whether the range's keys are not set.
     */
    get isUnset(): boolean {
        return !this.isSet;
    }

    /*
     * Get the start key.
     */
    get startKey(): string | null {
        return this.isBackward ? this.focusKey : this.anchorKey;
    }

    /*
     * Get the start offset.
     */
    get startOffset(): number {
        return this.isBackward ? this.focusOffset : this.anchorOffset;
    }

    /*
     * Get the end key.
     */

    get endKey(): string | null {
        return this.isBackward ? this.anchorKey : this.focusKey;
    }

    /*
     * Get the end offset.
     */
    get endOffset(): number {
        return this.isBackward ? this.anchorOffset : this.focusOffset;
    }

    /*
     * Create a new `Range` with `attrs`.
     */
    public static create(attrs: RangeCreateProps = {}): Range {
        if (Range.isRange(attrs)) {
            return attrs;
        }

        if (isPlainObject(attrs)) {
            return Range.fromJS(attrs);
        }

        throw new Error(
            `\`Range.create\` only accepts objects or ranges, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a list of `Ranges` from `elements`.
     *
     * @param {Array<Range|Object>|List<Range|Object>} elements
     * @return {List<Range>}
     */

    public static createList(elements = []) {
        if (List.isList(elements) || Array.isArray(elements)) {
            const list = new List(elements.map(Range.create));
            return list;
        }

        throw new Error(
            `\`Range.createList\` only accepts arrays or lists, but you passed it: ${elements}`
        );
    }

    /*
     * Create a dictionary of settable range properties from `attrs`.
     *
     * @param {Object|String|Range} attrs
     * @return {Object}
     */

    public static createProperties(attrs = {}) {
        if (Range.isRange(attrs)) {
            return {
                anchorKey: attrs.anchorKey,
                anchorOffset: attrs.anchorOffset,
                focusKey: attrs.focusKey,
                focusOffset: attrs.focusOffset,
                isBackward: attrs.isBackward,
                isFocused: attrs.isFocused,
                marks: attrs.marks,
                isAtomic: attrs.isAtomic
            };
        }

        if (isPlainObject(attrs)) {
            const props = {};
            if ('anchorKey' in attrs) {
                props.anchorKey = attrs.anchorKey;
            }
            if ('anchorOffset' in attrs) {
                props.anchorOffset = attrs.anchorOffset;
            }
            if ('anchorPath' in attrs) {
                props.anchorPath = attrs.anchorPath;
            }
            if ('focusKey' in attrs) {
                props.focusKey = attrs.focusKey;
            }
            if ('focusOffset' in attrs) {
                props.focusOffset = attrs.focusOffset;
            }
            if ('focusPath' in attrs) {
                props.focusPath = attrs.focusPath;
            }
            if ('isBackward' in attrs) {
                props.isBackward = attrs.isBackward;
            }
            if ('isFocused' in attrs) {
                props.isFocused = attrs.isFocused;
            }
            if ('marks' in attrs) {
                props.marks =
                    attrs.marks == null ? null : Mark.createSet(attrs.marks);
            }
            if ('isAtomic' in attrs) {
                props.isAtomic = attrs.isAtomic;
            }
            return props;
        }

        throw new Error(
            `\`Range.createProperties\` only accepts objects or ranges, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a `Range` from a JSON `object`.
     */
    public static fromJS(object: Partial<RangeJSON>): Range {
        const {
            anchorKey = null,
            anchorOffset = 0,
            focusKey = null,
            focusOffset = 0,
            isBackward = null,
            isFocused = false,
            marks = null,
            isAtomic = false
        } = object;

        const range = new Range({
            anchorKey,
            anchorOffset,
            focusKey,
            focusOffset,
            isBackward,
            isFocused,
            marks: marks == null ? null : Mark.createSet(marks),
            isAtomic
        });

        return range;
    }

    /*
     * Check if an `obj` is a `Range`.
     */
    public static isRange(obj: any): obj is Range {
        return !!(obj && obj[MODEL_TYPES.RANGE]);
    }

    // Record properties
    public readonly anchorKey: string | null;
    public readonly anchorOffset: number;
    public readonly focusKey: string | null;
    public readonly focusOffset: number;
    public readonly isBackward: boolean | null;
    public readonly isFocused: boolean | null;
    public readonly marks: Set<Mark> | null;
    public readonly isAtomic: boolean;

    /*
     * Check whether anchor point of the range is at the start of a `node`.
     */
    public hasAnchorAtStartOf(node: AnyNode): boolean {
        // PERF: Do a check for a `0` offset first since it's quickest.
        if (this.anchorOffset !== 0) {
            return false;
        }
        const first = getFirst(node);
        return this.anchorKey === first.key;
    }

    /*
     * Check whether anchor point of the range is at the end of a `node`.
     */
    public hasAnchorAtEndOf(node: AnyNode): boolean {
        const last = getLast(node);
        return (
            this.anchorKey === last.key &&
            this.anchorOffset === last.text.length
        );
    }

    /*
     * Check whether the anchor edge of a range is in a `node` and at an
     * offset between `start` and `end`.
     */
    public hasAnchorBetween(node: AnyNode, start: number, end: number): boolean {
        return (
            this.anchorOffset <= end &&
            start <= this.anchorOffset &&
            this.hasAnchorIn(node)
        );
    }

    /*
     * Check whether the anchor edge of a range is in a `node`.
     */
    public hasAnchorIn(node: AnyNode): boolean {
        return node.object === 'text'
            ? node.key === this.anchorKey
            : this.anchorKey != null && node.hasDescendant(this.anchorKey);
    }

    /*
     * Check whether focus point of the range is at the end of a `node`.
     */
    public hasFocusAtEndOf(node: AnyNode): boolean {
        const last = getLast(node);
        return (
            this.focusKey === last.key && this.focusOffset === last.text.length
        );
    }

    /*
     * Check whether focus point of the range is at the start of a `node`.
     */
    public hasFocusAtStartOf(node: AnyNode): boolean {
        if (this.focusOffset !== 0) {
            return false;
        }
        const first = getFirst(node);
        return this.focusKey === first.key;
    }

    /*
     * Check whether the focus edge of a range is in a `node` and at an
     * offset between `start` and `end`.
     */
    public hasFocusBetween(node: AnyNode, start: number, end: number): boolean {
        return (
            start <= this.focusOffset &&
            this.focusOffset <= end &&
            this.hasFocusIn(node)
        );
    }

    /*
     * Check whether the focus edge of a range is in a `node`.
     */
    public hasFocusIn(node: AnyNode): boolean {
        return node.object === 'text'
            ? node.key === this.focusKey
            : this.focusKey != null && node.hasDescendant(this.focusKey);
    }

    /*
     * Check whether the range is at the start of a `node`.
     */
    public isAtStartOf(node: AnyNode): boolean {
        return this.isCollapsed && this.hasAnchorAtStartOf(node);
    }

    /*
     * Check whether the range is at the end of a `node`.
     */
    public isAtEndOf(node: AnyNode): boolean {
        return this.isCollapsed && this.hasAnchorAtEndOf(node);
    }

    /*
     * Focus the range.
     */
    public focus(): Range {
        return this.merge({
            isFocused: true
        });
    }

    /*
     * Blur the range.
     */

    public blur(): Range {
        return this.merge({
            isFocused: false
        });
    }

    /*
     * Unset the range.
     */
    public deselect(): Range {
        return this.merge({
            anchorKey: null,
            anchorOffset: 0,
            focusKey: null,
            focusOffset: 0,
            isFocused: false,
            isBackward: false
        });
    }

    /*
     * Flip the range.
     */
    public flip(): Range {
        return this.merge({
            anchorKey: this.focusKey,
            anchorOffset: this.focusOffset,
            focusKey: this.anchorKey,
            focusOffset: this.anchorOffset,
            isBackward: this.isBackward == null ? null : !this.isBackward
        });
    }

    /*
     * Move the anchor offset `n` characters.
     */
    public moveAnchor(n: number = 1): Range {
        const { anchorKey, focusKey, focusOffset, isBackward } = this;
        const anchorOffset = this.anchorOffset + n;
        return this.merge({
            anchorOffset,
            isBackward:
                anchorKey === focusKey ? anchorOffset > focusOffset : isBackward
        });
    }

    /*
     * Move the anchor offset `n` characters.
     */
    public moveFocus(n: number = 1): Range {
        const { anchorKey, anchorOffset, focusKey, isBackward } = this;
        const focusOffset = this.focusOffset + n;
        return this.merge({
            focusOffset,
            isBackward:
                focusKey === anchorKey ? anchorOffset > focusOffset : isBackward
        });
    }

    /*
     * Move the range's anchor point to a `key` and `offset`.
     */

    public moveAnchorTo(key: string, offset: number): Range {
        const { anchorKey, focusKey, focusOffset, isBackward } = this;
        return this.merge({
            anchorKey: key,
            anchorOffset: offset,
            isBackward:
                key === focusKey
                    ? offset > focusOffset
                    : key === anchorKey
                    ? isBackward
                    : null
        });
    }

    /*
     * Move the range's focus point to a `key` and `offset`.
     */
    public moveFocusTo(key: string, offset: number): Range {
        const { focusKey, anchorKey, anchorOffset, isBackward } = this;
        return this.merge({
            focusKey: key,
            focusOffset: offset,
            isBackward:
                key === anchorKey
                    ? anchorOffset > offset
                    : key === focusKey
                    ? isBackward
                    : null
        });
    }

    /*
     * Move the range to `anchorOffset`.
     */
    public moveAnchorOffsetTo(anchorOffset: number): Range {
        return this.merge({
            anchorOffset,
            isBackward:
                this.anchorKey === this.focusKey
                    ? anchorOffset > this.focusOffset
                    : this.isBackward
        });
    }

    /*
     * Move the range to `focusOffset`.
     */
    public moveFocusOffsetTo(focusOffset: number): Range {
        return this.merge({
            focusOffset,
            isBackward:
                this.anchorKey === this.focusKey
                    ? this.anchorOffset > focusOffset
                    : this.isBackward
        });
    }

    /*
     * Move the range to `anchorOffset` and `focusOffset`.
     */
    public moveOffsetsTo(anchorOffset: number, focusOffset: number = anchorOffset): Range {
        return this.moveAnchorOffsetTo(anchorOffset).moveFocusOffsetTo(
            focusOffset
        );
    }

    /*
     * Move the focus point to the anchor point.
     */

    public moveToAnchor(): Range {
        return this.moveFocusTo(this.anchorKey, this.anchorOffset);
    }

    /*
     * Move the anchor point to the focus point.
     */
    public moveToFocus(): Range {
        return this.moveAnchorTo(this.focusKey, this.focusOffset);
    }

    /*
     * Move the range's anchor point to the start of a `node`.
     */
    public moveAnchorToStartOf(node: AnyNode): Range {
        node = getFirst(node);
        return this.moveAnchorTo(node.key, 0);
    }

    /*
     * Move the range's anchor point to the end of a `node`.
     */
    public moveAnchorToEndOf(node: AnyNode): Range {
        node = getLast(node);
        return this.moveAnchorTo(node.key, node.text.length);
    }

    /*
     * Move the range's focus point to the start of a `node`.
     */
    public moveFocusToStartOf(node: AnyNode): Range {
        node = getFirst(node);
        return this.moveFocusTo(node.key, 0);
    }

    /*
     * Move the range's focus point to the end of a `node`.
     */
    public moveFocusToEndOf(node: AnyNode): Range {
        node = getLast(node);
        return this.moveFocusTo(node.key, node.text.length);
    }

    /*
     * Move to the entire range of `start` and `end` nodes.
     */
    public moveToRangeOf(start: AnyNode, end: AnyNode = start): Range {
        const range = this.isBackward ? this.flip() : this;
        return range.moveAnchorToStartOf(start).moveFocusToEndOf(end);
    }

    /*
     * Normalize the range, relative to a `node`, ensuring that the anchor
     * and focus nodes of the range always refer to leaf text nodes.
     */
    public normalize(node: Node): Range {
        const range = this;
        let { anchorOffset, focusOffset, isBackward } = range;
        const { anchorKey, focusKey } = range;

        const anchorOffsetType = typeof anchorOffset;
        const focusOffsetType = typeof focusOffset;

        if (anchorOffsetType !== 'number' || focusOffsetType !== 'number') {
            logger.warn(
                `The range offsets should be numbers, but they were of type "${anchorOffsetType}" and "${focusOffsetType}".`
            );
        }

        // If the range is unset, make sure it is properly zeroed out.
        if (anchorKey == null || focusKey == null) {
            return range.merge({
                anchorKey: null,
                anchorOffset: 0,
                focusKey: null,
                focusOffset: 0,
                isBackward: false
            });
        }

        // Get the anchor and focus nodes.
        let anchorNode = node.getDescendant(anchorKey);
        let focusNode = node.getDescendant(focusKey);

        // If the range is malformed, warn and zero it out.
        if (!anchorNode || !focusNode) {
            logger.warn(
                'The range was invalid and was reset. The range in question was:',
                range
            );

            const first = node.getFirstText();
            return range.merge({
                anchorKey: first ? first.key : null,
                anchorOffset: 0,
                focusKey: first ? first.key : null,
                focusOffset: 0,
                isBackward: false
            });
        }

        // If the anchor node isn't a text node, match it to one.
        if (anchorNode.object !== 'text') {
            logger.warn(
                'The range anchor was set to a Node that is not a Text node. This should not happen and can degrade performance. The node in question was:',
                anchorNode
            );

            const nextAnchorNode = anchorNode.getTextAtOffset(anchorOffset);
            const offset = anchorNode.getOffset(nextAnchorNode.key);
            anchorOffset = anchorOffset - offset;
            anchorNode = nextAnchorNode;
        }

        // If the focus node isn't a text node, match it to one.
        if (focusNode.object !== 'text') {
            logger.warn(
                'The range focus was set to a Node that is not a Text node. This should not happen and can degrade performance. The node in question was:',
                focusNode
            );

            const nextFocusNode = focusNode.getTextAtOffset(focusOffset);
            const offset = focusNode.getOffset(nextFocusNode.key);
            focusOffset = focusOffset - offset;
            focusNode = nextFocusNode;
        }

        // If `isBackward` is not set, derive it.
        if (isBackward == null) {
            if (anchorNode.key === focusNode.key) {
                isBackward = anchorOffset > focusOffset;
            } else {
                isBackward = !node.areDescendantsSorted(
                    anchorNode.key,
                    focusNode.key
                );
            }
        }

        const anchorText = node.getDescendant(anchorKey);
        const focusText = node.getDescendant(focusKey);

        // Normalize offsets to be inside their respective text
        anchorOffset = Math.min(
            Math.max(0, anchorOffset),
            anchorText.text.length
        );
        focusOffset = Math.min(Math.max(0, focusOffset), focusText.text.length);

        // Merge in any updated properties.
        return range.merge({
            anchorKey: anchorNode.key,
            anchorOffset,
            focusKey: focusNode.key,
            focusOffset,
            isBackward
        });
    }

    /*
     * Return a JSON representation of the range.
     */
    public toJS(): RangeJSON {
        const object = {
            object: this.object,
            anchorKey: this.anchorKey,
            anchorOffset: this.anchorOffset,
            focusKey: this.focusKey,
            focusOffset: this.focusOffset,
            isBackward: this.isBackward,
            isFocused: this.isFocused,
            marks:
                this.marks == null
                    ? null
                    : this.marks.toArray().map(m => m.toJS()),
            isAtomic: this.isAtomic
        };

        return object;
    }
}

/*
 * Attach a pseudo-symbol for type checking.
 */

Range.prototype[MODEL_TYPES.RANGE] = true;

/*
 * Mix in some "move" convenience methods.
 */

const MOVE_METHODS = [
    ['move', ''],
    ['move', 'To'],
    ['move', 'ToStartOf'],
    ['move', 'ToEndOf']
];

MOVE_METHODS.forEach(([p, s]) => {
    Range.prototype[`${p}${s}`] = function(...args) {
        return this[`${p}Anchor${s}`](...args)[`${p}Focus${s}`](...args);
    };
});

/*
 * Mix in the "start", "end" and "edge" convenience methods.
 */

const EDGE_METHODS = [
    ['has', 'AtStartOf', true],
    ['has', 'AtEndOf', true],
    ['has', 'Between', true],
    ['has', 'In', true],
    ['collapseTo', ''],
    ['move', ''],
    ['moveTo', ''],
    ['move', 'To'],
    ['move', 'OffsetTo']
];

EDGE_METHODS.forEach(([p, s, hasEdge]) => {
    const anchor = `${p}Anchor${s}`;
    const focus = `${p}Focus${s}`;

    Range.prototype[`${p}Start${s}`] = function(...args) {
        return this.isBackward ? this[focus](...args) : this[anchor](...args);
    };

    Range.prototype[`${p}End${s}`] = function(...args) {
        return this.isBackward ? this[anchor](...args) : this[focus](...args);
    };

    if (hasEdge) {
        Range.prototype[`${p}Edge${s}`] = function(...args) {
            return this[anchor](...args) || this[focus](...args);
        };
    }
});

/*
 * Mix in some aliases for convenience / parallelism with the browser APIs.
 */

const ALIAS_METHODS = [
    ['collapseTo', 'moveTo'],
    ['collapseToAnchor', 'moveToAnchor'],
    ['collapseToFocus', 'moveToFocus'],
    ['collapseToStart', 'moveToStart'],
    ['collapseToEnd', 'moveToEnd'],
    ['collapseToStartOf', 'moveToStartOf'],
    ['collapseToEndOf', 'moveToEndOf'],
    ['extend', 'moveFocus'],
    ['extendTo', 'moveFocusTo'],
    ['extendToStartOf', 'moveFocusToStartOf'],
    ['extendToEndOf', 'moveFocusToEndOf']
];

ALIAS_METHODS.forEach(([alias, method]) => {
    Range.prototype[alias] = function(...args) {
        return this[method](...args);
    };
});

/*
 * Get the first text of a `node`.
 */
function getFirst(node: AnyNode): Text | null {
    return node.object === 'text' ? node : node.getFirstText();
}

/*
 * Get the last text of a `node`.
 */
function getLast(node: AnyNode): Text | null {
    return node.object === 'text' ? node : node.getLastText();
}

export default Range;
