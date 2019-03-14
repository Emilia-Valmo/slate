import Editor from './components/Editor';
import AfterPlugin from './plugins/after';
import BeforePlugin from './plugins/before';
import cloneFragment from './utils/clone-fragment';
import findDOMNode from './utils/find-dom-node';
import findDOMRange from './utils/find-dom-range';
import findNode from './utils/find-node';
import findRange from './utils/find-range';
import getEventRange from './utils/get-event-range';
import getEventTransfer from './utils/get-event-transfer';
import setEventTransfer from './utils/set-event-transfer';

export * from './interfaces';

export {
    Editor,
    cloneFragment,
    findDOMNode,
    findDOMRange,
    findNode,
    findRange,
    getEventRange,
    getEventTransfer,
    setEventTransfer,
    AfterPlugin,
    BeforePlugin
};

export default {
    Editor,
    cloneFragment,
    findDOMNode,
    findDOMRange,
    findNode,
    findRange,
    getEventRange,
    getEventTransfer,
    setEventTransfer,
    AfterPlugin,
    BeforePlugin
};
