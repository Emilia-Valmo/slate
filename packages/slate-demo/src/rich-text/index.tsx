import { Value } from '@gitbook/slate';
import RawPastePlugin from '@gitbook/slate-raw-paste';
import { Editor } from '@gitbook/slate-react';

import { isKeyHotkey } from 'is-hotkey';
import React from 'react';
import { Button, Icon, Toolbar } from '../components';
import { renderMark, renderNode } from '../rendering';
import initialValue from './value.json';

/*
 * Define the default node type.
 *
 * @type {String}
 */

const DEFAULT_NODE = 'paragraph';

/*
 * Define hotkey matchers.
 *
 * @type {Function}
 */

const isBoldHotkey = isKeyHotkey('mod+b');
const isItalicHotkey = isKeyHotkey('mod+i');
const isUnderlinedHotkey = isKeyHotkey('mod+u');
const isCodeHotkey = isKeyHotkey('mod+`');

const rawPastePlugin = RawPastePlugin();

/*
 * The rich text example.
 *
 * @type {Component}
 */

class RichTextExample extends React.Component {
    /*
     * Deserialize the initial editor value.
     *
     * @type {Object}
     */

    public state = {
        value: Value.fromJS(initialValue)
    };

    /*
     * Check if the current selection has a mark with `type` in it.
     *
     * @param {String} type
     * @return {Boolean}
     */

    public hasMark = type => {
        const { value } = this.state;
        return value.activeMarks.some(mark => mark.type === type);
    };

    /*
     * Check if the any of the currently selected blocks are of `type`.
     *
     * @param {String} type
     * @return {Boolean}
     */

    public hasBlock = type => {
        const { value } = this.state;
        return value.blocks.some(node => node.type === type);
    };

    /*
     * Render.
     *
     * @return {Element}
     */

    public render() {
        return (
            <div>
                <Toolbar>
                    {this.renderMarkButton('bold', 'format_bold')}
                    {this.renderMarkButton('italic', 'format_italic')}
                    {this.renderMarkButton('underlined', 'format_underlined')}
                    {this.renderMarkButton('code', 'code')}
                    {this.renderBlockButton('heading-one', 'looks_one')}
                    {this.renderBlockButton('heading-two', 'looks_two')}
                    {this.renderBlockButton('blockquote', 'format_quote')}
                    {this.renderBlockButton(
                        'numbered-list',
                        'format_list_numbered'
                    )}
                    {this.renderBlockButton(
                        'bulleted-list',
                        'format_list_bulleted'
                    )}
                </Toolbar>
                <Editor
                    spellCheck
                    autoFocus
                    placeholder="Enter some rich text..."
                    value={this.state.value}
                    plugins={[rawPastePlugin]}
                    onChange={this.onChange}
                    onKeyDown={this.onKeyDown}
                    renderNode={renderNode}
                    renderMark={renderMark}
                />
            </div>
        );
    }

    /*
     * Render a mark-toggling toolbar button.
     *
     * @param {String} type
     * @param {String} icon
     * @return {Element}
     */

    public renderMarkButton = (type, icon) => {
        const isActive = this.hasMark(type);

        return (
            <Button
                active={isActive}
                onMouseDown={event => this.onClickMark(event, type)}
            >
                <Icon>{icon}</Icon>
            </Button>
        );
    };

    /*
     * Render a block-toggling toolbar button.
     *
     * @param {String} type
     * @param {String} icon
     * @return {Element}
     */

    public renderBlockButton = (type, icon) => {
        let isActive = this.hasBlock(type);

        if (['numbered-list', 'bulleted-list'].includes(type)) {
            const { value } = this.state;
            const parent = value.document.getParent(value.blocks.first().key);
            isActive =
                this.hasBlock('list-item') && parent && parent.type === type;
        }

        return (
            <Button
                active={isActive}
                onMouseDown={event => this.onClickBlock(event, type)}
            >
                <Icon>{icon}</Icon>
            </Button>
        );
    };

    /*
     * On change, save the new `value`.
     *
     * @param {Change} change
     */

    public onChange = ({ value }) => {
        this.setState({ value });
    };

    /*
     * On key down, if it's a formatting command toggle a mark.
     *
     * @param {Event} event
     * @param {Change} change
     * @return {Change}
     */

    public onKeyDown = (event, change) => {
        let mark;

        if (isBoldHotkey(event)) {
            mark = 'bold';
        } else if (isItalicHotkey(event)) {
            mark = 'italic';
        } else if (isUnderlinedHotkey(event)) {
            mark = 'underlined';
        } else if (isCodeHotkey(event)) {
            mark = 'code';
        } else {
            return;
        }

        event.preventDefault();
        change.toggleMark(mark);
        return true;
    };

    /*
     * When a mark button is clicked, toggle the current mark.
     *
     * @param {Event} event
     * @param {String} type
     */

    public onClickMark = (event, type) => {
        event.preventDefault();
        const { value } = this.state;
        const change = value.change().toggleMark(type);
        this.onChange(change);
    };

    /*
     * When a block button is clicked, toggle the block type.
     *
     * @param {Event} event
     * @param {String} type
     */

    public onClickBlock = (event, type) => {
        event.preventDefault();
        const { value } = this.state;
        const change = value.change();
        const { document } = value;

        // Handle everything but list buttons.
        if (type !== 'bulleted-list' && type !== 'numbered-list') {
            const isActive = this.hasBlock(type);
            const isList = this.hasBlock('list-item');

            if (isList) {
                change
                    .setBlocks(isActive ? DEFAULT_NODE : type)
                    .unwrapBlock('bulleted-list')
                    .unwrapBlock('numbered-list');
            } else {
                change.setBlocks(isActive ? DEFAULT_NODE : type);
            }
        } else {
            // Handle the extra wrapping required for list buttons.
            const isList = this.hasBlock('list-item');
            const isType = value.blocks.some(block => {
                return !!document.getClosest(
                    block.key,
                    parent => parent.type === type
                );
            });

            if (isList && isType) {
                change
                    .setBlocks(DEFAULT_NODE)
                    .unwrapBlock('bulleted-list')
                    .unwrapBlock('numbered-list');
            } else if (isList) {
                change
                    .unwrapBlock(
                        type === 'bulleted-list'
                            ? 'numbered-list'
                            : 'bulleted-list'
                    )
                    .wrapBlock(type);
            } else {
                change.setBlocks('list-item').wrapBlock(type);
            }
        }

        this.onChange(change);
    };
}

/*
 * Export.
 */

export default RichTextExample;
