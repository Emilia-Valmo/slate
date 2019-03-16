import { Node } from '@gitbook/slate';
import { Record } from 'immutable';

export interface OptionsFormat {
    types?: string[];
    typeItem?: string;
    typeDefault?: string;
    canMerge?: (listA: Node, listB: Node) => boolean;
}

/*
 * The plugin options
 */

class Options extends Record({
    types: ['ul_list', 'ol_list'],
    typeItem: 'list_item',
    typeDefault: 'paragraph',
    canMerge: (a: Node, b: Node) => a.type === b.type
}) {
    // The possibles types for list containers
    public types: string[];
    // The of list items
    public typeItem: string;
    // The of default block in items
    public typeDefault: string;
    // You can control here the automatic merging of adjacent lists
    public canMerge: (listA: Node, listB: Node) => boolean;
}

export default Options;
