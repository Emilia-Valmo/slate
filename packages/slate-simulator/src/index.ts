import { EditorContainer, Stack, Value } from '@gitbook/slate';

/*
 * Event handlers that can be simulated.
 */
const EVENT_HANDLERS = [
    'onBeforeInput',
    'onBlur',
    'onCopy',
    'onCut',
    'onDrop',
    'onFocus',
    'onKeyDown',
    'onKeyUp',
    'onPaste',
    'onSelect'
];

/*
 * Simulator to run tests on Slate plugins.
 */
class Simulator {
    public value: Value;
    public stack: Stack;
    public props: object;

    /*
     * Create a new `Simulator` with `plugins` and an initial `value`.
     */
    constructor(props: { plugins: any[]; value: Value }) {
        const { plugins, value } = props;
        const stack = new Stack({ plugins });

        this.props = props;
        this.stack = stack;
        this.value = value;
    }
}

/*
 * Generate the event simulators.
 */

EVENT_HANDLERS.forEach(handler => {
    const method = getMethodName(handler);

    Simulator.prototype[method] = function(e) {
        if (e == null) {
            e = {};
        }

        const { stack, value } = this;
        const editor = createEditor(this);
        const event = createEvent(e);
        const change = value.change();

        stack.run(handler, event, change, editor);
        stack.run('onChange', change, editor);

        this.value = change.value;
        return this;
    };
});

/*
 * Get the method name from a `handler` name.
 */
function getMethodName(handler: string): string {
    return handler.charAt(2).toLowerCase() + handler.slice(3);
}

/*
 * Create a fake editor from a `stack` and `value`.
 * TODO
 */
function createEditor(simulator: Simulator): EditorContainer {
    const editor = {
        getSchema: () => simulator.stack.schema,
        getState: () => simulator.value,
        readOnly: false
    };

    return editor;
}

/*
 * Create a fake event with `attributes`.
 */
function createEvent(attributes: object): object {
    const event = {
        preventDefault: () => (event.isDefaultPrevented = true),
        stopPropagation: () => (event.isPropagationStopped = true),
        isDefaultPrevented: false,
        isPropagationStopped: false,
        ...attributes
    };

    return event;
}

export default Simulator;
export { createEditor, createEvent };
