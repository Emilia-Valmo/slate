import {
    Block,
    Change,
    Inline,
    Mark,
    Plugin,
    Schema,
    Stack,
    Value
} from '@gitbook/slate';
import {
    IS_ANDROID,
    IS_BROWSER,
    IS_FIREFOX,
    IS_IOS,
    SUPPORTED_EVENTS
} from '@gitbook/slate-dev-environment';
import getWindow from 'get-window';
import * as React from 'react';
import {
    unstable_cancelCallback as cancelCallback,
    unstable_runWithPriority as runWithPriority,
    unstable_scheduleCallback as scheduleCallback,
    unstable_UserBlockingPriority as UserBlockingPriority
} from 'scheduler';

import EVENT_HANDLERS from '../constants/event-handlers';
import AfterPlugin from '../plugins/after';
import BeforePlugin from '../plugins/before';
import findDOMRange from '../utils/find-dom-range';
import findRange from '../utils/find-range';
import getChildrenDecorations from '../utils/get-children-decorations';
import noop from '../utils/noop';
import removeAllRanges from '../utils/remove-all-ranges';
import scrollToSelection from '../utils/scroll-to-selection';
import NodeRenderer from './NodeRenderer';

const FIREFOX_NODE_TYPE_ACCESS_ERROR = /Permission denied to access property "nodeType"/;

interface EditorProps {
    value: Value;
    readOnly?: boolean;
    autoCorrect?: boolean;
    autoFocus?: boolean;
    spellCheck?: boolean;
    tabIndex?: number;
    role?: string;
    style?: React.CSS.Properties;
    plugins?: Plugin[];
    renderNode: (node: Block | Inline) => React.Node;
    renderMark: (mark: Mark) => React.Node;
    onChange: (change: Change) => void;
}

/*
 * Main component to render a slate editor.
 */
function Editor(props: EditorProps): React.Node {
    const {
        value,
        readOnly,
        role,
        spellCheck,
        tabIndex,
        style,
        renderNode,
        renderMark,
        plugins: propPlugins,
        schema: propSchema
    } = props;
    const { document, selection, isFocused, decorations } = value;

    /*
     * Compute the stack and schema that should be used
     *
     * In addition to the plugins provided in props, this will initialize three
     * other plugins:
     *
     * - The top-level editor plugin, which allows for top-level handlers, etc.
     * - The two "core" plugins, one before all the other and one after.
     */
    const { stack, schema } = React.useMemo(() => {
        const beforePlugin = BeforePlugin();
        const afterPlugin = AfterPlugin();
        const editorPlugin = {
            schema: propSchema || {},
            renderNode,
            renderMark
        };

        const plugins = [
            beforePlugin,
            editorPlugin,
            ...propPlugins,
            afterPlugin
        ];

        return {
            stack: Stack.create({ plugins }),
            schema: Schema.create({ plugins })
        };
    }, [propPlugins, propSchema, renderNode, renderMark]);

    const domRef = React.useRef();
    const isUpdatingSelectionRef = React.useRef(false);

    // Create mutable "Editor" reference
    const editorRef = React.useRef({});

    editorRef.current.readOnly = readOnly;
    editorRef.current.stack = stack;
    editorRef.current.schema = schema;
    editorRef.current.value = value;

    editorRef.current.change = (fn: (change: Change) => Change | null) => {
        const change = value.change().call(fn);
        editorRef.current.onChange(change);
    };

    editorRef.current.onChange = (change: Change) => {
        if (readOnly) {
            return;
        }

        stack.run('onChange', change, editorRef.current);
        if (change.value === value) {
            return;
        }
        props.onChange(change);
    };

    const onEvent = (
        handler: string,
        event: React.SyntheticEvent<HTMLElement>
    ) => {
        const element = domRef.current;
        const editor = editorRef.current;

        if (!element) {
            return;
        }

        // Ignore `onBlur`, `onFocus` and `onSelect` events generated
        // programmatically while updating selection.
        if (
            isUpdatingSelectionRef.current &&
            (handler === 'onSelect' ||
                handler === 'onBlur' ||
                handler === 'onFocus')
        ) {
            return;
        }

        // COMPAT: There are situations where a select event will fire with a new
        // native selection that resolves to the same internal position. In those
        // cases we don't need to trigger any changes, since our internal model is
        // already up to date, but we do want to update the native selection again
        // to make sure it is in sync. (2017/10/16)
        if (handler === 'onSelect') {
            const window = getWindow(event.target);
            const native = window.getSelection();
            const range = findRange(native, editor.value);

            if (range && range.equals(selection)) {
                updateSelection(element, editor.value, isUpdatingSelectionRef);
                return;
            }
        }

        // Don't handle drag and drop events coming from embedded editors.
        if (
            handler === 'onDragEnd' ||
            handler === 'onDragEnter' ||
            handler === 'onDragExit' ||
            handler === 'onDragLeave' ||
            handler === 'onDragOver' ||
            handler === 'onDragStart' ||
            handler === 'onDrop'
        ) {
            const { target } = event;
            const targetEditorNode = target.closest('[data-slate-editor]');
            if (targetEditorNode !== element) {
                return;
            }
        }

        // Some events require being in editable in the editor, so if the event
        // target isn't, ignore them.
        if (
            (handler === 'onBeforeInput' ||
                handler === 'onBlur' ||
                handler === 'onCut' ||
                handler === 'onCompositionEnd' ||
                handler === 'onCompositionStart' ||
                handler === 'onFocus' ||
                handler === 'onInput' ||
                handler === 'onKeyDown' ||
                handler === 'onKeyUp' ||
                handler === 'onPaste' ||
                handler === 'onSelect') &&
            !isInEditor(element, event.target)
        ) {
            return;
        }

        // Same for the following events, except they work in read mode too.
        if (handler === 'onCopy' && !isInEditor(element, event.target, false)) {
            return;
        }

        editor.change(change => {
            editor.stack.run(handler, event, change, editor);
        });
    };

    /*
     * On native `selectionchange` event, trigger the `onSelect` handler. This is
     * needed to account for React's `onSelect` being non-standard and not firing
     * until after a selection has been released. This causes issues in situations
     * where another change happens while a selection is being made.
     */
    const onNativeSelectionChange = (event: Event) => {
        const element = domRef.current;

        if (readOnly || !element) {
            return;
        }

        runWithPriority(UserBlockingPriority, () => {
            scheduleCallback(() => {
                const editor = editorRef.current;
                const window = getWindow(event.target);
                const { activeElement } = window.document;
                if (activeElement !== element) {
                    return;
                }

                editor.change(change => {
                    editor.stack.run('onSelect', event, change, editor);
                });
            });
        });
    };

    /*
     * On a native `beforeinput` event, use the additional range information
     * provided by the event to manipulate text exactly as the browser would.
     *
     * This is currently only used on iOS and Android.
     */
    const onNativeBeforeInput = (event: Event) => {
        const element = domRef.current;
        const editor = editorRef.current;

        if (readOnly || !element) {
            return;
        }

        if (!isInEditor(element, event.target)) {
            return;
        }

        const [targetRange] = event.getTargetRanges();
        if (!targetRange) {
            return;
        }

        switch (event.inputType) {
            case 'deleteContentBackward': {
                event.preventDefault();

                const range = findRange(targetRange, editor.value);
                editor.change(change => change.deleteAtRange(range));
                break;
            }

            case 'insertLineBreak': // intentional fallthru
            case 'insertParagraph': {
                event.preventDefault();
                const range = findRange(targetRange, editor.value);

                editor.change(change => {
                    if (change.value.isInVoid) {
                        change.collapseToStartOfNextText();
                    } else {
                        change.splitBlockAtRange(range);
                    }
                });

                break;
            }

            case 'insertReplacementText': // intentional fallthru
            case 'insertText': {
                // `data` should have the text for the `insertText` input type and
                // `dataTransfer` should have the text for the `insertReplacementText`
                // input type, but Safari uses `insertText` for spell check replacements
                // and sets `data` to `null`.
                const text =
                    event.data == null
                        ? event.dataTransfer.getData('text/plain')
                        : event.data;

                if (text == null) {
                    return;
                }

                event.preventDefault();

                const range = findRange(targetRange, value);

                editor.change(change => {
                    change.insertTextAtRange(range, text, selection.marks);

                    // If the text was successfully inserted, and the selection had marks
                    // on it, unset the selection's marks.
                    if (
                        selection.marks &&
                        value.document !== change.value.document
                    ) {
                        change.select({ marks: null });
                    }
                });

                break;
            }
        }
    };

    /*
     * When the editor first mounts in the DOM we need to:
     *
     *   - Add native DOM event listeners.
     *   - Update the selection, in case it starts focused.
     */
    React.useEffect(() => {
        const element = domRef.current;
        const window = getWindow(element);

        editorRef.current.element = element;

        window.document.addEventListener(
            'selectionchange',
            onNativeSelectionChange
        );

        // COMPAT: Restrict scope of `beforeinput` to mobile.
        if ((IS_IOS || IS_ANDROID) && SUPPORTED_EVENTS.beforeinput) {
            element.addEventListener('beforeinput', onNativeBeforeInput);
        }

        return () => {
            window.document.removeEventListener(
                'selectionchange',
                onNativeSelectionChange
            );

            // COMPAT: Restrict scope of `beforeinput` to mobile.
            if ((IS_IOS || IS_ANDROID) && SUPPORTED_EVENTS.beforeinput) {
                element.removeEventListener('beforeinput', onNativeBeforeInput);
            }
        };
    }, []);

    /*
     * On update, update the selection.
     */
    if (IS_BROWSER) {
        React.useLayoutEffect(() => {
            const element = domRef.current;
            if (!element) {
                return;
            }

            updateSelection(element, value, isUpdatingSelectionRef);
        });
    }

    /*
     * Create the event handlers to be passed to the DOM element.
     */
    const eventHandlers = {};
    EVENT_HANDLERS.forEach(handler => {
        eventHandlers[handler] = (event: React.SyntheticEvent<HTMLElement>) => {
            onEvent(handler, event);
        };
    });

    const indexes = document.getSelectionIndexes(selection);
    const decs = document.getDecorations(stack).concat(decorations || []);
    const childrenDecorations = getChildrenDecorations(document, decs);

    const children = document.nodes.toArray().map((child, i) => {
        const isSelected = !!indexes && indexes.start <= i && i < indexes.end;

        return (
            <NodeRenderer
                block={null}
                editor={editorRef.current}
                decorations={childrenDecorations[i]}
                isSelected={isSelected}
                isFocused={isFocused && isSelected}
                key={child.key}
                node={child}
                parent={document}
                readOnly={readOnly}
            />
        );
    });

    return (
        <div
            ref={domRef}
            data-slate-editor
            data-key={document.key}
            contentEditable={readOnly ? null : true}
            suppressContentEditableWarning
            autoCorrect={props.autoCorrect ? 'on' : 'off'}
            spellCheck={spellCheck}
            role={readOnly ? null : role}
            tabIndex={tabIndex}
            {...eventHandlers}
            // COMPAT: The Grammarly Chrome extension works by changing the DOM out
            // from under `contenteditable` elements, which leads to weird behaviors
            // so we have to disable it like this. (2017/04/24)
            data-gramm={false}
            style={{
                // Prevent the default outline styles.
                outline: 'none',
                // Preserve adjacent whitespace and new lines.
                whiteSpace: 'pre-wrap',
                // Allow words to break if they are too long.
                wordWrap: 'break-word',
                // COMPAT: In iOS, a formatting menu with bold, italic and underline
                // buttons is shown which causes our internal value to get out of sync in
                // weird ways. This hides that. (2016/06/21)
                ...(readOnly
                    ? {}
                    : { WebkitUserModify: 'read-write-plaintext-only' }),
                // Allow for passed-in styles to override anything.
                ...style
            }}
        >
            {children}
        </div>
    );
}

/*
 * Update the native DOM selection to reflect the internal model.
 */
function updateSelection(
    element: HTMLElement,
    value: Value,
    isUpdatingSelectionRef: React.Ref<boolean>
): void {
    const { selection } = value;
    const { isBackward } = selection;
    const window = getWindow(element);
    const native = window.getSelection();
    const { activeElement } = window.document;

    // COMPAT: In Firefox, there's a but where `getSelection` can return `null`.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=827585 (2018/11/07)
    if (!native) {
        return;
    }

    const { rangeCount, anchorNode } = native;

    // If the Slate selection is blurred, but the DOM's active element is still
    // the editor, we need to blur it.
    if (selection.isBlurred && activeElement === element) {
        element.blur();
    }

    // If the Slate selection is unset, but the DOM selection has a range
    // selected in the editor, we need to remove the range.
    if (selection.isUnset && rangeCount && isInEditor(element, anchorNode)) {
        removeAllRanges(native);
    }

    // If the Slate selection is focused, but the DOM's active element is not
    // the editor, we need to focus it. We prevent scrolling because we handle
    // scrolling to the correct selection.
    if (selection.isFocused && activeElement !== element) {
        element.focus({ preventScroll: true });
    }

    // Otherwise, figure out which DOM nodes should be selected...
    if (selection.isFocused && selection.isSet) {
        const current = rangeCount ? native.getRangeAt(0) : null;
        const range = findDOMRange(selection, window);

        if (!range) {
            reportRangeError(value);

            return;
        }

        const { startContainer, startOffset, endContainer, endOffset } = range;

        // If the new range matches the current selection, there is nothing to fix.
        // COMPAT: The native `Range` object always has it's "start" first and "end"
        // last in the DOM. It has no concept of "backwards/forwards", so we have
        // to check both orientations here. (2017/10/31)
        if (current) {
            if (
                (startContainer === current.startContainer &&
                    startOffset === current.startOffset &&
                    endContainer === current.endContainer &&
                    endOffset === current.endOffset) ||
                (startContainer === current.endContainer &&
                    startOffset === current.endOffset &&
                    endContainer === current.startContainer &&
                    endOffset === current.startOffset)
            ) {
                return;
            }
        }

        // Otherwise, set the `isUpdatingSelection` flag and update the selection.
        isUpdatingSelectionRef.current = true;
        removeAllRanges(native);

        // COMPAT: IE 11 does not support `setBaseAndExtent`. (2018/11/07)
        if (native.setBaseAndExtent) {
            // COMPAT: Since the DOM range has no concept of backwards/forwards
            // we need to check and do the right thing here.
            if (isBackward) {
                native.setBaseAndExtent(
                    range.endContainer,
                    range.endOffset,
                    range.startContainer,
                    range.startOffset
                );
            } else {
                native.setBaseAndExtent(
                    range.startContainer,
                    range.startOffset,
                    range.endContainer,
                    range.endOffset
                );
            }
        } else {
            native.addRange(range);
        }

        // Scroll to the selection, in case it's out of view.
        scrollToSelection(native);

        // Then unset the `isUpdatingSelection` flag after a delay, to ensure that
        // it is still set when selection-related events from updating it fire.
        setTimeout(() => {
            // COMPAT: In Firefox, it's not enough to create a range, you also need
            // to focus the contenteditable element too. (2016/11/16)
            if (IS_FIREFOX) {
                element.focus();
            }

            isUpdatingSelectionRef.current = false;
        });
    }
}

/*
 * Check if an event `target` is fired from within the contenteditable
 * element. This should be false for edits happening in non-contenteditable
 * children, such as void nodes and other nested Slate editors.
 */
function isInEditor(
    element: HTMLElement,
    target: HTMLElement,
    mustBeEditable: boolean = true
): boolean {
    let el: HTMLElement;

    try {
        // COMPAT: Text nodes don't have `isContentEditable` property. So, when
        // `target` is a text node use its parent node for check.
        el = target.nodeType === 3 ? target.parentNode : target;
    } catch (err) {
        // COMPAT: In Firefox, `target.nodeType` will throw an error if target is
        // originating from an internal "restricted" element (e.g. a stepper
        // arrow on a number input)
        // see github.com/ianstormtaylor/slate/issues/1819
        if (IS_FIREFOX && FIREFOX_NODE_TYPE_ACCESS_ERROR.test(err.message)) {
            return false;
        }

        throw err;
    }
    return (
        (!mustBeEditable || el.isContentEditable) &&
        (el === element || el.closest('[data-slate-editor]') === element)
    );
}

/*
 * Throw an async error when a native range for
 * the current slate selection could not be found in the DOM.
 */
function reportRangeError(value: Value): void {
    const { selection } = value;

    setTimeout(() => {
        function getAncestorsTypes(key: string) {
            const ancestors = value.document.getAncestors(key);
            if (!ancestors) {
                return [];
            }
            return ancestors.toArray().map(node => node.type);
        }

        // For logging purpose
        const error = new Error(
            'Unable to find a native DOM range for current selection.'
        );
        error.selection = selection.toJS();
        error.anchorAncestors = getAncestorsTypes(selection.anchorKey);
        error.focusAncestors = getAncestorsTypes(selection.focusKey);

        throw error;
    }, 0);
}

Editor.defaultProps = {
    autoFocus: false,
    autoCorrect: true,
    role: 'textbox',
    onChange: noop,
    plugins: [],
    readOnly: false,
    schema: {},
    style: {},
    spellCheck: true
};

export default Editor;
