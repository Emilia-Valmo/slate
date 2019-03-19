/*
 * Slate-specific model types.
 */

const MODEL_TYPES = {
    BLOCK: '@@__SLATE_BLOCK__@@',
    CHANGE: '@@__SLATE_CHANGE__@@',
    CHARACTER: '@@__SLATE_CHARACTER__@@',
    DOCUMENT: '@@__SLATE_DOCUMENT__@@',
    HISTORY: '@@__SLATE_HISTORY__@@',
    INLINE: '@@__SLATE_INLINE__@@',
    LEAF: '@@__SLATE_LEAF__@@',
    MARK: '@@__SLATE_MARK__@@',
    OPERATION: '@@__SLATE_OPERATION__@@',
    RANGE: '@@__SLATE_RANGE__@@',
    SCHEMA: '@@__SLATE_SCHEMA__@@',
    TEXT: '@@__SLATE_TEXT__@@',
    VALUE: '@@__SLATE_VALUE__@@'
};

/*
 * Export type identification function
 */
export function isType(type: string, input: any): boolean {
    return !!(input && input[MODEL_TYPES[type]]);
}

export default MODEL_TYPES;
