import Change from './models/change';
import Schema from './models/schema';
import Stack from './models/stack';
import Value from './models/value';

export interface EditorContainer {
    readOnly: boolean;
    value: Value;
    stack: Stack;
    schema: Schema;
    element: HTMLElement;
    onChange: (change: Change) => void;
    change: (fn: (change: Change) => Change) => void;
}
