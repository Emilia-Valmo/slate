/* @jsx h */

import h from '../../../helpers/h'

// This tests the resulting selection when we insert a fragment
// that will be removed by normalization

export default function(change) {
  change.insertFragment(
    <document>
      <paragraph>fragment</paragraph>
      <link>this will be removed by normalization</link>
    </document>
  )
}

export const input = (
  <value>
    <document>
      <paragraph>
        word<cursor />
      </paragraph>
    </document>
  </value>
)

export const output = (
  <value>
    <document>
      <paragraph>
        wordfragment<cursor />
      </paragraph>
    </document>
  </value>
)
