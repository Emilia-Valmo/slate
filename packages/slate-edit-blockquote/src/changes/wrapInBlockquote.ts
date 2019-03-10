import { Change } from '@gitbook/slate'

import Options from '../options'

/*
 * Wrap the block in a new blockquote.
 */
function wrapInBlockquote(opts: Options, change: Change): Change {
  return change.wrapBlock(opts.type)
}

export default wrapInBlockquote
