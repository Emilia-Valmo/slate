import { Change, EditorContainer } from '@gitbook/slate';
import {
    IS_ANDROID,
    IS_FIREFOX,
    IS_IE,
    IS_IOS,
    SUPPORTED_EVENTS
} from '@gitbook/slate-dev-environment';
import Hotkeys from '@gitbook/slate-hotkeys';
import Debug from 'debug';
import getWindow from 'get-window';

import findNode from '../utils/find-node';
import findRange from '../utils/find-range';

const debug = Debug('slate:before');

/*
 * In edit mode, uses the current change selection. In read mode,
 * tries to compute the current Slate range from the native
 * selection, and returns the updated change.
 * Returns null if no selection could be computed.
 */

function ensureSlateSelection(event: Event, change: Change, editor: EditorContainer) {
    const { readOnly } = editor;
    const { value } = change;

    if (!readOnly) {
        return true;
    }

    // We need to compute the current selection
    const window = getWindow(event.target);
    const native = window.getSelection();
    const range = findRange(native, value);

    if (!range) {
        // We don't have a Slate selection
        return false;
    }

    // Ensure the value has the correct selection set
    change.select(range);
    return true;
}

/*
 * The core before plugin.
 */

function BeforePlugin() {
    let activeElement = null;
    let compositionCount = 0;
    let isComposing = false;
    let isCopying = false;
    let isDragging = false;

    /*
     * On before input.
     */

    function onBeforeInput(
        event: Event,
        change: Change,
        editor: EditorContainer
    ): boolean | void {
        if (editor.readOnly) {
            return true;
        }

        // COMPAT: React's `onBeforeInput` synthetic event is based on the native
        // `keypress` and `textInput` events. In browsers that support the native
        // `beforeinput` event, we instead use that event to trigger text insertion,
        // since it provides more useful information about the range being affected
        // and also preserves compatibility with iOS autocorrect, which would be
        // broken if we called `preventDefault()` on React's synthetic event here.
        // Since native `onbeforeinput` mainly benefits autocorrect and spellcheck
        // for mobile, on desktop it brings IME issue, limit its scope for now.
        if ((IS_IOS || IS_ANDROID) && SUPPORTED_EVENTS.beforeinput) {
            return true;
        }

        debug('onBeforeInput', { event });
    }

    /*
     * On blur.
     */

    function onBlur(event: Event, change: Change, editor: EditorContainer) {
        if (isCopying) {
            return true;
        }
        if (editor.readOnly) {
            return true;
        }

        const { value } = change;
        const { relatedTarget, target } = event;
        const window = getWindow(target);

        // COMPAT: If the current `activeElement` is still the previous one, this is
        // due to the window being blurred when the tab itself becomes unfocused, so
        // we want to abort early to allow to editor to stay focused when the tab
        // becomes focused again.
        if (activeElement === window.document.activeElement) {
            return true;
        }

        // COMPAT: The `relatedTarget` can be null when the new focus target is not
        // a "focusable" element (eg. a `<div>` without `tabindex` set).
        if (relatedTarget) {
            const el = editor.element;

            // COMPAT: The event should be ignored if the focus is returning to the
            // editor from an embedded editable element (eg. an <input> element inside
            // a void node).
            if (relatedTarget === el) {
                return true;
            }

            // COMPAT: The event should be ignored if the focus is moving from the
            // editor to inside a void node's spacer element.
            if (relatedTarget.hasAttribute('data-slate-spacer')) {
                return true;
            }

            // COMPAT: The event should be ignored if the focus is moving to a non-
            // editable section of an element that isn't a void node (eg. a list item
            // of the check list example).
            const node = findNode(relatedTarget, value);
            if (el.contains(relatedTarget) && node && !node.isVoid) {
                return true;
            }
        }

        debug('onBlur', { event });
    }

    /*
     * On change.
     */

    function onChange(change: Change, editor: EditorContainer) {
        const { value } = change;

        // If the value's schema isn't the editor's schema, update it. This can
        // happen on the initialization of the editor, or if the schema changes.
        // This change isn't save into history since only schema is updated.
        if (value.schema !== editor.schema) {
            change
                .setValue({ schema: editor.schema }, { save: false })
                .normalize();
        }

        debug('onChange');
    }

    /*
     * On composition end.
     */

    function onCompositionEnd(event: Event, change: Change, editor: EditorContainer) {
        const n = compositionCount;

        // The `count` check here ensures that if another composition starts
        // before the timeout has closed out this one, we will abort unsetting the
        // `isComposing` flag, since a composition is still in affect.
        window.requestAnimationFrame(() => {
            if (compositionCount > n) {
                return;
            }
            isComposing = false;

            // HACK: we need to re-render the editor here so that it will update its
            // placeholder in case one is currently rendered. This should be handled
            // differently ideally, in a less invasive way?
            // (apply force re-render if isComposing changes)
            if (editor.state.isComposing) {
                editor.setState({ isComposing: false });
            }
        });

        debug('onCompositionEnd', { event });
    }

    /*
     * On composition start.
     */

    function onCompositionStart(event: Event, change: Change, editor: EditorContainer) {
        isComposing = true;
        compositionCount++;

        // HACK: we need to re-render the editor here so that it will update its
        // placeholder in case one is currently rendered. This should be handled
        // differently ideally, in a less invasive way?
        // (apply force re-render if isComposing changes)
        if (!editor.state.isComposing) {
            editor.setState({ isComposing: true });
        }

        debug('onCompositionStart', { event });
    }

    /*
     * On copy.
     */

    function onCopy(event: Event, change: Change, editor: EditorContainer) {
        const window = getWindow(event.target);

        const hasSelection = ensureSlateSelection(event: Event, change: Change, editor: EditorContainer);

        if (!hasSelection) {
            // We don't have a selection, so let the browser
            // handle the copy, and do not call other plugins
            return true;
        }

        isCopying = true;
        window.requestAnimationFrame(() => (isCopying = false));

        debug('onCopy', { event });
    }

    /*
     * On cut.
     */

    function onCut(event: Event, change: Change, editor: EditorContainer) {
        const window = getWindow(event.target);
        isCopying = true;
        window.requestAnimationFrame(() => (isCopying = false));

        debug('onCut', { event });
    }

    /*
     * On drag end.
     */

    function onDragEnd(event: Event, change: Change, editor: EditorContainer) {
        isDragging = false;

        debug('onDragEnd', { event });
    }

    /*
     * On drag enter.
     */

    function onDragEnter(event: Event, change: Change, editor: EditorContainer) {
        debug('onDragEnter', { event });
    }

    /*
     * On drag exit.
     */

    function onDragExit(event: Event, change: Change, editor: EditorContainer) {
        debug('onDragExit', { event });
    }

    /*
     * On drag leave.
     */

    function onDragLeave(event: Event, change: Change, editor: EditorContainer) {
        debug('onDragLeave', { event });
    }

    /*
     * On drag over.
     */

    function onDragOver(event: Event, change: Change, editor: EditorContainer) {
        // If the target is inside a void node, and only in this case,
        // call `preventDefault` to signal that drops are allowed.
        // When the target is editable, dropping is already allowed by
        // default, and calling `preventDefault` hides the cursor.
        const node = findNode(event.target, editor.value);
        if (node.isVoid) {
            event.preventDefault();
        }

        // COMPAT: IE won't call onDrop on contentEditables unless the
        // default dragOver is prevented:
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/913982/
        // (2018/07/11)
        if (IS_IE) {
            event.preventDefault();
        }

        // If a drag is already in progress, don't do this again.
        if (!isDragging) {
            isDragging = true;

            // COMPAT: IE will raise an `unspecified error` if dropEffect is
            // set. (2018/07/11)
            if (!IS_IE) {
                event.nativeEvent.dataTransfer.dropEffect = 'move';
            }
        }

        debug('onDragOver', { event });
    }

    /*
     * On drag start.
     */

    function onDragStart(event: Event, change: Change, editor: EditorContainer) {
        isDragging = true;

        debug('onDragStart', { event });
    }

    /*
     * On drop.
     */

    function onDrop(event: Event, change: Change, editor: EditorContainer) {
        // Nothing happens in read-only mode.
        if (editor.readOnly) {
            return true;
        }

        // Prevent default so the DOM's value isn't corrupted.
        event.preventDefault();

        debug('onDrop', { event });
    }

    /*
     * On focus.
     */

    function onFocus(event: Event, change: Change, editor: EditorContainer) {
        if (isCopying) {
            return true;
        }
        if (editor.readOnly) {
            return true;
        }

        const el = editor.element;

        // Save the new `activeElement`.
        const window = getWindow(event.target);
        activeElement = window.document.activeElement;

        // COMPAT: If the editor has nested editable elements, the focus can go to
        // those elements. In Firefox, this must be prevented because it results in
        // issues with keyboard navigation. (2017/03/30)
        if (IS_FIREFOX && event.target !== el) {
            el.focus();
            return true;
        }

        debug('onFocus', { event });
    }

    /*
     * On input.
     */

    function onInput(event: Event, change: Change, editor: EditorContainer) {
        if (isComposing) {
            return true;
        }
        if (change.value.isBlurred) {
            return true;
        }

        debug('onInput', { event });
    }

    /*
     * On key down.
     */

    function onKeyDown(event: Event, change: Change, editor: EditorContainer) {
        if (editor.readOnly) {
            return true;
        }

        // When composing, we need to prevent all hotkeys from executing while
        // typing. However, certain characters also move the selection before
        // we're able to handle it, so prevent their default behavior.
        if (isComposing) {
            if (Hotkeys.isComposing(event)) {
                event.preventDefault();
            }
            return true;
        }

        // Certain hotkeys have native behavior in contenteditable elements which
        // will cause our value to be out of sync, so prevent them.
        if (Hotkeys.isContentEditable(event) && !IS_IOS) {
            event.preventDefault();
        }

        debug('onKeyDown', { event });
    }

    /*
     * On paste.
     */

    function onPaste(event: Event, change: Change, editor: EditorContainer) {
        if (editor.readOnly) {
            return true;
        }

        // Prevent defaults so the DOM state isn't corrupted.
        event.preventDefault();

        debug('onPaste', { event });
    }

    /*
     * On select.
     */

    function onSelect(event: Event, change: Change, editor: EditorContainer) {
        if (isCopying) {
            return true;
        }
        if (isComposing) {
            return true;
        }
        if (editor.readOnly) {
            return true;
        }

        // Save the new `activeElement`.
        const window = getWindow(event.target);
        activeElement = window.document.activeElement;

        debug('onSelect', { event });
    }


    return {
        onBeforeInput,
        onBlur,
        onChange,
        onCompositionEnd,
        onCompositionStart,
        onCopy,
        onCut,
        onDragEnd,
        onDragEnter,
        onDragExit,
        onDragLeave,
        onDragOver,
        onDragStart,
        onDrop,
        onFocus,
        onInput,
        onKeyDown,
        onPaste,
        onSelect
    };
}


export default BeforePlugin;
