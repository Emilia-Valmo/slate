import * as React from 'react';
import { Value } from '@gitbook/slate';

import noop from '../utils/noop'

interface EditorProps {
    value: Value,
    readOnly?: boolean,
    autoCorrect?: boolean,
    autoFocus?: boolean,
    spellCheck?: boolean,
    tabIndex?: number
};

/*
 * Main component to render a slate editor.
 */
function Editor(props: EditorProps): React.Node {

}

Editor.defaultProps = {
    autoFocus: false,
    autoCorrect: true,
    onChange: noop,
    plugins: [],
    readOnly: false,
    schema: {},
    spellCheck: true,
}

export default Editor;
