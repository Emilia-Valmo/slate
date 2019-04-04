import { Value } from '@gitbook/slate';
import AutoReplace from '@gitbook/slate-auto-replace';
import { Editor } from '@gitbook/slate-react';
import React from 'react';

import { renderMark, renderNode } from '../rendering';
import initialValue from './value';

/*
 * Example.
 *
 * @type {Component}
 */

class Example extends React.Component {
    public plugins = [
        AutoReplace({
            onInput: '*',
            before: /\*\*[^*]+?\*$/, // non-greedy
            transform: (change, e, matches) => {
                if (hasMark(change.value, ['bold', 'code'])) {
                    return change.insertText('*'); // act as a noop
                }

                const text = matches.before[0].slice(2).slice(0, -1); // inside the *..*
                return change
                    .deleteBackward(text.length + 3) // remove the typed text
                    .addMark('bold')
                    .insertText(text)
                    .removeMark('bold');
            }
        }),
        AutoReplace({
            onInput: /`/,
            before: /`[^`]+?$/, // non-greedy
            transform: (change, e, matches) => {
                if (hasMark(change.value, 'code')) {
                    return change.insertText('`'); // act as a noop
                }

                const text = matches.before[0].slice(1); // inside the `...`
                return change
                    .deleteBackward(text.length + 1) // remove the typed text
                    .addMark('code')
                    .insertText(text)
                    .removeMark('code');
            }
        }),
        AutoReplace({
            onInput: ')',
            before: /(\(c)$/i,
            transform: transform => transform.insertText('©')
        }),
        AutoReplace({
            onInput: ' ',
            before: /^(>)$/,
            transform: transform => transform.setBlocks('blockquote')
        }),
        AutoReplace({
            onInput: ' ',
            before: /^(-)$/,
            transform: transform =>
                transform.setBlocks('list-item').wrapBlock('bulleted-list')
        }),
        AutoReplace({
            onInput: ' ',
            before: /^(#{1,6})$/,
            transform: (transform, event, matches) => {
                const [hashes] = matches.before;
                const level = hashes.length;

                const TAGS = {
                    1: 'heading-one',
                    2: 'heading-two',
                    3: 'heading-three'
                };
                return transform.setBlocks({
                    type: TAGS[level] || TAGS[3]
                });
            }
        }),
        AutoReplace({
            onHotkey: 'enter',
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
                renderNode={renderNode}
                renderMark={renderMark}
            />
        );
    };
}

/*
 * True if selection contains one of the given mark
 */
function hasMark(value: Value, type: string | string[]): boolean {
    const types = typeof type === 'string' ? [type] : type;
    return value.marks.some(mark => types.includes(mark.type));
}

export default Example;
