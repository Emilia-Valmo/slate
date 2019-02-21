import { Editor } from '@gitbook/slate-react'

import * as React from 'react'
import { Button, Toolbar } from '../components'

import PluginEditTable from '@gitbook/slate-edit-table'

import alignPlugin from './aligns'
import INITIAL_VALUE from './value'

const tablePlugin = PluginEditTable({
  typeTable: 'table',
  typeRow: 'table_row',
  typeCell: 'table_cell',
  typeContent: 'paragraph',
})

function renderNode(props) {
  switch (props.node.type) {
    case 'table':
      return <Table {...props} />
    case 'table_row':
      return <TableRow {...props} />
    case 'table_cell':
      return <TableCell {...props} />
    case 'paragraph':
      return <Paragraph {...props} />
    case 'heading':
      return <h1 {...props.attributes}>{props.children}</h1>
    default:
      return null
  }
}

const plugins = [tablePlugin, alignPlugin, { renderNode }]

const TableContext = React.createContext(false)

class Table extends React.Component {
  render() {
    const { attributes, children } = this.props
    return (
      <TableContext.Provider value>
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      </TableContext.Provider>
    )
  }
}

class TableRow extends React.Component {
  render() {
    const { attributes, children } = this.props
    return <tr {...attributes}>{children}</tr>
  }
}

class TableCell extends React.Component {
  render() {
    const { attributes, children, node } = this.props

    const textAlign = node.get('data').get('align', 'left')

    return (
      <td style={{ textAlign }} {...attributes}>
        {children}
      </td>
    )
  }
}

class Paragraph extends React.Component {
  static contextType = TableContext

  render() {
    const { attributes, children } = this.props
    const isInTable = this.context

    const style = isInTable ? { margin: 0 } : {}

    return (
      <p style={style} {...attributes}>
        {children}
      </p>
    )
  }
}

class TableExample extends React.Component<*, *> {
  state = {
    value: INITIAL_VALUE,
  }

  renderToolbar() {
    const { value } = this.state
    const isInTable = tablePlugin.utils.isSelectionInTable(value)
    const isOutTable = tablePlugin.utils.isSelectionOutOfTable(value)

    return (
      <Toolbar>
        <Button active={isOutTable} onMouseDown={this.onInsertTable}>
          Insert Table
        </Button>
        <Button active={isInTable} onMouseDown={this.onInsertColumn}>
          Insert Column
        </Button>
        <Button active={isInTable} onMouseDown={this.onInsertRow}>
          Insert Row
        </Button>
        <Button active={isInTable} onMouseDown={this.onRemoveColumn}>
          Remove Column
        </Button>
        <Button active={isInTable} onMouseDown={this.onRemoveRow}>
          Remove Row
        </Button>
        <Button active={isInTable} onMouseDown={this.onRemoveTable}>
          Remove Table
        </Button>
        <br />
        <Button
          active={isInTable}
          onMouseDown={e => this.onSetAlign(e, 'left')}
        >
          Set align left
        </Button>
        <Button
          active={isInTable}
          onMouseDown={e => this.onSetAlign(e, 'center')}
        >
          Set align center
        </Button>
        <Button
          active={isInTable}
          onMouseDown={e => this.onSetAlign(e, 'right')}
        >
          Set align right
        </Button>
      </Toolbar>
    )
  }

  submitChange = fn => {
    this.onChange(this.state.value.change().call(fn))
  }

  onChange = ({ value }) => {
    this.setState({
      value,
    })
  }

  onInsertTable = event => {
    event.preventDefault()
    this.submitChange(tablePlugin.changes.insertTable)
  }

  onInsertColumn = event => {
    event.preventDefault()
    this.submitChange(tablePlugin.changes.insertColumn)
  }

  onInsertRow = event => {
    event.preventDefault()
    this.submitChange(tablePlugin.changes.insertRow)
  }

  onRemoveColumn = event => {
    event.preventDefault()
    this.submitChange(tablePlugin.changes.removeColumn)
  }

  onRemoveRow = event => {
    event.preventDefault()
    this.submitChange(tablePlugin.changes.removeRow)
  }

  onRemoveTable = event => {
    event.preventDefault()
    this.submitChange(tablePlugin.changes.removeTable)
  }

  onSetAlign = (event, align) => {
    event.preventDefault()

    this.submitChange(change =>
      alignPlugin.changes.setColumnAlign(change, align)
    )
  }

  render() {
    const { value } = this.state
    return (
      <div>
        {this.renderToolbar()}
        <Editor
          placeholder={'Enter some text...'}
          plugins={plugins}
          value={value}
          onChange={this.onChange}
        />
      </div>
    )
  }
}

/**
 * Export.
 */

export default TableExample
