import { Change, Node } from '@gitbook/slate'

import { createTable } from '../utils'
import Options from '../options'

/*
 * Insert a new table
 */
function insertTable(
  opts: Options,
  change: Change,
  options: {
    columns?: number,
    rows?: number,
    getCellContent?: (column: number, row: number) => Node[],
    normalize: boolean,
  } = {}
): Change {
  const { columns = 2, rows = 2, getCellContent } = options
  const { value } = change

  if (!value.selection.startKey) return change

  // Create the table node
  const table = createTable(opts, columns, rows, getCellContent)

  return change.insertBlock(table, options)
}

export default insertTable
