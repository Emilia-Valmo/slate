import { Node } from '@gitbook/slate'
import logger from '@gitbook/slate-dev-logger'

/**
 * Find the DOM node for a `key`.
 *
 * @param {String|Node} key
 * @param {Window} win (optional)
 * @return {Element | Void}
 */

function findSlateDOMNode(key, win = window) {
  if (Node.isNode(key)) {
    key = key.key
  }

  const el = win.document.querySelector(`[data-key="${key}"]`)

  if (!el) {
    logger.warning(
      `Unable to find a DOM node for "${key}". This is often because of forgetting to add \`props.attributes\` to a custom component.`
    )

    return null
  }

  return el
}

/**
 * Export.
 *
 * @type {Function}
 */

export default findSlateDOMNode
