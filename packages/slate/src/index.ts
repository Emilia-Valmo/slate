import { resetMemoization, useMemoization } from 'immutablejs-record-memoize';

import Changes from './changes';
import Block from './models/block';
import Change from './models/change';
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
import Text from './models/text';
import Value from './models/value';
import Operations from './operations';
import { resetKeyGenerator, setKeyGenerator } from './utils/generate-key';

/*
 * File thh Change class with all the methods
 */
Object.keys(Changes).forEach(type => {
    Change.prototype[type] = function(...args) {
        Change.logger(type, { args });
        this.call(Changes[type], ...args);
        return this;
    };
});

export {
    Block,
    Change,
    Changes,
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
    Text,
    Value,
    resetKeyGenerator,
    setKeyGenerator,
    resetMemoization,
    useMemoization
};
