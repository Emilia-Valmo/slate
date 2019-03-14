import { Block, Mark, Node, Value } from '@gitbook/slate';
import { Set } from 'immutable';

/*
 * Deserialize a plain text `string` to a Slate value.
 */
function deserialize(
    content: string,
    options: {
        toJSON?: boolean;
        defaultBlock?: string;
        defaultMarks?: string[] | Set<string>;
    } = {}
): Value {
    let { defaultBlock = 'line', defaultMarks = [], toJSON = false } = options;

    if (Set.isSet(defaultMarks)) {
        defaultMarks = defaultMarks.toArray();
    }

    defaultBlock = Node.createProperties(defaultBlock);
    defaultMarks = defaultMarks.map(Mark.createProperties);

    const json = {
        object: 'value',
        document: {
            object: 'document',
            data: {},
            nodes: content.split('\n').map(line => {
                return {
                    ...defaultBlock,
                    object: 'block',
                    isVoid: false,
                    data: {},
                    nodes: [
                        {
                            object: 'text',
                            leaves: [
                                {
                                    object: 'leaf',
                                    text: line,
                                    marks: defaultMarks
                                }
                            ]
                        }
                    ]
                };
            })
        }
    };

    const ret = toJSON ? json : Value.fromJS(json);
    return ret;
}

/*
 * Serialize a Slate `value` to a plain text string.
 */
function serialize(value: Value): string {
    return serializeNode(value.document);
}

/*
 * Serialize a `node` to plain text.
 */
function serializeNode(node: Node): string {
    if (
        node.object === 'document' ||
        (node.object === 'block' && Block.isBlockList(node.nodes))
    ) {
        return node.nodes.map(serializeNode).join('\n');
    } else {
        return node.text;
    }
}

export default {
    deserialize,
    serialize
};
