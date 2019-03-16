import { Editor } from '@gitbook/slate-react'

import * as React from 'react'

import PluginEditCode from '@gitbook/slate-edit-code'
import PluginPrism from '@gitbook/slate-prism'

import INITIAL_VALUE from './value'

const plugins = [
  PluginPrism({
    onlyIn: node => node.type === 'code_block',
    getSyntax: node => node.data.get('syntax'),
  }),
  PluginEditCode({
    onlyIn: node => node.type === 'code_block',
  }),
]

function renderNode(props: *) {
  const { node, children, attributes } = props

  switch (node.type) {
    case 'code_block':
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      )

    case 'paragraph':
      return <p {...attributes}>{children}</p>
    case 'heading':
      return <h1 {...attributes}>{children}</h1>
    default:
      return null
  }
}

class PrismExample extends React.Component<*, *> {
  public state = {
    value: INITIAL_VALUE,
  }

  public onChange = ({ value }) => {
    this.setState({
      value,
    })
  }

  public render() {
    return (
      <>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/themes/prism-tomorrow.css"
        />
        <Editor
          placeholder={'Enter some text...'}
          plugins={plugins}
          value={this.state.value}
          onChange={this.onChange}
          renderNode={renderNode}
        />
      </>
    )
  }
}

/*
 * Export.
 */

export default PrismExample
