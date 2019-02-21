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
      <paragraph>{"Try typing '(c)' in this block."}</paragraph>
      <paragraph>{"Try typing '> ' at the start of this block."}</paragraph>
      <paragraph>{"Try typing '### ' at the start of this block."}</paragraph>
      <paragraph>{"Try typing '- ' at the start of this block."}</paragraph>
      <paragraph>{"Try typing '---<enter>' in a new block."}</paragraph>
    </document>
  </value>
)
