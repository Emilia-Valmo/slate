/* @jsx h */

import { Mark } from '@gitbook/slate';
import { Set } from 'immutable';
import h from '../../../../helpers/h';

export const input = (
    <text>
        <b>
            <i>Cat is </i>
            Cute
        </b>
    </text>
)[0];

export default function(t) {
    return t.getActiveMarks();
}

export const output = Set.of(Mark.create('bold'));
