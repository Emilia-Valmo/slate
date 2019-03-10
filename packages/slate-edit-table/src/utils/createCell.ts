import { Block, Text,Node } from '@gitbook/slate'

import Options from '../options'

/**
 * Create a new cell
 */

function createCell(opts: Options, nodes?: Node[]): Block {
  return Block.create({
    type: opts.typeCell,
    nodes: nodes || [createEmptyContent(opts)],
  })
}

/**
 * Create a new default content block
 */

function createEmptyContent(opts: Options): Block {
  return Block.create({
    type: opts.typeContent,
    nodes: [Text.create()],
  })
}

export default createCell
