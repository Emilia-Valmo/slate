import { Block, Change, Container, Inline, Range } from '@gitbook/slate';
import { List } from 'immutable';
import * as React from 'react';
import { EditorContainer, MarkProps, NodeProps } from '../interfaces';

/** Handler for an event in the editor, it can return true to stop other handlers */
type EvenHandlerFn<EventType extends Event> = (
    event: EventType,
    change: Change,
    editor: EditorContainer
) => boolean | void;

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
    renderNode?: (
        props: NodeProps<Block | Inline | Container>
    ) => React.ReactNode;
    /** Function called when rendering a mark */
    renderMark?: (props: MarkProps) => React.ReactNode;
    /** Decorate a node with range of marks */
    decorateNode?: (
        node: Block | Inline | Container
    ) => Range[] | List<Range> | void;
    /** Function to force an update of a node component */
    shouldNodeComponentUpdate?: <T extends Block | Inline>(
        props: NodeProps<T>,
        nextProps: NodeProps<T>
    ) => boolean | null;
}
