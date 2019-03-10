import { Record } from 'immutable'

const DEFAULTS = {
  type: 'blockquote',
  typeDefault: 'paragraph',
  exitBlockType: 'paragraph',
}

/**
 * The plugin options container
 */

class Options extends Record(DEFAULTS) {
  type: string
  typeDefault: string
  exitBlockType: string
}

export OptionsFormat = {
  type?: string, // for blockquotes
  typeDefault?: string, // for default block in blockquote.
  exitBlockType?: string, // of block inserted when exiting
}

export default Options
