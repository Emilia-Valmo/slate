/*
 * Offset key parser regex.
 */

const PARSER = /^([\w-]+)(?::(\d+))?$/;

/*
 * Parse an offset key `string`.
 */
function parse(content: string): { key: string; index: number } {
    const matches = PARSER.exec(content);

    if (!matches) {
        throw new Error(`Invalid offset key string "${content}".`);
    }

    return {
        key: matches[1],
        index: parseInt(matches[2], 10)
    };
}

/*
 * Stringify an offset key `object`.
 */
function stringify(object: { key: string; index: number }): string {
    return `${object.key}:${object.index}`;
}

export default {
    parse,
    stringify
};
