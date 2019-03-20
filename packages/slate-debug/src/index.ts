/* tslint:disable no-console */
import Debug from 'debug';

const Logger = Debug;

/*
 * Is in development?
 */
const IS_DEV: boolean = Boolean(
    typeof process !== 'undefined' &&
        process.env &&
        process.env.NODE_ENV !== 'production'
);

const HAS_CONSOLE =
    typeof console !== 'undefined' &&
    typeof console.log === 'function' &&
    typeof console.warn === 'function' &&
    typeof console.error === 'function';

/*
 * Log a `message` at `level`.
 */
export function log(
    level: 'warn' | 'error' | 'log' | 'debug',
    message: string,
    ...args: any[]
) {
    if (!IS_DEV) {
        return;
    }

    if (HAS_CONSOLE) {
        console[level](message, ...args);
    }
}

/*
 * Log a warning `message` in development only.
 */

function warn(message: string, ...args: any[]) {
    log('warn', `Warning: ${message}`, ...args);
}

/*
 * Log a deprecation warning `message`, with helpful `version` number in
 * development only.
 */

function deprecate(version: string, message: string, ...args: any[]) {
    log('warn', `Deprecation (${version}): ${message}`, ...args);
}

/*
 * Log an error without interrupting the current execution.
 * This is meant to be captured by Sentry.
 */
function report(error: Error) {
    setTimeout(() => {
        throw error;
    }, 0);
}

export { deprecate, warn, report, Logger };
