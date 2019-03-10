import { Change, Block } from '@gitbook/slate'

import { TablePosition, createRow } from '../utils'
import Options from '../options'

/*
 * Insert a new row in current table
 */
function insertRow(
  opts: Options,
  change: Change,
  options: {
    at?: number, // row index
    getRow?: (columns: number) => Block, // Generate the row yourself
    normalize?: boolean,
  } = {}
) {
  const { value } = change
  const { startKey } = value

  const pos = TablePosition.create(opts, value.document, startKey)
  const { table } = pos

  const {
    at = pos.getRowIndex() + 1,
    getRow = columns => createRow(opts, columns),
  } = options

  // Create a new row with the right count of cells
  const columns = table.nodes.get(0).nodes.size
  const newRow = getRow(columns)

  return change
    .insertNodeByKey(table.key, at, newRow, options)
    .collapseToEndOf(newRow.nodes.get(pos.getColumnIndex()))
}

export default insertRow
