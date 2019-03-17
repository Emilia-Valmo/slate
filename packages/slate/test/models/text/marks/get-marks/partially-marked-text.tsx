/* @jsx h */

import { Mark } from '@gitbook/slate';
import { Set } from 'immutable';
import h from '../../../../helpers/h';

export const input = (
    <text>
        <i>Cat</i>
        is
        <i>Cute</i>
    </text>
)[0];

export default function(t) {
    return t.getMarks();
}

export const output = Set.of(Mark.create('italic'));
