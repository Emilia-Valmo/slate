import { Mark, Node } from '@gitbook/slate';
import { Record } from 'immutable';
import * as React from 'react';

import TOKEN_MARK from './TOKEN_MARK';

export interface OptionsFormat {
    // Determine which node should be highlighted
    onlyIn?: (node: Node) => boolean;
    // Returns the syntax for a node that should be highlighted
    getSyntax?: (node: Node) => string;
    // Render a highlighting mark in a highlighted node
    renderMark?: (mark: {
        mark: Mark;
        children: React.ReactNode;
    }) => React.ReactNode;
}

/*
 * Default filter for code blocks
 */

function defaultOnlyIn(node: Node): boolean {
    return node.object === 'block' && node.type === 'code_block';
}

/*
 * Default getter for syntax
 */

function defaultGetSyntax(node: Node): string {
    return 'javascript';
}

/*
 * Default rendering for marks
 */

function defaultRenderMark(props: {
    children: React.ReactNode;
    mark: Mark;
}): void | React.ReactNode {
    const { mark } = props;

    if (mark.type !== TOKEN_MARK) {
        return undefined;
    }

    const className = mark.data.get('className');
    return <span className={className}>{props.children}</span>;
}

/*
 * The plugin options
 */

class Options extends Record({
    onlyIn: defaultOnlyIn,
    getSyntax: defaultGetSyntax,
    renderMark: defaultRenderMark
}) {
    public onlyIn: (node: Node) => boolean;
    public getSyntax: (node: Node) => string;
    public renderMark: (props: {
        mark: Mark;
        children: React.ReactNode;
    }) => React.ReactNode;
}

export default Options;
