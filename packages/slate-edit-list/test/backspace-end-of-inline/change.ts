import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    plugin.onKeyDown(
        createEvent({
            key: 'Backspace'
        }),
        change,
        {}
    );

    return change;
}
