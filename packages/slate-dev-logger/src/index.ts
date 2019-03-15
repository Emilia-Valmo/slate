/* tslint-disable no-console */

/*
 * Is in development?
 */
const IS_DEV: boolean = Boolean(
  typeof process !== 'undefined' &&
  process.env &&
  process.env.NODE_ENV !== 'production'
)

const HAS_CONSOLE =
  typeof console !== 'undefined' &&
  typeof console.log === 'function' &&
  typeof console.warn === 'function' &&
  typeof console.error === 'function'

/*
 * Log a `message` at `level`.
 */
export function log(level: 'warn' | 'error' | 'log' | 'debug', message: string, ...args: any[]) {
  if (!IS_DEV) {
    return
  }

  if (HAS_CONSOLE) {
    console[level](message, ...args)
  }
}

/*
 * Log an error `message`.
 */

function error(message: string, ...args: any[]) {
  if (HAS_CONSOLE) {
    console.error(message, ...args)
  }
}

/*
 * Log a warning `message` in development only.
 */

function warn(message: string, ...args: any[]) {
  log('warn', `Warning: ${message}`, ...args)
}

/*
 * Log a deprecation warning `message`, with helpful `version` number in
 * development only.
 */

function deprecate(version: string, message: string, ...args: any[]) {
  log('warn', `Deprecation (${version}): ${message}`, ...args)
}

const logger = {
  deprecate,
  error,
  warn,
}

export default logger
