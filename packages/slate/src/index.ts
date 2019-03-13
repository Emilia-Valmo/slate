import { resetMemoization, useMemoization } from 'immutablejs-record-memoize';

import Changes from './changes';
import Block from './models/block';
import Change from './models/change';
import Character from './models/character';
import Data from './models/data';
import Document from './models/document';
import History from './models/history';
import Inline from './models/inline';
import Leaf from './models/leaf';
import Mark from './models/mark';
import Node from './models/node';
import Operation from './models/operation';
import Range from './models/range';
import Schema from './models/schema';
import Stack from './models/stack';
import Text from './models/text';
import Value from './models/value';
import Operations from './operations';
import { resetKeyGenerator, setKeyGenerator } from './utils/generate-key';

export * from './interfaces';

/*
 * File thh Change class with all the methods
 */
Object.keys(Changes).forEach(type => {
    Change.prototype[type] = function(...args) {
        Change.debug(type, { args });
        this.call(Changes[type], ...args);
        return this;
    };
});

/*
 * Export.
 *
 * @type {Object}
 */

export {
    Block,
    Change,
    Changes,
    Character,
    Data,
    Document,
    History,
    Inline,
    Leaf,
    Mark,
    Node,
    Operation,
    Operations,
    Range,
    Schema,
    Stack,
    Text,
    Value,
    resetKeyGenerator,
    setKeyGenerator,
    resetMemoization,
    useMemoization
};

export default {
    Block,
    Changes,
    Character,
    Data,
    Document,
    History,
    Inline,
    Leaf,
    Mark,
    Node,
    Operation,
    Operations,
    Range,
    Schema,
    Stack,
    Text,
    Value,
    resetKeyGenerator,
    setKeyGenerator,
    resetMemoization,
    useMemoization
};
