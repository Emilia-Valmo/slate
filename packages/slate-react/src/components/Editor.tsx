import * as React from 'react';
import { Value, Block, Inline, Mark, Plugin, Schema, Stack } from '@gitbook/slate';

import noop from '../utils/noop'
import findDOMRange from '../utils/find-dom-range'
import findRange from '../utils/find-range'
import getChildrenDecorations from '../utils/get-children-decorations'
import scrollToSelection from '../utils/scroll-to-selection'
import removeAllRanges from '../utils/remove-all-ranges'
import NodeRenderer from './NodeRenderer'

interface EditorProps {
    value: Value,
    readOnly?: boolean,
    autoCorrect?: boolean,
    autoFocus?: boolean,
    spellCheck?: boolean,
    tabIndex?: number,
    renderNode: (node: Block | Inline) => React.Node,
    renderMark: (mark: Mark) => React.Node
};

/*
 * Main component to render a slate editor.
 */
function Editor(props: EditorProps): React.Node {
    const { value } = props
    const { document, selection, isFocused, decorations, readOnly } = value

    const plugins = React.useMemo(() => {

    })

    // Compute the stack
    const stack = React.useMemo(() => {

    }, [plugins])

    // Create mutable reference
    const editor = React.useRef({})
    editor.current.value = value;

    const indexes = document.getSelectionIndexes(selection)
    const decs = document.getDecorations(stack).concat(decorations || [])
    const childrenDecorations = getChildrenDecorations(document, decs)

    const children = document.nodes.toArray().map((child, i) => {
        const isSelected = !!indexes && indexes.start <= i && i < indexes.end

        return <NodeRenderer
            block={null}
            editor={editor}
            decorations={childrenDecorations[i]}
            isSelected={isSelected}
            isFocused={isFocused && isSelected}
            key={child.key}
            node={child}
            ancestors={[document]}
            readOnly={readOnly}
        />
    })

    return (
        <div>
            {children}
        </div>
    )
}

/*
   * Resolve an array of plugins from `plugins` and `schema` props.
   *
   * In addition to the plugins provided in props, this will initialize three
   * other plugins:
   *
   * - The top-level editor plugin, which allows for top-level handlers, etc.
   * - The two "core" plugins, one before all the other and one after.
   *
   * @param {Array|Void} plugins
   * @param {Schema|Object|Void} schema
   * @return {Array}
   */

function resolvePlugins(plugins, schema): Plugin[] {
    const beforePlugin = BeforePlugin()
    const afterPlugin = AfterPlugin()
    const editorPlugin = {
      schema: schema || {},
    }

    for (const prop of PLUGINS_PROPS) {
      // Skip `onChange` because the editor's `onChange` is special.
      if (prop == 'onChange') continue

      // Skip `schema` because it can't be proxied easily, so it must be
      // passed in as an argument to this function instead.
      if (prop == 'schema') continue

      // Define a function that will just proxies into `props`.
      editorPlugin[prop] = (...args) => {
        return this.props[prop] && this.props[prop](...args)
      }
    }

    return [beforePlugin, editorPlugin, ...(plugins || []), afterPlugin]
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
