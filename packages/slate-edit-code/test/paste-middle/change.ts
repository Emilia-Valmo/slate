import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    return plugin.plugin.onPaste(
        createEvent({
            clipboardData: {
                // Simulate a text data from IE
                // https://github.com/ianstormtaylor/slate/blob/master/packages/slate-react/src/utils/get-event-transfer.js#L161
                getData: () => 'Yes\nNo\nQuestion?'
            }
        }),
        change,
        {}
    );
}
