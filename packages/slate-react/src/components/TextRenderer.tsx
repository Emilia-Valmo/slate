import { Block, EditorContainer, Inline, Range, Text } from '@gitbook/slate';
import { List, Set } from 'immutable';
import * as React from 'react';

import LeafRenderer from './LeafRenderer';

interface TextRendererProps {
    block: Block;
    decorations: List<Range>;
    editor: EditorContainer;
    node: Text;
    parent: Inline | Block;
}

/*
 * Component to render a text node and all its leaves.
 */
const PureTextRenderer = React.memo(function TextRenderer(
    props: TextRendererProps
): React.ReactElement {
    const { block, decorations, editor, node, parent } = props;
    const { value } = editor;
    const { document } = value;
    const { key } = node;

    const decs = decorations.filter(d => {
        const { startKey, endKey } = d;
        if (startKey === key || endKey === key) {
            return true;
        }
        if (startKey === endKey) {
            return false;
        }
        const startsBefore = document.areDescendantsSorted(startKey, key);
        if (!startsBefore) {
            return false;
        }
        const endsAfter = document.areDescendantsSorted(key, endKey);
        return endsAfter;
    });

    // PERF: Take advantage of cache by avoiding arguments
    const leaves = decs.size === 0 ? node.getLeaves() : node.getLeaves(decs);
    let offset = 0;

    const children = leaves.map((leaf, index) => {
        const child = (
            <LeafRenderer
                key={`${node.key}-${index}`}
                block={block}
                editor={editor}
                index={index}
                marks={leaf.marks}
                node={node}
                offset={offset}
                parent={parent}
                leaves={leaves}
                text={leaf.text}
            />
        );

        offset += leaf.text.length;
        return child;
    });

    return <span data-key={key}>{children}</span>;
},
areEqual);

function areEqual(p: TextRendererProps, n: TextRendererProps): boolean {
    // If the node has changed, update. PERF: There are cases where it will have
    // changed, but it's properties will be exactly the same (eg. copy-paste)
    // which this won't catch. But that's rare and not a drag on performance, so
    // for simplicity we just let them through.
    if (n.node !== p.node) {
        return false;
    }

    // If the node parent is a block node, and it was the last child of the
    // block, re-render to cleanup extra `\n`.
    if (n.parent.object === 'block') {
        const pLast = p.parent.nodes.last();
        const nLast = n.parent.nodes.last();
        if (p.node === pLast && n.node !== nLast) {
            return false;
        }
    }

    // Re-render if the current decorations have changed.
    if (!n.decorations.equals(p.decorations)) {
        return false;
    }

    // Otherwise, don't update.
    return true;
}

export default PureTextRenderer;
