import AutoReplace from '@gitbook/slate-auto-replace';
import { Editor } from '@gitbook/slate-react';

import React from 'react';
import initialValue from './value';

/*
 * Example.
 *
 * @type {Component}
 */

class Example extends React.Component {
    public plugins = [
        AutoReplace({
            trigger: 'space',
            before: /(\(c\))$/i,
            transform: transform => transform.insertText('©')
        }),
        AutoReplace({
            trigger: 'space',
            before: /^(>)$/,
            transform: transform => transform.setBlocks('blockquote')
        }),
        AutoReplace({
            trigger: 'space',
            before: /^(-)$/,
            transform: transform => transform.setBlocks('li').wrapBlock('ul')
        }),
        AutoReplace({
            trigger: 'space',
            before: /^(#{1,6})$/,
            transform: (transform, event, matches) => {
                const [hashes] = matches.before;
                const level = hashes.length;
                return transform.setBlocks({
                    type: 'h',
                    data: { level }
                });
            }
        }),
        AutoReplace({
            trigger: 'enter',
            before: /^(-{3})$/,
            transform: transform => {
                return transform.setBlocks({
                    type: 'hr',
                    isVoid: true
                });
            }
        })
    ];

    public state = {
        value: initialValue
    };

    public onChange = ({ value }) => {
        this.setState({ value });
    };

    public render = () => {
        return (
            <Editor
                value={this.state.value}
                plugins={this.plugins}
                onChange={this.onChange}
                renderNode={this.renderNode}
            />
        );
    };

    public renderNode = props => {
        const { node, attributes, children } = props;

        switch (node.type) {
            case 'blockquote':
                return (
                    <blockquote {...attributes}>
                        <p>{children}</p>
                    </blockquote>
                );
            case 'hr':
                return <hr />;
            case 'ul':
                return <ul {...attributes}>{children}</ul>;
            case 'li':
                return <li {...attributes}>{children}</li>;
            case 'h':
                const level = node.data.get('level');
                const Tag = `h${level}`;
                return <Tag {...attributes}>{children}</Tag>;
        }
    };
}

/*
 * Export.
 */

export default Example;
