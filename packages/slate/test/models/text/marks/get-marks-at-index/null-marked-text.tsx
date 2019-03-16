/* @jsx h */

import { Mark } from '@gitbook/slate';
import { Set } from 'immutable';
import h from '../../../../helpers/h';

export const input = (() => <b />)()[0];

export default function(t) {
    return t.getMarksAtIndex(0);
}

export const output = Set.of(Mark.create('bold'));
