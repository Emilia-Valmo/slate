import logger from '@gitbook/slate-dev-logger';
import Debug from 'debug';
import { List } from 'immutable';
import pick from 'lodash/pick';

import MODEL_TYPES, { isType } from '../constants/model-types';
import apply from '../operations/apply';
import Operation from './operation';
import Value from './value';

const debug = Debug('slate:change');

interface ApplyOperationOptions {
    merge?: boolean | null;
    save?: boolean;
    skip?: boolean | null;
}

interface ChangeFlags {
    normalize?: boolean;
    merge?: boolean;
    save?: boolean;
}

/*
 * Mutable interface to make changes to a value.
 */

class Change {
    public static debug = debug;

    /*
     * Check if `any` is a `Change`.
     */
    public static isChange = isType.bind(null, 'CHANGE');

    public value: Value;
    public operations: List<Operation>;
    public flags: ChangeFlags;

    /*
     * Types for all the change methods.
     */
    public normalizeDocument: () => Change;

    /*
     * Create a new `Change` with `attrs`.
     */
    constructor(attrs: {
        value: Value,
    } & ChangeFlags) {
        const { value } = attrs;
        this.value = value;
        this.operations = new List();

        this.flags = {
            normalize: true,
            ...pick(attrs, ['merge', 'save', 'normalize'])
        };
    }

    /*
     * Object.
     */
    get object(): 'change' {
        return 'change';
    }

    get kind(): 'change' {
        logger.deprecate(
            'slate@0.32.0',
            'The `kind` property of Slate objects has been renamed to `object`.'
        );
        return this.object;
    }

    /*
     * Apply an `operation` to the current value, saving the operation to the
     * history if needed.
     */
    public applyOperation(operation: Operation, options: ApplyOperationOptions = {}): Change {
        const { operations, flags } = this;
        let { value } = this;
        let { history } = value;

        // Default options to the change-level flags, this allows for setting
        // specific options for all of the operations of a given change.
        options = { ...flags, ...options };

        // Derive the default option values.
        const {
            merge = operations.size === 0 ? null : true,
            save = true,
            skip = null
        } = options;

        // Apply the operation to the value.
        debug('apply', { operation, save, merge });
        value = apply(value, operation);

        // If needed, save the operation to the history.
        if (history && save) {
            history = history.save(operation, { merge, skip });
            value = value.set('history', history);
        }

        // Update the mutable change object.
        this.value = value;
        this.operations = operations.push(operation);
        return this;
    }

    /*
     * Apply a series of `operations` to the current value.
     */
    public applyOperations(operations: Operation[], options?: ApplyOperationOptions): Change {
        operations.forEach(op => this.applyOperation(op, options));
        return this;
    }

    /*
     * Call a change `fn` with arguments.
     */
    public call<U extends any[]>(fn: (c: Change, ...args: U) => void, ...args: U): Change {
        fn(this, ...args);
        return this;
    }

    /*
     * Applies a series of change mutations and defers normalization until the end.
     */
    public withoutNormalization(customChange: (c: Change) => void): Change {
        const original = this.flags.normalize;
        this.setOperationFlag('normalize', false);

        try {
            customChange(this);
            // if the change function worked then run normalization
            this.normalizeDocument();
        } finally {
            // restore the flag to whatever it was
            this.setOperationFlag('normalize', original);
        }
        return this;
    }

    /*
     * Set an operation flag by `key` to `value`.
     */
    public setOperationFlag(key: string, value: any): Change {
        this.flags[key] = value;
        return this;
    }

    /*
     * Get the `value` of the specified flag by its `key`. Optionally accepts an `options`
     * object with override flags.
     */
    public getFlag<T>(key: string, options = {}): T | undefined {
        return options[key] !== undefined ? options[key] : this.flags[key];
    }

    /*
     * Unset an operation flag by `key`.
     */
    public unsetOperationFlag(key: string): Change {
        delete this.flags[key];
        return this;
    }
}

/*
 * Attach a pseudo-symbol for type checking.
 */

Change.prototype[MODEL_TYPES.CHANGE] = true;

export default Change;
