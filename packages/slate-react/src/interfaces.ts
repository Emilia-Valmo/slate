import {
    Block,
    Change,
    EditorContainer,
    Inline,
    Mark,
    Value
} from '@gitbook/slate';
import { Set } from 'immutable';
import * as React from 'react';

import PluginsStack from '../plugins/stack';

export interface NodeDOMAttributes {
    'data-key': string;
    dir?: 'rtl';
}

export interface MarkDOMAttributes {
    'data-slate-leaf': true;
}

/*
 * Mutable representation of the editor.
 */
export interface EditorContainer {
    readOnly: boolean;
    value: Value;
    stack: PluginsStack;
    element: HTMLElement;
    onChange: (change: Change) => void;
    change: (fn: (change: Change) => Change) => void;
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
    children: React.ReactNode;
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
    children: React.ReactNode;
    attributes: MarkDOMAttributes;
}
