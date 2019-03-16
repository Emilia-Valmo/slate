/*
 * Schema violations.
 */

export const CHILD_OBJECT_INVALID = 'child_object_invalid';
export const CHILD_REQUIRED = 'child_required';
export const CHILD_TYPE_INVALID = 'child_type_invalid';
export const CHILD_UNKNOWN = 'child_unknown';
export const FIRST_CHILD_OBJECT_INVALID = 'first_child_object_invalid';
export const FIRST_CHILD_TYPE_INVALID = 'first_child_type_invalid';
export const LAST_CHILD_OBJECT_INVALID = 'last_child_object_invalid';
export const LAST_CHILD_TYPE_INVALID = 'last_child_type_invalid';
export const NODE_DATA_INVALID = 'node_data_invalid';
export const NODE_IS_VOID_INVALID = 'node_is_void_invalid';
export const NODE_MARK_INVALID = 'node_mark_invalid';
export const NODE_TEXT_INVALID = 'node_text_invalid';
export const PARENT_OBJECT_INVALID = 'parent_object_invalid';
export const PARENT_TYPE_INVALID = 'parent_type_invalid';

export type SchemaViolation =
    | typeof CHILD_OBJECT_INVALID
    | typeof CHILD_REQUIRED
    | typeof CHILD_TYPE_INVALID
    | typeof CHILD_UNKNOWN
    | typeof FIRST_CHILD_OBJECT_INVALID
    | typeof FIRST_CHILD_TYPE_INVALID
    | typeof LAST_CHILD_OBJECT_INVALID
    | typeof LAST_CHILD_TYPE_INVALID
    | typeof NODE_DATA_INVALID
    | typeof NODE_IS_VOID_INVALID
    | typeof NODE_MARK_INVALID
    | typeof NODE_TEXT_INVALID
    | typeof PARENT_OBJECT_INVALID
    | typeof PARENT_TYPE_INVALID;
