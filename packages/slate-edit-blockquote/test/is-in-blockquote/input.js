/** @jsx h */ import h from '../hyperscript'

export default (
  <value>
    <document>
      <paragraph>
        <text key="noquote">Not in a quote</text>
      </paragraph>
      <blockquote>
        <paragraph>
          <text key="quote">P1</text>
        </paragraph>
        <ul_list>
          <list_item>
            <text key="quotedeep">Deep</text>
          </list_item>
        </ul_list>
      </blockquote>
    </document>
  </value>
)
