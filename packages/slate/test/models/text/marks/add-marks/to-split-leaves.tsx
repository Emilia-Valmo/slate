/* @jsx h */

import { Mark } from '@gitbook/slate';
import h from '../../../../helpers/h';

export const input = (
    <text>
        Cat i<b>s Cute</b>
    </text>
)[0];

export default function(t) {
    return t.addMark(3, 4, Mark.create('italic'));
}

export const output = (
    <text>
        Cat<i> i</i>
        <i>
            <b>s </b>
        </i>
        <b>Cute</b>
    </text>
)[0];
