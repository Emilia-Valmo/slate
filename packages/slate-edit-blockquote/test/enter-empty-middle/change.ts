import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    plugin.onKeyDown(
        createEvent({
            key: 'Enter'
        }),
        change,
        {}
    );

    return change;
}
