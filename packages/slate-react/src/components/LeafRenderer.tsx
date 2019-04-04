import {
    Block,
    EditorContainer,
    Inline,
    Leaf,
    Mark,
    Text
} from '@gitbook/slate';
import { List, Set } from 'immutable';
import * as React from 'react';

import { MarkDOMAttributes, MarkProps } from '../interfaces';
import OffsetKey from '../utils/offset-key';

interface LeafRendererProps {
    editor: EditorContainer;
    block: Block;
    node: Text;
    index: number;
    offset: number;
    text: Text;
    leaves: List<Leaf>;
    marks: Set<Mark>;
    parent: Block | Inline;
}

/*
 * Render a leaf of text with all of its marks.
 */
const PureLeafRenderer = React.memo(function LeafRenderer(
    props: LeafRendererProps
): React.ReactNode {
    const { marks, node, index, offset, text, editor } = props;
    const { stack } = editor;
    const leaf = renderLeafText(props);
    const attributes: MarkDOMAttributes = {
        'data-slate-leaf': true
    };

    const offsetKey = OffsetKey.stringify({
        key: node.key,
        index
    });

    return (
        <span data-offset-key={offsetKey}>
            {marks.reduce((children: React.ReactNode, mark: Mark) => {
                const markProps: MarkProps = {
                    editor,
                    mark,
                    marks,
                    node,
                    offset,
                    text,
                    children,
                    attributes
                };
                const element = stack.find('renderMark', markProps);
                return element || children;
            }, leaf)}
        </span>
    );
},
areEqual);

function renderLeafText(props: LeafRendererProps): React.ReactNode {
    const { block, node, text, index, parent, leaves } = props;

    // COMPAT: Render text inside void nodes with a zero-width space.
    // So the node can contain selection but the text is not visible.
    if (parent.isVoid) {
        return <span data-slate-zero-width="z">{'\u200B'}</span>;
    }

    // COMPAT: If this is the last text node in an empty block, render a zero-
    // width space that will convert into a line break when copying and pasting
    // to support expected plain text.
    if (
        text === '' &&
        parent.object === 'block' &&
        parent.text === '' &&
        parent.nodes.size === 1
    ) {
        return <span data-slate-zero-width="n">{'\u200B'}</span>;
    }

    // COMPAT: If the text is empty, it's because it's on the edge of an inline
    // void node, so we render a zero-width space so that the selection can be
    // inserted next to it still.
    if (text === '') {
        return <span data-slate-zero-width="z">{'\u200B'}</span>;
    }

    // COMPAT: Browsers will collapse trailing new lines at the end of blocks,
    // so we need to add an extra trailing new lines to prevent that.
    const lastText = block.getLastText();
    const lastChar = text.charAt(text.length - 1);
    const isLastText = node === lastText;
    const isLastLeaf = index === leaves.size - 1;
    if (isLastText && isLastLeaf && lastChar === '\n') {
        return `${text}\n`;
    }

    // Otherwise, just return the text.
    return text;
}

/*
 * Should we render the leaf ?
 */
function areEqual(
    props: LeafRendererProps,
    nextProps: LeafRendererProps
): boolean {
    // If any of the regular properties have changed, re-render.
    if (
        nextProps.index !== props.index ||
        nextProps.marks !== props.marks ||
        nextProps.parent !== props.parent ||
        nextProps.text !== props.text
    ) {
        return false;
    }

    // Otherwise, don't update.
    return true;
}

export default PureLeafRenderer;
