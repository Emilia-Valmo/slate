import { Block, Schema, Value } from '@gitbook/slate';
import { Editor } from '@gitbook/slate-react';
import {
    CHILD_REQUIRED,
    CHILD_TYPE_INVALID
} from '@gitbook/slate-schema-violations';

import React from 'react';
import initialValue from './value.json';

/*
 * A simple schema to enforce the nodes in the Slate document.
 */
const schema = Schema.create({
    document: {
        nodes: [
            { types: ['title'], min: 1, max: 1 },
            { types: ['paragraph'], min: 1 }
        ],
        normalize: (change, violation, { node, child, index }) => {
            switch (violation) {
                case CHILD_TYPE_INVALID: {
                    return change.setNodeByKey(
                        child.key,
                        index === 0 ? 'title' : 'paragraph'
                    );
                }
                case CHILD_REQUIRED: {
                    const block = Block.create(
                        index === 0 ? 'title' : 'paragraph'
                    );
                    return change.insertNodeByKey(node.key, index, block);
                }
            }
        }
    }
});

/*
 * The Forced Layout example.
 */
class ForcedLayout extends React.Component {
    /*
     * Deserialize the initial editor value.
     */

    public state = {
        value: Value.fromJS(initialValue).setSchema(schema)
    };

    /*
     * Render the editor.
     */

    public render() {
        return (
            <Editor
                placeholder="Enter a title..."
                value={this.state.value}
                onChange={this.onChange}
                renderNode={this.renderNode}
            />
        );
    }

    /*
     * Render a Slate node.
     *
     * @param {Object} props
     * @return {Element}
     */

    public renderNode = props => {
        const { attributes, children, node } = props;

        switch (node.type) {
            case 'title':
                return <h2 {...attributes}>{children}</h2>;
            case 'paragraph':
                return <p {...attributes}>{children}</p>;
        }
    };

    /*
     * On change.
     *
     * @param {Change} change
     */

    public onChange = ({ value }) => {
        this.setState({ value });
    };
}

/*
 * Export.
 */

export default ForcedLayout;
