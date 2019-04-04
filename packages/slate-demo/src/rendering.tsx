import { Block, Inline } from '@gitbook/slate';
import { MarkProps, NodeProps } from '@gitbook/slate-react';
import React from 'react';

/*
 * Render a Slate node for demos
 */
function renderNode(props: NodeProps<Block | Inline>): React.ReactNode {
    const { attributes, children, node } = props;

    switch (node.type) {
        case 'paragraph':
            return <p {...attributes}>{children}</p>;
        case 'blockquote':
            return <blockquote {...attributes}>{children}</blockquote>;
        case 'heading-one':
            return <h1 {...attributes}>{children}</h1>;
        case 'heading-two':
            return <h2 {...attributes}>{children}</h2>;
        case 'heading-three':
            return <h3 {...attributes}>{children}</h3>;
        case 'bulleted-list':
            return <ul {...attributes}>{children}</ul>;
        case 'list-item':
            return <li {...attributes}>{children}</li>;
        case 'numbered-list':
            return <ol {...attributes}>{children}</ol>;
        case 'hr':
            return <hr />;
    }
}

/*
 * Render a Slate mark for demos
 */
function renderMark(props: MarkProps): React.ReactNode {
    const { children, mark, attributes } = props;

    switch (mark.type) {
        case 'bold':
            return <strong {...attributes}>{children}</strong>;
        case 'code':
            return <code {...attributes}>{children}</code>;
        case 'italic':
            return <em {...attributes}>{children}</em>;
        case 'underlined':
            return <u {...attributes}>{children}</u>;
    }
}

export { renderMark, renderNode };
