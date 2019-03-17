import Debug from 'debug';
import { Record } from 'immutable';
import memoize from 'immutablejs-record-memoize';
import mergeWith from 'lodash/mergeWith';

import {
    CHILD_OBJECT_INVALID,
    CHILD_REQUIRED,
    CHILD_TYPE_INVALID,
    CHILD_UNKNOWN,
    FIRST_CHILD_OBJECT_INVALID,
    FIRST_CHILD_TYPE_INVALID,
    LAST_CHILD_OBJECT_INVALID,
    LAST_CHILD_TYPE_INVALID,
    NODE_DATA_INVALID,
    NODE_IS_VOID_INVALID,
    NODE_MARK_INVALID,
    NODE_TEXT_INVALID,
    PARENT_OBJECT_INVALID,
    PARENT_TYPE_INVALID,
    SchemaViolation
} from '@gitbook/slate-schema-violations';

import MODEL_TYPES from '../constants/model-types';
import Block from './block';
import Change from './change';
import Document from './document';
import Inline from './inline';
import Text from './text';

type AnyNode = Block | Inline | Text | Document;

// Callback when running a normalization
export type SchemaNormalizeFn = (change: Change) => void;

export type ValidateNodeFn = (
    node: AnyNode
) => null | undefined | SchemaNormalizeFn;

// Rule for a node (used for first, parent, etc)
interface NodeSchemaRule {
    /** Types that should be allowed as a parent */
    types?: string[];
    /** Object kinds that should be allowed as a child */
    objects?: Array<'text' | 'inline' | 'block'>;
}

// Rule for a block/document/inline
export interface SchemaRule {
    isVoid?: boolean;
    text?: RegExp;
    /** Validation for marks */
    marks?: Array<{
        type: string;
    }>;
    /** Validation for the data of the node */
    data?: {
        [key: string]: (value: any) => boolean;
    };
    /** Validation for the parent */
    parent?: NodeSchemaRule;
    first?: NodeSchemaRule;
    last?: NodeSchemaRule;
    /** Validation for inner nodes */
    nodes?: Array<
        NodeSchemaRule & {
            min?: number;
            max?: number;
        }
    >;
    normalize?: (
        change: Change,
        violation: SchemaViolation,
        context: SchemaNormalizeContext
    ) => void;
}

// Context when normalizing a node (it depends on the violation)
export interface SchemaNormalizeContext {
    node: AnyNode;
    child: AnyNode;
    rule: SchemaRule;
}

const debug = Debug('slate:schema');

/*
 * Immutable model to represent a schema.
 */
class Schema extends Record({
    validations: [],
    document: {},
    blocks: {},
    inlines: {}
}) {
    /*
     * Object.
     */

    get object(): 'schema' {
        return 'schema';
    }

    /*
     * Create a new `Schema` with a set of rules
     */
    public static create(
        attrs:
            | Schema
            | {
                  validations?: ValidateNodeFn[];
                  document?: SchemaRule;
                  blocks?: { [type: string]: SchemaRule };
                  inlines?: { [type: string]: SchemaRule };
              } = {}
    ): Schema {
        if (Schema.isSchema(attrs)) {
            return attrs;
        }

        return new Schema(attrs);
    }

    /*
     * Check if `any` is a `Schema`.
     */
    public static isSchema(input: any): input is Schema {
        return !!(input && input[MODEL_TYPES.SCHEMA]);
    }

    // Properties
    public readonly validations: ValidateNodeFn[];
    public readonly document: SchemaRule;
    public readonly blocks: { [type: string]: SchemaRule };
    public readonly inlines: { [type: string]: SchemaRule };

    /*
     * Combine this schema with another one.
     */
    public combineWith(schema: Schema | Schema[]): Schema {
        if (Array.isArray(schema)) {
            return schema.reduce((r, s) => r.combineWith(s), this);
        }

        const newSchema = {
            validations: [...this.validations, ...schema.validations],
            document: { ...this.document },
            blocks: { ...this.blocks },
            inlines: { ...this.inlines }
        };

        mergeWith(newSchema.document, schema.document, customizer);
        mergeWith(newSchema.blocks, schema.blocks, customizer);
        mergeWith(newSchema.inlines, schema.inlines, customizer);

        return new Schema(newSchema);
    }

    /*
     * Get the first invalid node.
     */
    public getFirstInvalidNode(node: AnyNode): AnyNode | null {
        if (Text.isText(node)) {
            return this.validateNode(node) ? node : null;
        }

        let result = null;

        node.nodes.find(child => {
            result = this.validateNode(child)
                ? child
                : this.getFirstInvalidNode(child);
            return result;
        });
        return result;
    }

    /*
     * Get the rule for a node.
     */
    public getRule(node: AnyNode): SchemaRule | undefined {
        switch (node.object) {
            case 'document':
                return this.document;
            case 'block':
                return this.blocks[node.type];
            case 'inline':
                return this.inlines[node.type];
        }
    }

    /*
     * Get a dictionary of the parent rule validations by child type.
     */
    public getParentRules(): { [type: string]: SchemaRule } {
        const { blocks, inlines } = this;
        const parents = {};

        for (const key of Object.keys(blocks)) {
            const rule = blocks[key];
            if (rule.parent == null) {
                continue;
            }
            parents[key] = rule;
        }

        for (const key of Object.keys(inlines)) {
            const rule = inlines[key];
            if (rule.parent == null) {
                continue;
            }
            parents[key] = rule;
        }

        return Object.keys(parents).length === 0 ? null : parents;
    }

    /*
     * Fail validation by returning a normalizing change function.
     */
    public fail(
        violation: SchemaViolation,
        context: SchemaNormalizeContext
    ): SchemaNormalizeFn {
        return (change: Change) => {
            debug(`normalizing`, { violation, context });
            const { rule } = context;
            const { size } = change.operations;
            if (rule.normalize) {
                rule.normalize(change, violation, context);
            }
            if (change.operations.size > size) {
                return;
            }
            this.normalize(change, violation, context);
        };
    }

    /*
     * Normalize an invalid value with `violation` and `context`.
     */
    public normalize(
        change: Change,
        violation: SchemaViolation,
        context: SchemaNormalizeContext
    ): void {
        switch (violation) {
            case CHILD_OBJECT_INVALID:
            case CHILD_TYPE_INVALID:
            case CHILD_UNKNOWN:
            case FIRST_CHILD_OBJECT_INVALID:
            case FIRST_CHILD_TYPE_INVALID:
            case LAST_CHILD_OBJECT_INVALID:
            case LAST_CHILD_TYPE_INVALID: {
                const { child, node } = context;
                return child.object === 'text' &&
                    node.object === 'block' &&
                    node.nodes.size === 1
                    ? change.removeNodeByKey(node.key)
                    : change.removeNodeByKey(child.key);
            }

            case CHILD_REQUIRED:
            case NODE_TEXT_INVALID:
            case PARENT_OBJECT_INVALID:
            case PARENT_TYPE_INVALID: {
                const { node } = context;
                return node.object === 'document'
                    ? node.nodes.forEach(child =>
                          change.removeNodeByKey(child.key)
                      )
                    : change.removeNodeByKey(node.key);
            }

            case NODE_DATA_INVALID: {
                const { node, key } = context;
                return node.data.get(key) === undefined &&
                    node.object !== 'document'
                    ? change.removeNodeByKey(node.key)
                    : change.setNodeByKey(node.key, {
                          data: node.data.delete(key)
                      });
            }

            case NODE_IS_VOID_INVALID: {
                const { node } = context;
                return change.setNodeByKey(node.key, { isVoid: !node.isVoid });
            }

            case NODE_MARK_INVALID: {
                const { node, mark } = context;
                return node
                    .getTexts()
                    .forEach(t =>
                        change.removeMarkByKey(t.key, 0, t.text.length, mark)
                    );
            }
        }
    }

    /*
     * Validate a `node` with the schema, returning a function that will fix the
     * invalid node, or void if the node is valid.
     */
    public validateNode(node: AnyNode): SchemaNormalizeFn | undefined {
        // Run custom validations
        for (const validation of this.validations) {
            const ret = validation(node);
            if (ret != null) {
                return ret;
            }
        }

        if (node.object === 'text') {
            return;
        }

        const rule = this.getRule(node) || {};
        const parents = this.getParentRules();
        const ctx = { node, rule };

        if (rule.isVoid != null) {
            if (node.isVoid !== rule.isVoid) {
                return this.fail(NODE_IS_VOID_INVALID, ctx);
            }
        }

        if (rule.data != null) {
            for (const key of Object.keys(rule.data)) {
                const fn = rule.data[key];
                const value = node.data.get(key);

                if (!fn(value)) {
                    return this.fail(NODE_DATA_INVALID, { ...ctx, key, value });
                }
            }
        }

        if (rule.marks != null) {
            const marks = node.getMarks().toArray();

            for (const mark of marks) {
                if (!rule.marks.some(def => def.type === mark.type)) {
                    return this.fail(NODE_MARK_INVALID, { ...ctx, mark });
                }
            }
        }

        if (rule.text != null) {
            const { text } = node;

            if (!rule.text.test(text)) {
                return this.fail(NODE_TEXT_INVALID, { ...ctx, text });
            }
        }

        if (rule.first != null) {
            const { objects, types } = rule.first;
            const child = node.nodes.first();

            if (child && objects && !objects.includes(child.object)) {
                return this.fail(FIRST_CHILD_OBJECT_INVALID, { ...ctx, child });
            }

            if (child && types && !types.includes(child.type)) {
                return this.fail(FIRST_CHILD_TYPE_INVALID, { ...ctx, child });
            }
        }

        if (rule.last != null) {
            const { objects, types } = rule.last;
            const child = node.nodes.last();

            if (child && objects && !objects.includes(child.object)) {
                return this.fail(LAST_CHILD_OBJECT_INVALID, { ...ctx, child });
            }

            if (child && types && !types.includes(child.type)) {
                return this.fail(LAST_CHILD_TYPE_INVALID, { ...ctx, child });
            }
        }

        if (rule.nodes != null || parents != null) {
            const children = node.nodes.toArray();
            const defs = rule.nodes != null ? rule.nodes.slice() : [];

            let offset;
            let min;
            let index;
            let def;
            let max;
            let child;

            function nextDef() {
                offset = offset == null ? null : 0;
                def = defs.shift();
                min = def && (def.min == null ? 0 : def.min);
                max = def && (def.max == null ? Infinity : def.max);
                return !!def;
            }

            function nextChild() {
                index = index == null ? 0 : index + 1;
                offset = offset == null ? 0 : offset + 1;
                child = children[index];
                if (max != null && offset === max) {
                    nextDef();
                }
                return !!child;
            }

            function rewind() {
                offset -= 1;
                index -= 1;
            }

            if (rule.nodes != null) {
                nextDef();
            }

            while (nextChild()) {
                if (
                    parents != null &&
                    child.object !== 'text' &&
                    child.type in parents
                ) {
                    const r = parents[child.type];

                    if (
                        r.parent.objects != null &&
                        !r.parent.objects.includes(node.object)
                    ) {
                        return this.fail(PARENT_OBJECT_INVALID, {
                            node: child,
                            parent: node,
                            rule: r
                        });
                    }

                    if (
                        r.parent.types != null &&
                        !r.parent.types.includes(node.type)
                    ) {
                        return this.fail(PARENT_TYPE_INVALID, {
                            node: child,
                            parent: node,
                            rule: r
                        });
                    }
                }

                if (rule.nodes != null) {
                    if (!def) {
                        return this.fail(CHILD_UNKNOWN, {
                            ...ctx,
                            child,
                            index
                        });
                    }

                    if (
                        def.objects != null &&
                        !def.objects.includes(child.object)
                    ) {
                        if (offset >= min && nextDef()) {
                            rewind();
                            continue;
                        }
                        return this.fail(CHILD_OBJECT_INVALID, {
                            ...ctx,
                            child,
                            index
                        });
                    }

                    if (def.types != null && !def.types.includes(child.type)) {
                        if (offset >= min && nextDef()) {
                            rewind();
                            continue;
                        }
                        return this.fail(CHILD_TYPE_INVALID, {
                            ...ctx,
                            child,
                            index
                        });
                    }
                }
            }

            if (rule.nodes != null) {
                while (min != null) {
                    if (offset < min) {
                        return this.fail(CHILD_REQUIRED, { ...ctx, index });
                    }

                    nextDef();
                }
            }
        }
    }
}

/*
 * A Lodash customizer for merging schema definitions. Special cases `objects`,
 * `marks` and `types` arrays to be unioned, and ignores new `null` values.
 */
function customizer<K extends keyof SchemaRule>(
    target: SchemaRule[K] | undefined,
    source: SchemaRule[K] | undefined,
    key: K
): SchemaRule[K] {
    if (key === 'normalize' && source && target) {
        return (
            change: Change,
            violation: SchemaViolation,
            context: SchemaNormalizeContext
        ) => {
            const original = change.operations.size;
            target(change, violation, context);

            if (change.operations.size > original) {
                return;
            }

            source(change, violation, context);
        };
    } else if (key === 'objects' || key === 'types' || key === 'marks') {
        return target == null ? source : target.concat(source);
    } else {
        return source == null ? target : source;
    }
}

/*
 * Attach a pseudo-symbol for type checking.
 */

Schema.prototype[MODEL_TYPES.SCHEMA] = true;

/*
 * Memoize read methods.
 */

memoize(Schema.prototype, [
    'getParentRules',
    'getFirstInvalidNode',
    'validateNode'
]);

export default Schema;
