import { Change } from '@gitbook/slate'

import { TablePosition } from '../utils'
import Options from '../options'
import removeRowByKey from './removeRowByKey'

/**
 * Remove current row in a table. Clear it if last remaining row
 */

function removeRow(
  opts: Options,
  change: Change,
  options: {
    at?: number,
    normalize?: boolean,
  } = {}
): Change {
  const { value } = change
  const { startKey } = value

  const pos = TablePosition.create(opts, value.document, startKey)
  const { at } = options

  let rowKey

  if (typeof at === 'undefined') {
    rowKey = pos.row.key
  } else {
    rowKey = pos.table.nodes.get(at).key
  }

  return removeRowByKey(opts, change, rowKey, options)
}

export default removeRow
