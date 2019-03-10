/** @jsx h */

import h from '../hyperscript'

export default (
  <value>
    <document>
      <paragraph>Orphan</paragraph>
      <ul_list>
        <list_item>
          <paragraph>Valid item</paragraph>
        </list_item>
        <list_item>
          <paragraph>Direct child of another item</paragraph>
        </list_item>
      </ul_list>
    </document>
  </value>
)
