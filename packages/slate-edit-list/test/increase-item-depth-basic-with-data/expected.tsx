/* @jsx h */

import h from '../hyperscript';

export default (
    <value>
        <document>
            <ul_list style={{ listStyleType: 'disc' }}>
                <list_item>
                    <paragraph>First item</paragraph>
                    <ul_list style={{ listStyleType: 'disc' }}>
                        <list_item>
                            <paragraph>Second item</paragraph>
                        </list_item>
                    </ul_list>
                </list_item>
            </ul_list>
        </document>
    </value>
);
