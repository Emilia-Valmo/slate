import { Value } from '@gitbook/slate';
import { Editor } from '@gitbook/slate-react';

import React from 'react';
import initialValue from './value.json';
import Video from './video';

/*
 * The images example.
 *
 * @type {Component}
 */

class Embeds extends React.Component {
    /*
     * Deserialize the raw initial value.
     *
     * @type {Object}
     */

    public state = {
        value: Value.fromJS(initialValue)
    };

    /*
     * Render the app.
     *
     * @return {Element} element
     */

    public render() {
        return (
            <Editor
                placeholder="Enter some text..."
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
        switch (props.node.type) {
            case 'video':
                return <Video {...props} />;
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

export default Embeds;
