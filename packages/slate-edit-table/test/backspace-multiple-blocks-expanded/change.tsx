import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    const result = plugin.onKeyDown(
        createEvent({
            key: 'Backspace'
        }),
        change
    );

    expect(result).toBe(undefined);

    return change;
}
