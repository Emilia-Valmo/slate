import { Block, EditorContainer, Inline, Mark, Node } from '@gitbook/slate';
import { Set } from 'immutable';
import * as React from 'react';

export interface NodeDOMAttributes {
    'data-key': string;
    dir?: 'rtl';
}

export interface MarkDOMAttributes {
    'data-slate-leaf': true;
}

/*
 * Props passed to a component to render a node.
 */
export interface NodeProps<NodeType extends Block | Inline> {
    node: NodeType;
    parent: Block | Inline;
    editor: EditorContainer;
    isFocused: boolean;
    isSelected: boolean;
    children: React.Node;
    attributes: NodeDOMAttributes;
}

/*
 * Props passed to a component to render a mark.
 */
export interface MarkProps {
    mark: Mark;
    editor: EditorContainer;
    node: Block | Inline;
    offset: number;
    text: Text;
    marks: Set<Mark>;
    children: React.Node;
    attributes: MarkDOMAttributes;
}
