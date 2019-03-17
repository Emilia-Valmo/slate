import { Block, Inline, List, Range } from '@gitbook/slate';
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
     * Iterate the plugins with `property`, returning the first non-null value.
     */
    public find(property, ...args) {
        const { plugins } = this;
        for (const plugin of plugins) {
            const fn = plugin[property];
            if (!fn) {
                continue;
            }

            const ret = fn(...args);
            if (ret != null) {
                return ret;
            }
        }
    }

    /*
     * Iterate the plugins with `property`, breaking on any a non-null values.
     */
    public run(property: keyof Plugin, ...args: any[]): void {
        const { plugins } = this;
        for (const plugin of plugins) {
            const fn = plugin[property];
            if (!fn) {
                continue;
            }

            const ret = fn(...args);
            if (ret != null) {
                return;
            }
        }
    }
}

/*
 * Memoize read methods.
 */

memoize(PluginsStack.prototype, ['getDecorations']);

export default PluginsStack;
