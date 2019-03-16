import logger from '@gitbook/slate-dev-logger';
import { Record } from 'immutable';
import memoize from 'immutablejs-record-memoize';

import MODEL_TYPES from '../constants/model-types';

/*
 * Stack of plugins passed when rendering the editor.
 */
class PluginsStack extends Record({
    plugins: []
}) {

    public static create(attrs = {}): PluginsStack {
        const { plugins = [] } = attrs;
        const stack = new PluginsStack({ plugins });
        return stack;
    }

    /*
     * Get all plugins with `property`.
     *
     * @param {String} property
     * @return {Array}
     */

    public getPluginsWith(property) {
        return this.plugins.filter(plugin => plugin[property] != null);
    }

    /*
     * Iterate the plugins with `property`, returning the first non-null value.
     *
     * @param {String} property
     * @param {Any} ...args
     */

    public find(property, ...args) {
        const plugins = this.getPluginsWith(property);

        for (const plugin of plugins) {
            const ret = plugin[property](...args);
            if (ret != null) {
                return ret;
            }
        }
    }

    /*
     * Iterate the plugins with `property`, returning all the non-null values.
     *
     * @param {String} property
     * @param {Any} ...args
     * @return {Array}
     */

    public map(property, ...args) {
        const plugins = this.getPluginsWith(property);
        const array = [];

        for (const plugin of plugins) {
            const ret = plugin[property](...args);
            if (ret != null) {
                array.push(ret);
            }
        }

        return array;
    }

    /*
     * Iterate the plugins with `property`, breaking on any a non-null values.
     *
     * @param {String} property
     * @param {Any} ...args
     */

    public run(property, ...args) {
        const plugins = this.getPluginsWith(property);

        for (const plugin of plugins) {
            const ret = plugin[property](...args);
            if (ret != null) {
                return;
            }
        }
    }

    /*
     * Iterate the plugins with `property`, reducing to a set of React children.
     *
     * @param {String} property
     * @param {Object} props
     * @param {Any} ...args
     */

    public render(property, props, ...args) {
        const plugins = this.getPluginsWith(property);
        return plugins.reduceRight(
            (children, plugin) => {
                if (!plugin[property]) {
                    return children;
                }
                const ret = plugin[property](props, ...args);
                if (ret == null) {
                    return children;
                }
                props.children = ret;
                return ret;
            },
            props.children === undefined ? null : props.children
        );
    }
}

/*
 * Memoize read methods.
 */

memoize(Stack.prototype, ['getPluginsWith']);


export default Stack;
