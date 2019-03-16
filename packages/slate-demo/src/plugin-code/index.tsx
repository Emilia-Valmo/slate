import { Editor } from '@gitbook/slate-react';

import * as React from 'react';
import { Button, Toolbar } from '../components';

import PluginEditCode from '@gitbook/slate-edit-code';

import INITIAL_VALUE from './value';

const plugin = PluginEditCode();
const plugins = [plugin];

function renderNode(props) {
    const { node, children, attributes } = props;

    switch (node.type) {
        case 'code_block':
            return <pre {...attributes}>{children}</pre>;
        case 'code_line':
            return <div {...attributes}>{children}</div>;
        case 'paragraph':
            return <p {...attributes}>{children}</p>;
        case 'heading':
            return <h1 {...attributes}>{children}</h1>;
        default:
            return null;
    }
}

class CodeExample extends React.Component {
    public state = {
        value: INITIAL_VALUE
    };

    public onChange = ({ value }) => {
        this.setState({
            value
        });
    };

    public onToggleCode = () => {
        const { value } = this.state;

        this.onChange(
            plugin.changes.toggleCodeBlock(value.change(), 'paragraph').focus()
        );
    };

    public render() {
        const { value } = this.state;

        return (
            <div>
                <Toolbar>
                    <Button onClick={this.onToggleCode}>
                        {plugin.utils.isInCodeBlock(value)
                            ? 'Paragraph'
                            : 'Code Block'}
                    </Button>
                </Toolbar>
                <Editor
                    placeholder={'Enter some text...'}
                    plugins={plugins}
                    value={value}
                    onChange={this.onChange}
                    renderNode={renderNode}
                />
            </div>
        );
    }
}

export default CodeExample;
