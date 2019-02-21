/** @jsx h */
// eslint-disable-next-line import/no-extraneous-dependencies
import { createHyperscript } from '@gitbook/slate-hyperscript'

const h = createHyperscript({
  blocks: {
    heading: 'heading',
    paragraph: 'paragraph',
    'bulleted-list': 'bulleted-list',
    'numbered-list': 'numbered-list',
    'list-item': 'list-item',
  },
})

export default (
  <value>
    <document>
      <heading>Slate + List Edition</heading>
      <paragraph>
        This page is a basic example of Slate + slate-edit-list plugin. Press
        Enter in a list to create a new list item. Press Enter again to exit and
        Shift+Enter to create a paragraph in a list. The items at range are
        detected and highlighted, for demonstration purpose.
      </paragraph>
      <bulleted-list style={{ listStyleType: 'disc' }}>
        <list-item>
          <paragraph>First item in the list</paragraph>
        </list-item>
        <list-item>
          <paragraph>List item can contain blocks</paragraph>
          <heading>Here is a heading</heading>
          <paragraph>And another paragraph</paragraph>
        </list-item>
        <list-item>
          <paragraph>Third item in the list, with a nested list</paragraph>
          <numbered-list style={{ listStyleType: 'decimal' }}>
            <list-item>
              <paragraph>First item in the nested list</paragraph>
            </list-item>
            <list-item>
              <paragraph>Second item in the nested list</paragraph>
            </list-item>
          </numbered-list>
        </list-item>
      </bulleted-list>
      <paragraph>End paragraph</paragraph>
    </document>
  </value>
)
