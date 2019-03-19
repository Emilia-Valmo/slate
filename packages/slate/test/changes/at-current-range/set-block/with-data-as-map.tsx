/* @jsx h */

import { Data } from '@gitbook/slate';
import h from '../../../helpers/h';

export default function(change) {
    change.setBlocks({
        type: 'code',
        data: Data.create({ thing: 'value' })
    });
}

export const input = (
    <value>
        <document>
            <paragraph>
                <cursor />
                word
            </paragraph>
        </document>
    </value>
);

export const output = (
    <value>
        <document>
            <code thing="value">
                <cursor />
                word
            </code>
        </document>
    </value>
);
