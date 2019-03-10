
import{ Value } from '@gitbook/slate'

import Options from '../options'
import isRangeInTable from './isRangeInTable'

/**
 * Is the selection in a table
 */

function isSelectionInTable(opts: Options, value: Value): boolean {
  if (!value.selection.startKey) return false
  return isRangeInTable(opts, value.document, value.selection)
}

export default isSelectionInTable
