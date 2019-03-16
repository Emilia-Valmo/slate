import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    const res = plugin.plugin.onKeyDown(
        createEvent({
            key: 'Backspace'
        }),
        change
    );

    expect(res).toBe(undefined);

    return change;
}
