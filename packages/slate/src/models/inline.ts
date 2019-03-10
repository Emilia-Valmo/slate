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
 * Inline.
 *
 * @type {Inline}
 */

class Inline extends Record(DEFAULTS) {
  /**
   * Create a new `Inline` with `attrs`.
   *
   * @param {Object|String|Inline} attrs
   * @return {Inline}
   */

  static create(attrs = {}) {
    if (Inline.isInline(attrs)) {
      return attrs
    }

    if (typeof attrs == 'string') {
      attrs = { type: attrs }
    }

    if (isPlainObject(attrs)) {
      return Inline.fromJS(attrs)
    }

    throw new Error(
      `\`Inline.create\` only accepts objects, strings or inlines, but you passed it: ${attrs}`
    )
  }

  /**
   * Create a list of `Inlines` from an array.
   *
   * @param {Array<Inline|Object>|List<Inline|Object>} elements
   * @return {List<Inline>}
   */

  static createList(elements = []) {
    if (List.isList(elements) || Array.isArray(elements)) {
      const list = new List(elements.map(Inline.create))
      return list
    }

    throw new Error(
      `\`Inline.createList\` only accepts arrays or lists, but you passed it: ${elements}`
    )
  }

  /**
   * Create a `Inline` from a JSON `object`.
   *
   * @param {Object|Inline} object
   * @return {Inline}
   */

  static fromJS(object) {
    if (Inline.isInline(object)) {
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
      throw new Error('`Inline.fromJS` requires a `type` string.')
    }

    const inline = new Inline({
      key,
      type,
      isVoid: !!isVoid,
      data: new Map(data),
      nodes: Inline.createChildren(nodes),
    })

    return inline
  }

  /**
   * Alias `fromJS`.
   */

  static fromJSON(object) {
    logger.deprecate(
      'slate@0.35.0',
      'fromJSON methods are deprecated, use fromJS instead'
    )
    return Inline.fromJS(object)
  }

  /**
   * Check if `any` is a `Inline`.
   *
   * @param {Any} any
   * @return {Boolean}
   */

  static isInline = isType.bind(null, 'INLINE')

  /**
   * Check if `any` is a list of inlines.
   *
   * @param {Any} any
   * @return {Boolean}
   */

  static isInlineList(any) {
    return List.isList(any) && any.every(item => Inline.isInline(item))
  }

  /**
   * Object.
   *
   * @return {String}
   */

  get object() {
    return 'inline'
  }

  get kind() {
    logger.deprecate(
      'slate@0.32.0',
      'The `kind` property of Slate objects has been renamed to `object`.'
    )
    return this.object
  }

  /**
   * Check if the inline is empty.
   * Returns true if inline is not void and all it's children nodes are empty.
   * Void node is never empty, regardless of it's content.
   *
   * @return {Boolean}
   */

  get isEmpty() {
    return !this.isVoid && !this.nodes.some(child => !child.isEmpty)
  }

  /**
   * Get the concatenated text of all the inline's children.
   *
   * @return {String}
   */

  get text() {
    return this.getText()
  }

  /**
   * Return a JSON representation of the inline.
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
   * Alias `toJS`.
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

Inline.prototype[MODEL_TYPES.INLINE] = true

/**
 * Export.
 *
 * @type {Inline}
 */

export default Inline
