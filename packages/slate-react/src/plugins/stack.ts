import { Block, Inline, Range } from '@gitbook/slate';
import { Record } from 'immutable';
import memoize from 'immutablejs-record-memoize';

import { Plugin } from './plugin';

/*
 * Stack of plugins passed when rendering the editor.
 */
class PluginsStack extends Record({
    plugins: []
}) {
    public static create(plugins: Plugin[]): PluginsStack {
        return new PluginsStack({ plugins });
    }
    public readonly plugins: Plugin[];

    /*
     * Get the decorations for the node from a `stack`.
     */
    public getDecorations(node: Block | Inline): List<Range> {
        const decorations = this.find('decorateNode', node);
        const list = Range.createList(decorations || []);
        return list;
    }

    /*
     * Get all plugins with `property`.
     */
    public getPluginsWith(property: keyof Plugin): Plugin[] {
        return this.plugins.filter(plugin => plugin[property] != null);
    }

    /*
     * Iterate the plugins with `property`, returning the first non-null value.
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
     */
    public run(property: keyof Plugin, ...args: any[]): void {
        const plugins = this.getPluginsWith(property);

        for (const plugin of plugins) {
            const ret = plugin[property](...args);
            if (ret != null) {
                return;
            }
        }
    }
}

/*
 * Memoize read methods.
 */

memoize(PluginsStack.prototype, ['getPluginsWith', 'getDecorations']);

export default PluginsStack;
