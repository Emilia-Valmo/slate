import { Change } from '@gitbook/slate'

import Options from '../options'
import removeTableByKey from './removeTableByKey'

/**
 * Delete the whole table at position
 */

function removeTable(
  opts: Options,
  change: Change,
  options: {
    normalize?: boolean,
  } = {}
): Change {
  const { value } = change
  const { startKey } = value

  return removeTableByKey(opts, change, startKey, options)
}

export default removeTable
