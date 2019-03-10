import isPlainObject from 'is-plain-object'
import { Map } from 'immutable'
import logger from '@gitbook/slate-dev-logger'

/**
 * Data.
 *
 * This isn't an immutable record, it's just a thin wrapper around `Map` so that
 * we can allow for more convenient creation.
 *
 * @type {Object}
 */

class Data {
  /**
   * Create a new `Data` with `attrs`.
   *
   * @param {Object|Data|Map} attrs
   * @return {Data} data
   */

  static create(attrs = {}) {
    if (Map.isMap(attrs)) {
      return attrs
    }

    if (isPlainObject(attrs)) {
      return Data.fromJS(attrs)
    }

    throw new Error(
      `\`Data.create\` only accepts objects or maps, but you passed it: ${attrs}`
    )
  }

  /**
   * Create a `Data` from a JSON `object`.
   *
   * @param {Object} object
   * @return {Data}
   */

  static fromJS(object) {
    return new Map(object)
  }

  /**
   * Alias `fromJSON`.
   */

  static fromJSON(object) {
    logger.deprecate(
      'slate@0.35.0',
      'fromJSON methods are deprecated, use fromJS instead'
    )
    return Data.fromJS(object)
  }
}

/**
 * Export.
 *
 * @type {Object}
 */

export default Data
