import { Block, Change, Inline } from '@gitbook/slate';
import * as React from 'react';
import { EditorContainer, MarkProps, NodeProps } from '../interfaces';

type EvenHandlerFn<EventType extends Event> = (
    event: EventType,
    change: Change,
    editor: EditorContainer
) => void;

export interface Plugin {
    onBeforeInput?: EvenHandlerFn<Event>;
    onFocus?: EvenHandlerFn<Event>;
    onBlur?: EvenHandlerFn<Event>;
    onClick?: EvenHandlerFn<Event>;
    onCopy?: EvenHandlerFn<Event>;
    onCut?: EvenHandlerFn<Event>;
    onDragEnter?: EvenHandlerFn<Event>;
    onDragEnd?: EvenHandlerFn<Event>;
    onDragOver?: EvenHandlerFn<Event>;
    onDragStart?: EvenHandlerFn<Event>;
    onDragExit?: EvenHandlerFn<Event>;
    onDragLeave?: EvenHandlerFn<Event>;
    onDrop?: EvenHandlerFn<Event>;
    onInput?: EvenHandlerFn<Event>;
    onKeyDown?: EvenHandlerFn<Event>;
    onPaste?: EvenHandlerFn<Event>;
    onSelect?: EvenHandlerFn<Event>;
    onCompositionEnd?: EvenHandlerFn<Event>;
    onCompositionStart?: EvenHandlerFn<Event>;
    /** Callback when a change is made */
    onChange?: (change: Change, editor: EditorContainer) => void;
    /** Function called when rendering a node */
    renderNode?: (props: NodeProps<Block | Inline>) => React.Node;
    /** Function called when rendering a mark */
    renderMark?: (props: MarkProps) => React.Node;
}
