import * as React from 'react'
import { List } from 'immutable'
import { Block, Inline, Range } from '@gitbook/slate'

import TextRenderer from './TextRenderer'
import Editor from './Editor'

/*
 * Component to wrap the inner content of a void node.
 */
function VoidWrapper(props: {
    block: Block,
    editor: React.Ref<Editor>,
    decorations: List<Range>,
    readOnly: boolean,
    node: Block | Inline,
    ancestors: Block[],
    children: React.Node
}): React.Node {
    const { children, block, node, decorations, editor, readOnly, ancestors } = props
    const child = node.getFirstText()

    const Tag = node.object == 'block' ? 'div' : 'span'

    const spacer = (
        <Tag data-slate-spacer style={{
            height: 0,
            color: 'transparent',
            outline: 'none',
            position: 'absolute',
        }}>
            <TextRenderer
                block={node.object == 'block' ? node : block}
                decorations={decorations}
                editor={editor}
                key={child.key}
                node={child}
                ancestors={ancestors}
                readOnly={readOnly}
            />
        </Tag>
    )

    const content = (
        <Tag contentEditable={readOnly ? null : false}>{children}</Tag>
    )

    return (
        <Tag
            data-slate-void
            data-key={node.key}
            contentEditable={readOnly || node.object == 'block' ? null : false}
        >
            {readOnly ? null : spacer}
            {content}
        </Tag>
    )
}

export default VoidWrapper;