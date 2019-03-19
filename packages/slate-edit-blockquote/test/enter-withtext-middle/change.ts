import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    const newChange = plugin.plugin.onKeyDown(
        createEvent({
            key: 'Enter'
        }),
        change,
        {}
    );

    expect(newChange).toBe(undefined);

    return change;
}
