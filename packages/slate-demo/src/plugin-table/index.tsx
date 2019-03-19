import { Editor } from '@gitbook/slate-react';

import * as React from 'react';
import { Button, Toolbar } from '../components';

import PluginEditTable from '@gitbook/slate-edit-table';

import alignPlugin from './aligns';
import INITIAL_VALUE from './value';

const tablePlugin = PluginEditTable({
    typeTable: 'table',
    typeRow: 'table_row',
    typeCell: 'table_cell',
    typeContent: 'paragraph'
});

function renderNode(props) {
    switch (props.node.type) {
        case 'table':
            return <Table {...props} />;
        case 'table_row':
            return <TableRow {...props} />;
        case 'table_cell':
            return <TableCell {...props} />;
        case 'paragraph':
            return <Paragraph {...props} />;
        case 'heading':
            return <h1 {...props.attributes}>{props.children}</h1>;
        default:
            return null;
    }
}

const plugins = [tablePlugin.plugin, { renderNode }];

const TableContext = React.createContext(false);

class Table extends React.Component {
    public render() {
        const { attributes, children } = this.props;
        return (
            <TableContext.Provider value>
                <table>
                    <tbody {...attributes}>{children}</tbody>
                </table>
            </TableContext.Provider>
        );
    }
}

class TableRow extends React.Component {
    public render() {
        const { attributes, children } = this.props;
        return <tr {...attributes}>{children}</tr>;
    }
}

class TableCell extends React.Component {
    public render() {
        const { attributes, children, node } = this.props;

        const textAlign = node.get('data').get('align', 'left');

        return (
            <td style={{ textAlign }} {...attributes}>
                {children}
            </td>
        );
    }
}

class Paragraph extends React.Component {
    public static contextType = TableContext;

    public render() {
        const { attributes, children } = this.props;
        const isInTable = this.context;

        const style = isInTable ? { margin: 0 } : {};

        return (
            <p style={style} {...attributes}>
                {children}
            </p>
        );
    }
}

class TableExample extends React.Component {
    public state = {
        value: INITIAL_VALUE.setSchema([tablePlugin.schema, alignPlugin.schema])
    };

    public renderToolbar() {
        const { value } = this.state;
        const isInTable = tablePlugin.utils.isSelectionInTable(value);
        const isOutTable = tablePlugin.utils.isSelectionOutOfTable(value);

        return (
            <Toolbar>
                <Button active={isOutTable} onMouseDown={this.onInsertTable}>
                    Insert Table
                </Button>
                <Button active={isInTable} onMouseDown={this.onInsertColumn}>
                    Insert Column
                </Button>
                <Button active={isInTable} onMouseDown={this.onInsertRow}>
                    Insert Row
                </Button>
                <Button active={isInTable} onMouseDown={this.onRemoveColumn}>
                    Remove Column
                </Button>
                <Button active={isInTable} onMouseDown={this.onRemoveRow}>
                    Remove Row
                </Button>
                <Button active={isInTable} onMouseDown={this.onRemoveTable}>
                    Remove Table
                </Button>
                <br />
                <Button
                    active={isInTable}
                    onMouseDown={e => this.onSetAlign(e, 'left')}
                >
                    Set align left
                </Button>
                <Button
                    active={isInTable}
                    onMouseDown={e => this.onSetAlign(e, 'center')}
                >
                    Set align center
                </Button>
                <Button
                    active={isInTable}
                    onMouseDown={e => this.onSetAlign(e, 'right')}
                >
                    Set align right
                </Button>
            </Toolbar>
        );
    }

    public submitChange = fn => {
        this.onChange(this.state.value.change().call(fn));
    };

    public onChange = ({ value }) => {
        this.setState({
            value
        });
    };

    public onInsertTable = event => {
        event.preventDefault();
        this.submitChange(tablePlugin.changes.insertTable);
    };

    public onInsertColumn = event => {
        event.preventDefault();
        this.submitChange(tablePlugin.changes.insertColumn);
    };

    public onInsertRow = event => {
        event.preventDefault();
        this.submitChange(tablePlugin.changes.insertRow);
    };

    public onRemoveColumn = event => {
        event.preventDefault();
        this.submitChange(tablePlugin.changes.removeColumn);
    };

    public onRemoveRow = event => {
        event.preventDefault();
        this.submitChange(tablePlugin.changes.removeRow);
    };

    public onRemoveTable = event => {
        event.preventDefault();
        this.submitChange(tablePlugin.changes.removeTable);
    };

    public onSetAlign = (event, align) => {
        event.preventDefault();

        this.submitChange(change =>
            alignPlugin.changes.setColumnAlign(change, align)
        );
    };

    public render() {
        const { value } = this.state;
        return (
            <div>
                {this.renderToolbar()}
                <Editor
                    placeholder={'Enter some text...'}
                    plugins={plugins}
                    value={value}
                    onChange={this.onChange}
                />
            </div>
        );
    }
}

export default TableExample;
