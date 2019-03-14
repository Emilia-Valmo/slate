import { Block, EditorContainer, Inline, Range } from '@gitbook/slate';
import { Set } from 'immutable';
import * as React from 'react';
import { Inline, Mark } from '../../slate/src/index';

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
export interface NodeProps {
    node: Block | Inline;
    editor: EditorContainer;
    isFocused: boolean;
    isSelected: boolean;
    ancestors: Array<Block | Inline>;

    // Deprecated, use editor.readOnly instead
    readOnly: boolean;

    // Deprecated, use ancestors instead
    parent: Block | Inline;

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
