/** @jsx h */

import { Mark, Data } from '../../../../..'
import h from '../../../../helpers/h'

export const input = <b />[0]

export default function(t) {
  return t.updateMark(0, 1, Mark.create('bold'), {
    data: Data.fromJS({ x: 1 }),
  })
}

export const output = input
