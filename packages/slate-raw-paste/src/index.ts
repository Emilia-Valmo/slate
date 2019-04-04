import { Change, EditorContainer } from '@gitbook/slate';
import Hotkeys from '@gitbook/slate-hotkeys';
import Plain from '@gitbook/slate-plain-serializer';
import { getEventTransfer, Plugin } from '@gitbook/slate-react';

/*
 * Does a pure text paste on Shift+Mod+V
 */
function RawPastePlugin(): Plugin {
    // True if the current keyown event happened following a special paste
    let isRawPaste = false;

    /*
     * On key down.
     */

    function onKeyDown(event: Event, change: Change, editor: EditorContainer) {
        // During onPaste, we don't have access to the pressed keys,
        // so we detect it here
        isRawPaste = Hotkeys.isRawPaste(event);
    }

    /*
     * On paste.
     */

    function onPaste(event: Event, change: Change, editor: EditorContainer) {
        if (!isRawPaste) {
            return;
        }

        const transfer = getEventTransfer(event);
        const { text } = transfer;

        if (!text) {
            return;
        }

        const { value } = change;
        const { document, selection, startBlock } = value;
        if (startBlock.isVoid) {
            return;
        }

        const defaultBlock = startBlock;
        const defaultMarks = document.getInsertMarksAtRange(selection);
        const frag = Plain.deserialize(text, { defaultBlock, defaultMarks })
            .document;
        change.insertFragment(frag);
        return change;
    }

    return {
        onKeyDown,
        onPaste
    };
}

export default RawPastePlugin;
