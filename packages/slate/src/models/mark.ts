import { Map, Record, Set } from 'immutable';
import memoize from 'immutablejs-record-memoize';
import isPlainObject from 'is-plain-object';

import MODEL_TYPES, { isType } from '../constants/model-types';
import Data, { DataJSON, DataMap } from './data';

export interface MarkProperties {
    data: DataMap;
    type: string;
}

// JSON representation of a mark
export interface MarkJSON {
    object: 'mark';
    data: DataJSON;
    type: string;
}

// Type from what a mark can be created
type MaybeMark = Mark | string | Partial<MarkJSON>;

/*
 * Mark.
 */
class Mark extends Record<MarkProperties>({
    data: new Map(),
    type: ''
}) {
    /*
     * Object.
     */
    get object(): 'mark' {
        return 'mark';
    }

    /*
     * Check if `any` is a `Mark`.
     */

    public static isMark(input: any): input is Mark {
        return isType('MARK', input);
    }

    /*
     * Create a new `Mark` with `attrs`.
     */
    public static create(attrs: MaybeMark = {}): Mark {
        if (Mark.isMark(attrs)) {
            return attrs;
        }

        if (typeof attrs === 'string') {
            attrs = { type: attrs };
        }

        if (isPlainObject(attrs)) {
            return Mark.fromJS(attrs);
        }

        throw new Error(
            `\`Mark.create\` only accepts objects, strings or marks, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a set of marks.
     */
    public static createSet(elements: Set<MaybeMark> | MaybeMark[]): Set<Mark> {
        if (Set.isSet(elements) || Array.isArray(elements)) {
            const marks = new Set(elements.map(Mark.create));
            return marks;
        }

        if (elements == null) {
            return Set();
        }

        throw new Error(
            `\`Mark.createSet\` only accepts sets, arrays or null, but you passed it: ${elements}`
        );
    }

    /*
     * Create a dictionary of settable mark properties from `attrs`.
     */
    public static createProperties(
        attrs: MaybeMark = {}
    ): Partial<MarkProperties> {
        if (Mark.isMark(attrs)) {
            return {
                data: attrs.data,
                type: attrs.type
            };
        }

        if (typeof attrs === 'string') {
            return { type: attrs };
        }

        if (isPlainObject(attrs)) {
            const props: Partial<MarkProperties> = {};
            if ('type' in attrs) {
                props.type = attrs.type;
            }
            if ('data' in attrs) {
                props.data = Data.create(attrs.data);
            }
            return props;
        }

        throw new Error(
            `\`Mark.createProperties\` only accepts objects, strings or marks, but you passed it: ${attrs}`
        );
    }

    /*
     * Create a `Mark` from a JSON `object`.
     */
    public static fromJS(object: Partial<MarkJSON>): Mark {
        const { data = {}, type } = object;

        if (typeof type !== 'string') {
            throw new Error('`Mark.fromJS` requires a `type` string.');
        }

        return new Mark({
            type,
            data: Data.fromJS(data)
        });
    }

    /*
     * Check if `any` is a set of marks.
     */
    public static isMarkSet(input: any): input is Set<Mark> {
        return Set.isSet(input) && input.every(item => Mark.isMark(item));
    }

    /*
     * Get the component for the node from a `schema`.
     *
     * @param {Schema} schema
     * @return {Component|Void}
     */

    public getComponent(schema) {
        return schema.__getComponent(this);
    }

    /*
     * Return a JSON representation of the mark.
     */
    public toJS(): MarkJSON {
        return {
            object: this.object,
            type: this.type,
            data: this.data.toJS()
        };
    }
}

/*
 * Attach a pseudo-symbol for type checking.
 */

Mark.prototype[MODEL_TYPES.MARK] = true;

/*
 * Memoize read methods.
 */

memoize(Mark.prototype, ['getComponent']);

export default Mark;
