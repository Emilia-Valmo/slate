import { Value } from '@gitbook/slate';
import { Editor } from '@gitbook/slate-react';

import React from 'react';
import styled from 'react-emotion';
import { Button, Icon, Toolbar } from '../components';
import initialValue from './value.json';

/*
 * A styled emoji inline component.
 *
 * @type {Component}
 */

const Emoji = styled('span')`
    outline: ${props => (props.selected ? '2px solid blue' : 'none')};
`;

/*
 * Emojis.
 *
 * @type {Array}
 */

const EMOJIS = [
    '😃',
    '😬',
    '😂',
    '😅',
    '😆',
    '😍',
    '😱',
    '👋',
    '👏',
    '👍',
    '🙌',
    '👌',
    '🙏',
    '👻',
    '🍔',
    '🍑',
    '🔑'
];

/*
 * No ops.
 *
 * @type {Function}
 */

const noop = e => e.preventDefault();

/*
 * The links example.
 *
 * @type {Component}
 */

class Emojis extends React.Component {
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
            <div>
                <Toolbar>
                    {EMOJIS.map((emoji, i) => (
                        <Button
                            key={i}
                            onMouseDown={e => this.onClickEmoji(e, emoji)}
                        >
                            <Icon>{emoji}</Icon>
                        </Button>
                    ))}
                </Toolbar>
                <Editor
                    placeholder="Write some 😍👋🎉..."
                    value={this.state.value}
                    onChange={this.onChange}
                    renderNode={this.renderNode}
                />
            </div>
        );
    }

    /*
     * Render a Slate node.
     *
     * @param {Object} props
     * @return {Element}
     */

    public renderNode = props => {
        const { attributes, children, node, isFocused } = props;

        switch (node.type) {
            case 'paragraph': {
                return <p {...attributes}>{children}</p>;
            }
            case 'emoji': {
                const code = node.data.get('code');
                return (
                    <Emoji
                        {...props.attributes}
                        selected={isFocused}
                        contentEditable={false}
                        onDrop={noop}
                    >
                        {code}
                    </Emoji>
                );
            }
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

    /*
     * When clicking a emoji, insert it
     *
     * @param {Event} e
     */

    public onClickEmoji = (e, code) => {
        e.preventDefault();
        const { value } = this.state;
        const change = value.change();

        change
            .insertInline({
                type: 'emoji',
                isVoid: true,
                data: { code }
            })
            .collapseToStartOfNextText()
            .focus();

        this.onChange(change);
    };
}

/*
 * Export.
 */

export default Emojis;
