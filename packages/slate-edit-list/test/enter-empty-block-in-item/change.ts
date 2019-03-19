import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    return plugin.plugin.onKeyDown(
        createEvent({
            key: 'Enter'
        }),
        change,
        {}
    );
}
