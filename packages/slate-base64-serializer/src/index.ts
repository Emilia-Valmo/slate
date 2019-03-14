import { Node, Value } from '@gitbook/slate';
import { atob, btoa } from 'isomorphic-base64';

/*
 * Encode a JSON `object` as base-64 `string`.
 */
function encode(object: any): string {
    const content = JSON.stringify(object);
    const encoded = btoa(encodeURIComponent(content));
    return encoded;
}

/*
 * Decode a base-64 `string` to a JSON `object`.
 */
function decode<T>(content: string): T {
    const decoded = decodeURIComponent(atob(content));
    const object = JSON.parse(decoded);
    return object;
}

/*
 * Deserialize a Value `string`.
 */
function deserialize(content: string, options: any): Value {
    const raw = decode(content);
    const value = Value.fromJS(raw, options);
    return value;
}

/*
 * Deserialize a Node `string`.
 */
function deserializeNode(content: string, options: any): Node {
    const raw = decode(content);
    const node = Node.fromJS(raw, options);
    return node;
}

/*
 * Serialize a `value`.
 */
function serialize(value: Value, options: any): string {
    const raw = value.toJS(options);
    const encoded = encode(raw);
    return encoded;
}

/*
 * Serialize a `node`.
 */
function serializeNode(node: Node, options: any): string {
    const raw = node.toJS(options);
    const encoded = encode(raw);
    return encoded;
}

export default {
    deserialize,
    deserializeNode,
    serialize,
    serializeNode
};
