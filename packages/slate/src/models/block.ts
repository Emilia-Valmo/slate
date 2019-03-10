/**
 * Dependencies.
 */

import isPlainObject from 'is-plain-object'
import logger from '@gitbook/slate-dev-logger'
import { List, Map, Record } from 'immutable'

import MODEL_TYPES, { isType } from '../constants/model-types'
import generateKey from '../utils/generate-key'

/**
 * Default properties.
 *
 * @type {Object}
 */

const DEFAULTS = {
  data: new Map(),
  isVoid: false,
  key: undefined,
  nodes: new List(),
  type: undefined,
}

/**
 * Block.
 *
 * @type {Block}
 */

class Block extends Record(DEFAULTS) {
  /**
   * Create a new `Block` from `attrs`.
   *
   * @param {Object|String|Block} attrs
   * @return {Block}
   */

  static create(attrs = {}) {
    if (Block.isBlock(attrs)) {
      return attrs
    }

    if (typeof attrs == 'string') {
      attrs = { type: attrs }
    }

    if (isPlainObject(attrs)) {
      return Block.fromJS(attrs)
    }

    throw new Error(
      `\`Block.create\` only accepts objects, strings or blocks, but you passed it: ${attrs}`
    )
  }

  /**
   * Create a list of `Blocks` from `attrs`.
   *
   * @param {Array<Block|Object>|List<Block|Object>} attrs
   * @return {List<Block>}
   */

  static createList(attrs = []) {
    if (List.isList(attrs) || Array.isArray(attrs)) {
      const list = new List(attrs.map(Block.create))
      return list
    }

    throw new Error(
      `\`Block.createList\` only accepts arrays or lists, but you passed it: ${attrs}`
    )
  }

  /**
   * Create a `Block` from a JSON `object`.
   *
   * @param {Object|Block} object
   * @return {Block}
   */

  static fromJS(object) {
    if (Block.isBlock(object)) {
      return object
    }

    const {
      data = {},
      isVoid = false,
      key = generateKey(),
      nodes = [],
      type,
    } = object

    if (typeof type != 'string') {
      throw new Error('`Block.fromJS` requires a `type` string.')
    }

    const block = new Block({
      key,
      type,
      isVoid: !!isVoid,
      data: Map(data),
      nodes: Block.createChildren(nodes),
    })

    return block
  }

  /**
   * Alias `fromJS`.
   */

  static fromJSON(object) {
    logger.deprecate(
      'slate@0.35.0',
      'fromJSON methods are deprecated, use fromJS instead'
    )
    return Block.fromJS(object)
  }

  /**
   * Check if `any` is a `Block`.
   *
   * @param {Any} any
   * @return {Boolean}
   */

  static isBlock = isType.bind(null, 'BLOCK')

  /**
   * Check if `any` is a block list.
   *
   * @param {Any} any
   * @return {Boolean}
   */

  static isBlockList(any) {
    return List.isList(any) && any.every(item => Block.isBlock(item))
  }

  /**
   * Object.
   *
   * @return {String}
   */

  get object() {
    return 'block'
  }

  get kind() {
    logger.deprecate(
      'slate@0.32.0',
      'The `kind` property of Slate objects has been renamed to `object`.'
    )
    return this.object
  }

  /**
   * Check if the block is empty.
   * Returns true if block is not void and all it's children nodes are empty.
   * Void node is never empty, regardless of it's content.
   *
   * @return {Boolean}
   */

  get isEmpty() {
    return !this.isVoid && !this.nodes.some(child => !child.isEmpty)
  }

  /**
   * Get the concatenated text of all the block's children.
   *
   * @return {String}
   */

  get text() {
    return this.getText()
  }

  /**
   * Return a JSON representation of the block.
   *
   * @param {Object} options
   * @return {Object}
   */

  toJS(options = {}) {
    const object = {
      object: this.object,
      type: this.type,
      isVoid: this.isVoid,
      data: this.data.toJS(),
      nodes: this.nodes.toArray().map(n => n.toJS(options)),
    }

    if (options.preserveKeys) {
      object.key = this.key
    }

    return object
  }

  /**
   * Alias `toJSON`.
   */

  toJSON(options) {
    logger.deprecate(
      'slate@0.35.0',
      'toJSON methods are deprecated, use toJS instead'
    )
    return this.toJS(options)
  }
}

/**
 * Attach a pseudo-symbol for type checking.
 */

Block.prototype[MODEL_TYPES.BLOCK] = true

/**
 * Export.
 *
 * @type {Block}
 */

export default Block
