import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    const ret = plugin.onKeyDown(
        createEvent({
            key: 'Enter',
            shiftKey: true
        }),
        change,
        {}
    );

    expect(ret == null).toBe(true);
}
