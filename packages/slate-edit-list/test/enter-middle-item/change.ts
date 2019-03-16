import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    return plugin.onKeyDown(
        createEvent({
            key: 'Enter'
        }),
        change,
        {}
    );
}
