import { Block, EditorContainer, Inline, Range } from '@gitbook/slate';
import { List } from 'immutable';
import * as React from 'react';

import TextRenderer from './TextRenderer';

/*
 * Component to wrap the inner content of a void node.
 */
function VoidWrapper(props: {
    block: Block;
    editor: EditorContainer;
    decorations: List<Range>;
    readOnly: boolean;
    node: Block | Inline;
    parent: Block | Inline;
    children: React.Node;
}): React.Node {
    const { children, block, node, decorations, editor, readOnly } = props;
    const child = node.getFirstText();

    const Tag = node.object === 'block' ? 'div' : 'span';

    const spacer = (
        <Tag
            data-slate-spacer
            style={{
                height: 0,
                color: 'transparent',
                outline: 'none',
                position: 'absolute'
            }}
        >
            <TextRenderer
                block={node.object === 'block' ? node : block}
                decorations={decorations}
                editor={editor}
                key={child.key}
                node={child}
                parent={node}
                readOnly={readOnly}
            />
        </Tag>
    );

    const content = (
        <Tag contentEditable={readOnly ? null : false}>{children}</Tag>
    );

    return (
        <Tag
            data-slate-void
            data-key={node.key}
            contentEditable={readOnly || node.object === 'block' ? null : false}
        >
            {readOnly ? null : spacer}
            {content}
        </Tag>
    );
}

export default VoidWrapper;
